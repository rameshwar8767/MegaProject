import mongoose from "mongoose";
import { SubTask } from "../models/subtask.models.js";
import {asyncHandler} from "../utils/async-handler.js";


const createSubTask = asyncHandler(async(req,res)=>{
    const {title, task, dueDate} = req.body;

    if(!title || !task){
        res.status(400);
        throw new Error("Title and Task ID are required")
    }

    if(!mongoose.Types.ObjectId.isValid(task)){
        res.status(400);
        throw new Error("Invalid Task ID");
    }

    const subTask = await SubTask.create({
        title,
        task,
        dueDate,
        createdBy: req.user._id,
    })

    res.status(201).json({
        success: true,
        message: "SubTask created successfully",
        data: subTask,
    });
})

const getSubTaskById = asyncHandler(async(req,res)=>{
    const {id} = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid SubTask ID");
    }

    const subTask = await SubTask.findById(id)
    .populate("task","title")
    .populate("createdBy","name email")

    if(!subTask){
        res.status(400);
        throw new Error("SubTask not found")
    }

    res.status(200).json({
        success:true,
        data: subTask
    });
})

const getSubTasksByTask = asyncHandler(async(req,res)=>{
    const {taskId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(taskId)){
        res.status(400);
        throw new Error("Invalid Task ID");
    }

    const subTasks = await SubTask.find({
        task: taskId,
        createdBy: req.user._id,
    }).sort({createdAt:-1});

    res.status(200).json({
        success:true,
        count : subTasks.length,
        data : subTasks
    })
})

const updateSubTask = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const { title, isCompleted, dueDate} = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)){
        res.status(400);
        throw new Error("Invalid SubTask ID");
    }

    const subTask = await SubTask.findOne({
        _id: id,
        createdBy: req.user._id,
    });

    if (title !== undefined) subTask.title = title;
    if (isCompleted !== undefined) subTask.isCompleted = isCompleted;
    if (dueDate !== undefined) subTask.dueDate = dueDate;

    const updatedSubTask = await subTask.save();

    res.status(200).json({
        success: true,
        message: "SubTask updated successfully",
        data: updatedSubTask,
    });
})

const deleteSubTask = asyncHandler(async(req,res)=>{
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid SubTask ID");
    }

    const subTask = await SubTask.findOneAndDelete({
        _id: id,
        createdBy: req.user._id,
    });

    if (!subTask) {
        res.status(404);
        throw new Error("SubTask not found or unauthorized");
    }

    res.status(200).json({
        success: true,
        message: "SubTask deleted successfully",
    });
})

export{
    createSubTask,
    getSubTaskById,
    getSubTasksByTask,
    updateSubTask,
    deleteSubTask
}