import express from "express";
import { putAttachment, getAttachment } from "../controllers/attachments.js";
import { upload } from "../middlewares/multer.js";
const router = express.Router();

// router.get("/", (req, res) => {
//   res.send("Hello from attachments");
// })
//
// router.get('/:id', (req, res) => {
//   const params = req.params;
//   res.json({
//     params: params
//   })
// })

router.get("/", getAttachment);

router.post("/", upload.single('file'), putAttachment);

export default router;
