import express from "express";
import pageController from "../controllers/page.controller.js";

const router =express.Router();

router.post("/pages",pageController.createPage);
router.get("/pages",pageController.getPages);   

export default router;