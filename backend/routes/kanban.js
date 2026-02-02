import express from "express";
import {
  createBoard, getBoards, getBoard, updateBoard, deleteBoard,
  createList, deleteList,
  createCard, updateCard, deleteCard
} from "../controllers/kanban-controller.js";
import authMiddleware from "../middlewares/auth.js"; // Your existing middleware
import { updateCardOrder } from "../controllers/cards.js";
import { deleteAttachment, getAttachmentUrl, uploadAttachment } from "../controllers/newAttachments.js";
import { upload } from "../middlewares/multer.js";
import { checkPermissionsForExistingBoard } from "../middlewares/permissions.js";

const router = express.Router();

// Apply middleware to all routes in this file
router.use(authMiddleware);

//board routes
router.get("/boards", getBoards);
router.get("/boards/:id", getBoard)
router.post("/boards", createBoard);
router.put("/boards/:id", updateBoard);
router.delete("/boards/:id", deleteBoard);

// --- LIST ROUTES ---
router.post("/lists", createList);
router.delete("/lists/:id", deleteList);

// --- CARD ROUTES ---
router.post("/cards", createCard);
router.put("/cards/reorder", checkPermissionsForExistingBoard, updateCardOrder);
router.put("/cards/:id", updateCard);
router.delete("/cards/:id", checkPermissionsForExistingBoard, deleteCard);

//attachments
router.post("/attachments", upload.single('file'), uploadAttachment);
router.delete("/attachments/:fileKey", deleteAttachment);
router.get("/attachments/url", getAttachmentUrl)

export default router;
