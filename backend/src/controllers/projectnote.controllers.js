import {asyncHandler} from "../utils/async-handler.js";
import Project from "../models/project.models.js";
import { ApiError } from "../utils/api-error.js";
import { ProjectNote } from "../models/projectnote.models.js";
import { ApiResponse } from "../utils/api-response.js";


const getProjectNotes = asyncHandler(async(req,res)=>{
    
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if(!project){
        throw new ApiError(404, "Project not found");
    }

    const projectNotes = ProjectNote.findById(projectId)
        .populate("createdBy", "username email fullName");

    return res
        .status(200)
        .json(new ApiResponse(200, "Project notes fetched successfully", projectNotes));
});

const getProjectNoteById = asyncHandler(async(req,res)=>{
    const {noteId} = req.params;

    const note = await ProjectNote.findById(noteId)
        .populate("createdBy", "username email fullName");

    if(!note){
        throw new ApiError(404, "Project note not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Project note fetched successfully", projectNote));

});

const createProjectNote = asyncHandler(async(req,res)=>{

});

const updateProjectNote = asyncHandler(async(req,res)=>{

});

const deleteProjectNote = asyncHandler(async(req,res)=>{

});
