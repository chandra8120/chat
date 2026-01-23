import express from "express";

import userController from "../controllers/user.controller.js";
import authMiddleware from "../auth.js";

const router = express.Router();

router.post("/admin-login", userController.adminLogin);

router.post("/signup", userController.signup);

router.post("/login", userController.login);

router.patch("/update", authMiddleware,userController.updateProfile);

export default router;