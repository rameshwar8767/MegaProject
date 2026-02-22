import { Router } from "express";
import {
    createSubTask,
    getSubTaskById,
    getSubTasksByTask,
    updateSubTask,
    deleteSubTask
} from "../controllers/subtask.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

/*
    All routes are protected
    because SubTasks belong to logged-in users
*/

// Create SubTask
router.post("/", verifyJWT, createSubTask);

// Get SubTask by ID
router.get("/:id", verifyJWT, getSubTaskById);

// Get All SubTasks of a Task
router.get("/task/:taskId", verifyJWT, getSubTasksByTask);

// Update SubTask
router.put("/:id", verifyJWT, updateSubTask);

// Delete SubTask
router.delete("/:id", verifyJWT, deleteSubTask);

export default router;