import mongoose from "mongoose";
import { SubTask } from "../models/subtask.models";


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
    
})

const updateSubTask = asyncHandler(async(req,res)=>{
    
})

const deleteSubTask = asyncHandler(async(req,res)=>{
    
})