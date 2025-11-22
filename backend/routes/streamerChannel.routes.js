import express from "express";
import { listarCanales, registrarCanal } from "../controllers/streamerChannel.controller.js";

const router = express.Router();

router.get("/", listarCanales);
router.post("/", registrarCanal);

export default router;
