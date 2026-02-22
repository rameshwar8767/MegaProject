import {asyncHandler} from "../utils/async-handler.js";
import {Project} from "../models/project.models.js";
import { ApiError } from "../utils/api-error.js";
import { ProjectNote } from "../models/projectnote.models.js";
import { ApiResponse } from "../utils/api-response.js";


const getProjectNotes = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const projectNotes = await ProjectNote.find({ project: projectId })
        .populate("createdBy", "username email fullName")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            projectNotes,
            "Project notes fetched successfully"
        )
    );
});
const getProjectNoteById = asyncHandler(async (req, res) => {
    const { noteId } = req.params;

    const note = await ProjectNote.findById(noteId)
        .populate("createdBy", "username email fullName");

    if (!note) {
        throw new ApiError(404, "Project note not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            note,
            "Project note fetched successfully"
        )
    );
});

const createProjectNote = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Content is required to create a project note");
    }

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const newNote = await ProjectNote.create({
        project: projectId,
        content,
        createdBy: req.user._id
    });

    const populatedNote = await ProjectNote.findById(newNote._id)
        .populate("createdBy", "username email fullName");

    return res.status(201).json(
        new ApiResponse(
            201,
            populatedNote,
            "Project note created successfully"
        )
    );
});

const updateProjectNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const { content } = req.body;

    const note = await ProjectNote.findById(noteId);

    if (!note) {
        throw new ApiError(404, "Project note not found");
    }

    const updatedNote = await ProjectNote.findByIdAndUpdate(
        noteId,
        { content },
        { new: true }
    ).populate("createdBy", "username email fullName");

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedNote,
            "Project note updated successfully"
        )
    );
});

const deleteProjectNote = asyncHandler(async(req,res)=>{
    const {noteId} = req.params;

    const note = await ProjectNote.findById(noteId);

    if(!note){
        throw new ApiError(404, "Project note not found");
    }
    const deletedNote= await ProjectNote.findByIdAndDelete(noteId);
    return res
        .status(200)
        .json(new ApiResponse(200,deletedNote, "Project note deleted successfully", deletedNote));
});

export {
    getProjectNotes,
    getProjectNoteById,
    createProjectNote,
    updateProjectNote,
    deleteProjectNote
};
