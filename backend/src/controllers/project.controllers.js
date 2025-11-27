import { Project } from "../models/project.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler";
import { ProjectMember } from "../models/projectmember.models.js";

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



const createProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user?._id; // from auth middleware

    // Validate name
    if (!name) {
        throw new ApiError(400, "Project name is required");
    }

    // Check if project already exists
    const existingProject = await Project.findOne({ name });
    if (existingProject) {
        throw new ApiError(400, "Project with this name already exists");
    }

    // Create project
    const project = await Project.create({
        name,
        description,
        createdBy: userId
    });

    if (!project) {
        throw new ApiError(500, "Project could not be created");
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            project,
            "Project created successfully"
        )
    );
});


export const updateProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { name, description } = req.body;

    // Validate Project ID
    if (!projectId) {
        throw new ApiError(400, "Project ID is required");
    }

    // Ensure valid MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid Project ID");
    }

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Check if updated name already exists
    if (name && name !== project.name) {
        const existingProject = await Project.findOne({ name });
        if (existingProject) {
            throw new ApiError(400, "Project name already exists");
        }
    }

    // Prepare update fields
    const updatedData = {};
    if (name) updatedData.name = name;
    if (description) updatedData.description = description;

    // Update the project
    const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        updatedData,
        { new: true, runValidators: true }
    );

    if (!updatedProject) {
        throw new ApiError(500, "Project could not be updated");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedProject,
            "Project updated successfully"
        )
    );
});

const deleteProject = asyncHandler(async(req,res)=>{
    const {projectId}= req.params;
    
    if (!projectId) {
        throw new ApiError(400, "Project ID is required");
    }

    // Ensure valid MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid Project ID");
    }

    const deletedProject = await Project.findByIdAndDelete(projectId);
    if(!deletedProject){
        throw new ApiError(404,"Project not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            deletedProject,
            "Project deleted successfully"
        )
    );

});


const addMemberToProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { memberId, role } = req.body;

    // Validate projectId
    if (!projectId) {
        throw new ApiError(400, "Project ID is required");
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid Project ID");
    }

    // Validate memberId
    if (!memberId) {
        throw new ApiError(400, "Member ID is required");
    }
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
        throw new ApiError(400, "Invalid Member ID");
    }

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Check if member already exists in the project
    const existingMember = await ProjectMember.findOne({ 
        project: projectId, 
        user: memberId 
    });

    if (existingMember) {
        throw new ApiError(400, "User already added to this project");
    }

    // Create new member record
    const newMember = await ProjectMember.create({
        user: memberId,
        project: projectId,
        role: role || UserRolesEnum.MEMBER
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            newMember,
            "Member added to project successfully"
        )
    );
});

const removeMemberFromProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { memberId } = req.body;

    // Validate projectId
    if (!projectId) {
        throw new ApiError(400, "Project ID is required");
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid Project ID");
    }

    // Validate memberId
    if (!memberId) {
        throw new ApiError(400, "Member ID is required");
    }
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
        throw new ApiError(400, "Invalid Member ID");
    }

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Check if member exists in the project
    const existingMember = await ProjectMember.findOne({
        project: projectId,
        user: memberId
    });

    if (!existingMember) {
        throw new ApiError(400, "User is not a member of this project");
    }

    // Delete member entry
    await ProjectMember.findByIdAndDelete(existingMember._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            { projectId, memberId },
            "Member removed from project successfully"
        )
    );
});
const getProjectMembers = asyncHandler(async(req,res)=>{

});

const updateProjectMemberRole = asyncHandler(async(req,res)=>{

});

const deleteProjectMember = asyncHandler(async(req,res)=>{
    
});

export {
    getAllProjects, 
    getProjectById, createProject, updateProject, deleteProject, addMemberToProject, removeMemberFromProject, getProjectMembers, updateProjectMemberRole, deleteProjectMember};