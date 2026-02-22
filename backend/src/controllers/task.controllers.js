import mongoose from "mongoose";
import {asyncHandler} from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { Task } from "../models/task.models.js";
import { Project } from "../models/project.models.js";
import { User } from "../models/user.models.js";

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

const getTaskById = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid Task ID");
    }

    const task = await Task.findById(taskId)
        .populate("assignedTo", "name email")
        .populate("assignedBy", "name email")
        .populate("project", "name description");

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, task, "Task fetched successfully"));
});

const getTasksAssignedByUser = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid User ID");
    }

    const tasks = await Task.find({ assignedBy: userId })
        .populate("assignedTo", "name email")
        .populate("project", "name");

    if (tasks.length === 0) {
        throw new ApiError(404, "No tasks assigned by this user");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tasks, "Tasks assigned by user fetched successfully"));
});


const updateTask = asyncHandler(async (req, res) => {
    
    const { taskId } = req.params;

    const {
        title,
        description,
        assignedTo,
        status,
        dueDate,
        projectId,
        assignedBy
    } = req.body;

   
    if (!taskId) {
        throw new ApiError(400, "Task ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Task ID is not valid");
    }

    const task = await Task.findById(taskId);

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    if (projectId) {
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            throw new ApiError(400, "Invalid Project ID");
        }

        const project = await Project.findById(projectId);
        if (!project) {
            throw new ApiError(404, "Project not found");
        }
    }

    if (assignedTo) {
        if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
            throw new ApiError(400, "Invalid AssignedTo ID");
        }

        const user = await User.findById(assignedTo);
        if (!user) {
            throw new ApiError(404, "Assigned To user not found");
        }
    }

    if (assignedBy) {
        if (!mongoose.Types.ObjectId.isValid(assignedBy)) {
            throw new ApiError(400, "Invalid AssignedBy ID");
        }

        const user = await User.findById(assignedBy);
        if (!user) {
            throw new ApiError(404, "Assigned By user not found");
        }
    }

    let attachments = task.attachments;

    if (req.files && req.files.length > 0) {
        const newFiles = req.files.map(file => ({
            url: file.path,
            mimetype: file.mimetype,
            size: file.size
        }));

        attachments = [...attachments, ...newFiles];
    }


    task.title = title || task.title;
    task.description = description || task.description;
    task.assignedTo = assignedTo || task.assignedTo;
    task.assignedBy = assignedBy || task.assignedBy;
    task.status = status || task.status;
    task.dueDate = dueDate || task.dueDate;
    task.project = projectId || task.project;
    task.attachments = attachments;

    const updatedTask = await task.save();

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTask, "Task updated successfully"));
});

const updateTaskStatus = asyncHandler(async(req,res)=>{
    const { taskId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid Task ID");
    }

    if (!AvailableTaskStatuses.includes(status)) {
        throw new ApiError(400, "Invalid Task Status");
    }

    const task = await Task.findById(taskId);

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    task.status = status;
    await task.save();

    return res
        .status(200)
        .json(new ApiResponse(200, task, "Task status updated successfully"));
});

const addTaskAttachment = asyncHandler(async(req,res)=>{
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid Task ID");
    }

    const task = await Task.findById(taskId);

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, "No files uploaded");
    }

    const newAttachments = req.files.map(file => ({
        url: file.path,
        mimetype: file.mimetype,
        size: file.size
    }));

    task.attachments.push(...newAttachments);

    await task.save();

    return res
        .status(200)
        .json(new ApiResponse(200, task, "Attachments added successfully"));
});

const removeTaskAttachment = asyncHandler(async(req,res)=>{
    const { taskId, attachmentId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(taskId)){
        throw new ApiError(400,"Invalid Task ID");
    }

    const task = await Task.findById(taskId);

    if(!task){
        throw new ApiError(404, "Task not found");
    }

    task.attachments = task.attachments.filter(
        (attachment) => attachment._id.toString() !== attachmentId
    );

    await task.save();

    return res
        .status(200)
        .json(new ApiResponse(200, task, "Attachment removed successfully"));
});

const deleteTask = asyncHandler(async(req,res)=>{
    const {taskId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(taskId)){
        throw new ApiError(400,"Invalid Task ID");
    }

    const task = await Task.findById(taskId);

    if(!task){
        throw new ApiError(404, "Task not found");
    }

    await task.deleteOne();

    return res.status(200)
        .json(new ApiResponse(200, null,"Task deleted successfully"));
});

const getTasksAssignedToUser = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid User ID");
    }

    const tasks = await Task.find({ assignedTo: userId })
        .populate("assignedBy", "name email")
        .populate("project", "name");

    return res
        .status(200)
        .json(new ApiResponse(200, tasks, "Tasks assigned to user fetched successfully"));
});

const getTasks = asyncHandler(async (req, res) => {
    const { project, status, assignedTo } = req.query;

    let filter = {};

    if (project) {
        if (!mongoose.Types.ObjectId.isValid(project))
            throw new ApiError(400, "Invalid Project ID");
        filter.project = project;
    }

    if (status) {
        filter.status = status;
    }

    if (assignedTo) {
        if (!mongoose.Types.ObjectId.isValid(assignedTo))
            throw new ApiError(400, "Invalid AssignedTo ID");
        filter.assignedTo = assignedTo;
    }

    const tasks = await Task.find(filter)
        .populate("assignedTo", "name email")
        .populate("project", "name")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
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

