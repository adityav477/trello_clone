import prisma from "../config/prisma-signleton.js";

export const checkPermissionsForExistingBoard = async (req, res, next) => {
  const { userId } = req.user;
  const { boardId } = req.body;
  console.log("req.body:", req.body);

  console.log("userId:", userId, "boardId:", boardId);

  if (!userId) {
    return res.status(404).json({
      error: "user Not found"
    })
  } else if (!boardId) {
    return res.status(404).json({
      error: "Board id not found"
    })
  }

  try {
    const hasAccess = await prisma.board.findUnique({
      where: {
        id: boardId,
        OR: [
          { owner_id: userId },
          {
            members: {
              some: {
                userId: userId,
              },
            }
          }
        ]
      },
      include: {
        members: {
          select: {
            permission: true
          }
        }
      }
    })
    console.log("hasAccess in middleware:", hasAccess);
    // for non shared lists
    // hasAccess in middleware: {
    //   id: '1ebe314d-fe40-4489-98a9-85ad114be35e',
    //   owner_id: 'b49c818c-03b0-4ad6-8814-8f0ea838ed5e',
    //   title: "Alice's Private Board 6",
    //   members: []
    // }
    // for shared boards
    // hasAccess in middleware: {
    //   id: '6d14b629-80f4-4080-b868-4e2465e81493',
    //   owner_id: 'b49c818c-03b0-4ad6-8814-8f0ea838ed5e',
    //   title: 'Project Alpha (Shared)',
    //   members: [ { permission: 'READ_WRITE' } ]
    // }

    if (!hasAccess) {
      return res.status(405).json({
        error: "Not allowed to delete"
      })
    } else if (hasAccess.owner_id === userId || hasAccess.members[0].permission === "READ_WRITE") {
      req.permission = "READ_WRITE";
    } else if (hasAccess.members[0].permission === "READ_ONLY") {
      req.permission = "READ_ONLY";
    }
    next();
  } catch (error) {
    console.log("error:", error);
    return res.status(500).json({
      error
    })

  }

  res.status(200).json({
    message: "Good Boy",
  })
}



