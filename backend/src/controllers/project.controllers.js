import { Project } from "../models/project.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler";

const getAllProjects = asyncHandler(async(req,res)=>{
   
    const projects = await Project.find()
        .populate("createdBy","name email")
        .sort({createdAt: -1});

    if(!projects ||projects.length === 0){
        return res
        .status(200)
        .json(
        new ApiResponse(
            200,
           {projects: []},
            "No projects found"
        )
        );
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

const getProjectById = asyncHandler(async(req,res)=>{});

const createProject = asyncHandler(async(req,res)=>{});

const updateProject = asyncHandler(async(req,res)=>{});

const deleteProject = asyncHandler(async(req,res)=>{});

const addMemberToProject = asyncHandler(async(req,res)=>{});

const removeMemberFromProject = asyncHandler(async(req,res)=>{});

const getProjectMembers = asyncHandler(async(req,res)=>{});

const updateProjectMemberRole = asyncHandler(async(req,res)=>{});

const deleteProjectMember = asyncHandler(async(req,res)=>{});

export {getAllProjects, getProjectById, createProject, updateProject, deleteProject, addMemberToProject, removeMemberFromProject, getProjectMembers, updateProjectMemberRole, deleteProjectMember};