import { uploadImage } from "../controllers/imageController";
import { Router } from "express";
const router = Router();

router.post("/", uploadImage);

export default router;
