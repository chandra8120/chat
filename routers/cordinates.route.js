import express from "express";
import cordinatesController from "../controllers/cordinates.controller.js";
const router = express.Router();


router.post("/create", cordinatesController.createCordinate);
router.get("/all", cordinatesController.getAllCordinates);

export default router;