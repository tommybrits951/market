import { Router } from "express";
import { register, login, refresh } from "../controllers/userController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/refresh", refresh);
export default router;
