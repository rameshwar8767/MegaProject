import mongoose from "mongoose";
import {AvailableTaskStatuses,TaskStatusEnum} from "../utils/constants.js";

const taskSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        trim: true
    },
    description:{
        type: String
    },
    project:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    assignedTo:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    assignedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status:{
        type: String,
        enum: AvailableTaskStatuses,
        default: TaskStatusEnum.TODO
    },
    dueDate:{
        type: Date
    },
    attachments:{
        type: [
            {
                url: String,
                mimetype: String,
                size: Number
            }
        ],
        default: []
    }
},{ timestamps: true});

export const Task = mongoose.model("Task", taskSchema);