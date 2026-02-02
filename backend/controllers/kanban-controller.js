import prisma from "../config/prisma-signleton.js";
import { deleteAttachmentsFunction } from "./newAttachments.js";

export const createBoard = async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user.userId; // Retrieved from your auth middleware

    const accountType = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        account: true,
        ownedBoards: true
      }
    })
    console.log("accountType:", accountType);

    if (!accountType) {
      return res.status(404).json({
        error: "User not found"
      })
    }

    if (accountType && accountType.account === 'FREE' && accountType?.ownedBoards?.length > 10) {
      console.log("Free limit reached");
      return res.status(408).json({
        error: "Free acount can have maximum of 10 boards get an upgrade ",
      })
    }

    const newBoard = await prisma.board.create({
      data: {
        title: title || "Untitled Board",
        owner_id: userId
      }
    });
    res.status(201).json(newBoard);
    res.status(201);
  } catch (error) {
    console.error("Create Board Error:", error);
    res.status(500).json({ error: "Failed to create board" });
  }
};

// Get All Boards (Owned + Shared)
export const getBoards = async (req, res) => {
  console.log("getBoaars userid:", req.user);
  try {
    const userId = req.user.userId;
    console.log("userId:", userId);

    const boards = await prisma.board.findMany({
      where: {
        OR: [
          { owner_id: userId }, //self owned
          { members: { some: { userId: userId } } } // shred owned
        ]
      },
      include: {
        lists: {
          include: { cards: true }
        },
        members: true
      }
    });

    res.json(boards);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch boards" });
  }
};

export const getBoard = async (req, res) => {
  const boardId = req.params.id;
  console.log("boardId", boardId);
  try {
    const board = await prisma.board.findUnique({
      where: {
        id: boardId
      },
      include: {
        lists: {
          include: {
            cards: {
              include: {
                attachments: true
              }
            }
          }
        },
        members: true
      }
    })
    if (board) {
      console.log("board Found");
      res.status(200).json({
        board
      })
    }

  } catch (error) {
    console.error("getBoard error:", error);
    res.status(404).json({
      error: "Not found board"
    })
  }
}

// Update Board (Owner Only)
export const updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.user.userId;

    // Check ownership before updating
    const board = await prisma.board.findUnique({ where: { id } });

    if (!board) return res.status(404).json({ error: "Board not found" });
    if (board.owner_id !== userId) return res.status(403).json({ error: "Unauthorized" });

    const updatedBoard = await prisma.board.update({
      where: { id },
      data: { title }
    });

    res.json(updatedBoard);
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
};

// Delete Board (Owner Only)
export const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const board = await prisma.board.findUnique({ where: { id } });

    if (!board) return res.status(404).json({ error: "Board not found" });
    if (board.owner_id !== userId) return res.status(403).json({ error: "Only the owner can delete this board" });

    await prisma.board.delete({ where: { id } });

    res.json({ message: "Board deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
};


export const createList = async (req, res) => {
  try {
    const { title, boardId } = req.body;
    const userId = req.user.userId;

    // 1. Verify user has access to this board
    const hasAccess = await prisma.board.findFirst({
      where: {
        id: boardId,
        OR: [
          { owner_id: userId },
          {
            members: {
              some: {
                userId: userId,
                permission: "READ_WRITE"
              }
            }
          }
        ]
      },
      include: {
        members: true
      }
    });
    console.log("hadAccess:", hasAccess);

    if (!hasAccess) return res.status(403).json({ error: "You do not have access to this board" });

    const newList = await prisma.list.create({
      data: {
        title,
        boardId
      }
    });

    res.status(201).json(newList);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create list" });
  }
};

export const deleteList = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user;
    console.log("userId", userId);
    console.log("list id in deleteList:", id);
    if (!id) {
      throw new Error("id of list not provided");
    }
    //check permission
    const hasAccess = await prisma.board.findFirst({
      where: {
        id: boardId,
        OR: [
          { owner_id: userId },
          {
            members: {
              some: {
                userId: userId,
                permission: "READ_WRITE"
              }
            }
          }
        ]
      },
      include: {
        members: true
      }
    });
    console.log("hadAccess:", hasAccess);


    const relatedAttachments = await prisma.attachments.findMany({
      where: {
        card: {
          listId: id
        }
      },
      select: {
        fileKey: true
      }
    })

    // listRelatedAttachments: [ { fileKey: 'f883ea15-cb66-4fd1-9f52-ca442a9faa58-alyf_log.jpg' } ]
    console.log("listRelatedAttachments:", relatedAttachments);
    if (relatedAttachments && relatedAttachments.length > 0) {
      const delteAttachmentResponse = await deleteAttachmentsFunction(relatedAttachments.map((attachment) => attachment?.fileKey));
      console.log("deleteAttachmentsFunctionResponse:", delteAttachmentResponse);
      if (delteAttachmentResponse instanceof Error) {
        throw new Error(delteAttachmentResponse);
      }
    } else {
      console.log("no deleted Attachments");
    }

    await prisma.list.delete({ where: { id } });
    return res.stauts(200).json({ message: "List deleted" });
  } catch (error) {
    res.status(500).json({ error: `Failed to delete List ${error}` });
  }
};


export const createCard = async (req, res) => {
  console.log("createCard");
  try {
    const { title, description, listId, dueDate } = req.body;

    const newCard = await prisma.card.create({
      data: {
        title,
        description,
        listId,
        dueDate: dueDate ? new Date(dueDate) : null
      }
    });

    res.status(201).json(newCard);
  } catch (error) {
    res.status(500).json({ error: "Failed to create card" });
  }
};

export const updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, listId, dueDate } = req.body;

    const updatedCard = await prisma.card.update({
      where: { id },
      data: {
        title,
        description,
        listId, // Sending a new listId handles "Drag and Drop" movement
        dueDate: dueDate ? new Date(dueDate) : undefined
      }
    });

    res.json(updatedCard);
  } catch (error) {
    res.status(500).json({ error: "Failed to update card" });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const { id } = req.params;
    const getRelatedAttachments = await prisma.attachments.findMany({
      where: {
        cardId: id
      }
    })
    console.log("getRelatedAttachments:", getRelatedAttachments);
    // getRelatedAttachments:
    // {
    //   id: '-4fce-a218-da0873172cdc',
    //   fileName: '.jpg',
    //   fileKey: '4fbc6f2c3e-4d19-9cde--.jpg',
    //   fileType: 'image/jpeg',
    //   cardId: 'd8f4012b-a0-4de6-abae-3c1ea9aabe3d',
    //   createdAt: 202-0-054:12.023Z
    // }
    //]

    if (getRelatedAttachments && getRelatedAttachments.length > 0) {
      const delteAttachmentResponse = await deleteAttachmentsFunction(getRelatedAttachments.map((attachment) => attachment?.fileKey));
      console.log("deleteAttachmentsFunctionResponse:", delteAttachmentResponse);
      if (delteAttachmentResponse instanceof Error) {
        throw new Error(delteAttachmentResponse);
      }
    } else {
      console.log("no deleted Attachments");
    }
    const deleteCardResponse = await prisma.card.delete({ where: { id } });
    console.log("deleteCardResponse:", deleteCardResponse);
    return res.json({ message: `${deleteCardResponse} deleted ` });
  } catch (error) {
    return res.status(500).json({ "Failed to delete card": error });
  }
};
