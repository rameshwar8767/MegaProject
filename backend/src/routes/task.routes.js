import { Router } from "express";
import {
    createTask,
    getTaskById,
    getTasks,
    getTasksAssignedByUser,
    getTasksAssignedToUser,
    updateTask,
    updateTaskStatus,
    addTaskAttachment,
    removeTaskAttachment,
    deleteTask
} from "../controllers/task.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {upload} from "../middlewares/multer.middlewares.js"; // if you're using multer

const router = Router();

router.use(verifyJWT);

router.post("/", upload.array("attachments"), createTask);

router.get("/assigned-by/:userId", getTasksAssignedByUser);
router.get("/assigned-to/:userId", getTasksAssignedToUser);

router.get("/", getTasks);

router.patch("/:taskId/status", updateTaskStatus);
router.post("/:taskId/attachments", upload.array("attachments"), addTaskAttachment);
router.delete("/:taskId/attachments/:attachmentId", removeTaskAttachment);

router.get("/:taskId", getTaskById);
router.put("/:taskId", upload.array("attachments"), updateTask);
router.delete("/:taskId", deleteTask);
export default router;