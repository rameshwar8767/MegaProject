import { asyncHandler } from "../utils/async-handler";

const createTask = asyncHandler(async(req,res)=>{

});

const getTasks = asyncHandler(async(req,res)=>{

});

const getTaskById = asyncHandler(async(req,res)=>{

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

