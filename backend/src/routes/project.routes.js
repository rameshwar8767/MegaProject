import { Router } from "express";
import {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    addMemberToProject,
    removeMemberFromProject,
    getProjectMembers,
    updateProjectMemberRole,
    deleteProjectMember
} from "../controllers/project.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";
import projectNoteRouter from "./projectnote.routes.js";
const router = Router();



router.use(verifyJWT);
router.use("/:projectId/notes", projectNoteRouter);

// Create project
router.post("/", createProject);

// Get all projects (for logged in user)
router.get("/", getAllProjects);

// Get single project
router.get("/:projectId", getProjectById);

// Update project
router.put("/:projectId", updateProject);

// Delete project
router.delete("/:projectId", deleteProject);



// Get all project members
router.get("/:projectId/members", getProjectMembers);

// Add member to project
router.post("/:projectId/members", addMemberToProject);

// Update member role
router.patch("/:projectId/members/:memberId/role", updateProjectMemberRole);

// Remove member from project
router.delete("/:projectId/members/:memberId", removeMemberFromProject);

// Delete project member (if separate logic needed)
router.delete("/:projectId/member/:memberId", deleteProjectMember);

export default router;