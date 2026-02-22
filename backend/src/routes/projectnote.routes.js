import { Router } from "express";
import {
    getProjectNotes,
    getProjectNoteById,
    createProjectNote,
    updateProjectNote,
    deleteProjectNote
} from "../controllers/projectnote.controllers.js";

const router = Router({ mergeParams: true });

router.get("/", getProjectNotes);
router.post("/", createProjectNote);
router.get("/:noteId", getProjectNoteById);
router.put("/:noteId", updateProjectNote);
router.delete("/:noteId", deleteProjectNote);

export default router;