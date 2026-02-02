import prisma from "../config/prisma-signleton.js";

export const updateCardOrder = async (req, res) => {
  console.log("hello World");
  const { boardId, sourceListId, destinationListId, draggedCardId, destinationCardIds } = req.body;
  console.log("userId in updateCardOrder", req.user);
  const { userId } = req.user;

  if (!destinationCardIds || !Array.isArray(destinationCardIds)) {
    console.error(" Missing or invalid destinationCardIds");
    return res.status(400).json({ error: "Invalid data provided" });
  }

  try {
    console.log(`Reordering ${destinationCardIds.length} cards in list ${destinationListId}`);

    const transactionResponses = await prisma.$transaction(async (tx) => {
      if (sourceListId !== destinationListId) {
        const response = await tx.card.update({
          where: { id: draggedCardId },
          data: { listId: destinationListId }
        });
        console.log("response drag", response);
      }
      console.log("destinationCardIds:", destinationCardIds);

      for (let i = 0; i < destinationCardIds.length; i++) {
        const response = await tx.card.update({
          where: { id: destinationCardIds[i] },
          data: { order: i }
        });
        console.log("udated order:", response);
      }
    });
    console.log("trannsaction Response:", transactionResponses);

    console.log("Reorder successful");
    return res.status(200).json({ message: "Order updated" });

  } catch (error) {
    console.error(" Reorder FAILED:", error.message);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: "One or more cards not found in DB" });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
};
