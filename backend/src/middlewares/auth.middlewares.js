import {ApiError}  from '../utils/api-error.js';
import {asyncHandler} from '../utils/async-handler.js';
import jwt from 'jsonwebtoken';
import {User} from '../models/user.models.js';
import{ProjectMember} from '../models/projectmember.models.js';
import mongoose from 'mongoose';

export const verifyJWT = asyncHandler(async (req, res, next) => {

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        throw new ApiError(401, "Access token is missing");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id).select('-password ,-refreshToken,-emailVerificationToken,-emailVerificationTokenExpiry,-forgotPasswordToken,-forgotPasswordTokenExpiry');
        if (!user) {
            throw new ApiError(401, "User not found");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid or expired access token"); 
    }

});

export const validateProjectPermission = (roles=[])=> asyncHandler(async(req, res, next) => {
    
    const { projectId } = req.params;

    if(!projectId){
        throw new ApiError(400, "Project ID is required");
    }

    const project = ProjectMember.findOne({
        project:mongoose.Types.ObjectId(projectId),
        user: mongoose.Types.ObjectId(req.user._id)
    })

    if(!project){
        throw new ApiError(403, "You are not a member of this project");
    }

    const givenRole = project?.role;

    req.user.role = givenRole;

    if(!roles.includes(givenRole)){
        throw new ApiError(403, "You do not have permission to perform this action");
    }


});