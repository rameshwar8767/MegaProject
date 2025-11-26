import { Project } from "../models/project.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler";

const getAllProjects = asyncHandler(async(req,res)=>{
   
    const projects = await Project.find()
        .populate("createdBy","name email")
        .sort({createdAt: -1});

    if(!projects ||projects.length === 0){
       throw new ApiError(400,"Projects Not Found");
    }

    return res
        .status(200)
        .json(
        new ApiResponse(
            200,
           projects,
            "Projects fetched successfully"
        )
        );


});

import { Project } from "../models/project.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const getProjectById = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    // Validate ID param
    if (!projectId) {
        throw new ApiError(400, "Project ID is required");
    }

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid Project ID");
    }

    // Fetch project
    const project = await Project.findById(projectId)
        .populate("createdBy", "name email");

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            project,
            "Project fetched successfully"
        )
    );
});


const createProject = asyncHandler(async(req,res)=>{});

const updateProject = asyncHandler(async(req,res)=>{});

const deleteProject = asyncHandler(async(req,res)=>{});

const addMemberToProject = asyncHandler(async(req,res)=>{});

const removeMemberFromProject = asyncHandler(async(req,res)=>{});

const getProjectMembers = asyncHandler(async(req,res)=>{});

const updateProjectMemberRole = asyncHandler(async(req,res)=>{});

const deleteProjectMember = asyncHandler(async(req,res)=>{});

export {getAllProjects, getProjectById, createProject, updateProject, deleteProject, addMemberToProject, removeMemberFromProject, getProjectMembers, updateProjectMemberRole, deleteProjectMember};