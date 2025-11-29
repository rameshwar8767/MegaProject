import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Task } from "../models/task.model.js";
import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";

const createTask = asyncHandler(async (req, res) => {

    const {
        title,
        description,
        dueDate,
        project,
        assignedTo,
        assignedBy,
        status
    } = req.body;

    if (!title) throw new ApiError(400, "Title is required");
    if (!project) throw new ApiError(400, "Project ID is required");
    if (!assignedTo) throw new ApiError(400, "Assigned To is required");
    if (!assignedBy) throw new ApiError(400, "Assigned By is required");


    if (!mongoose.Types.ObjectId.isValid(project))
        throw new ApiError(400, "Invalid Project ID");

    if (!mongoose.Types.ObjectId.isValid(assignedTo))
        throw new ApiError(400, "Invalid AssignedTo ID");

    if (!mongoose.Types.ObjectId.isValid(assignedBy))
        throw new ApiError(400, "Invalid AssignedBy ID");

    // Check if project exists
    const existingProject = await Project.findById(project);
    if (!existingProject) throw new ApiError(404, "Project not found");

    // Check assignedTo user exists
    const existingUser = await User.findById(assignedTo);
    if (!existingUser) throw new ApiError(404, "Assigned To user not found");

    // Check assignedBy user exists
    const user = await User.findById(assignedBy);
    if (!user) throw new ApiError(404, "Assigned By user not found");


    let attachments = [];

    // req.files must be an array (multer)
    if (req.files && req.files.length > 0) {
        attachments = req.files.map(file => ({
            url: file.path,          // local path or cloud URL
            mimetype: file.mimetype,
            size: file.size
        }));
    }

    const task = await Task.create({
        title,
        description,
        project,
        assignedTo,
        assignedBy,
        status,
        dueDate,
        attachments
    });

    return res
        .status(201)
        .json(new ApiResponse(201, task, "Task created successfully"));
});


const getTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    if (!taskId) {
        throw new ApiError(400, "Task ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid Task ID");
    }

    const task = await Task.findById(taskId)
        .populate("project", "name")          
        .populate("assignedTo", "name email") 
        .populate("assignedBy", "name email");

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, task, "Task fetched successfully"));
});

const getTaskById = asyncHandler(async(req,res)=>{
    const {taskId} = req.body;

    if (!taskId) {
        throw new ApiError(400, "Task ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid Task ID");
    }

    const task = await Task.findById(taskId)
        .populate("project", "name")          
        .populate("assignedTo", "name email") 
        .populate("assignedBy", "name email");

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, task, "Task fetched successfully"));
});

const getTasksAssignedToUser = asyncHandler(async(req,res)=>{

});


const getTasksAssignedByUser = asyncHandler(async(req,res)=>{

});

const updateTask = asyncHandler(async(req,res)=>{

});

const updateTaskStatus = asyncHandler(async(req,res)=>{

});

const addTaskAttachment = asyncHandler(async(req,res)=>{

});

const removeTaskAttachment = asyncHandler(async(req,res)=>{

});

const deleteTask = asyncHandler(async(req,res)=>{

});

export {
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
}

