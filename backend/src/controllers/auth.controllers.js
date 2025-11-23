import {asyncHandler} from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import ApiError from "../utils/api-error.js";
import ApiResponse from "../utils/api-response.js";

const registerUser = asyncHandler(async(req,res)=>{

    const {email,username,password,role,fullName}= req.body;

    const existingUser= await User.findOne({email});
    if(existingUser){
        throw new ApiError(400,"User with this email already exists");
    }
    const newUser = await User.create({
        email:email,
        username:username,
        password:password,
        role:role,
        fullName:fullName
    })

    if(!newUser){
        throw new ApiError(500,"Failed to register user");
    }
    return res
        .status(201)
        .json(new ApiResponse(201,"User registered successfully",{
            _id:newUser._id,
            email:newUser.email,
            username:newUser.username,
            role:newUser.role,
            fullName:newUser.fullName
        }));
});




const loginUser = asyncHandler(async(req,res)=>{

});

const logoutUser = asyncHandler(async(req,res)=>{});

const verifyEmail = asyncHandler(async(req,res)=>{});

const resendVerificationEmail = asyncHandler(async(req,res)=>{});

const forgotPassword = asyncHandler(async(req,res)=>{});

const resetPassword = asyncHandler(async(req,res)=>{});

const refreshAccessToken = asyncHandler(async(req,res)=>{});

const changePassword = asyncHandler(async(req,res)=>{});

const getUserProfile = asyncHandler(async(req,res)=>{});

const updateUserProfile = asyncHandler(async(req,res)=>{});


export {registerUser, loginUser, logoutUser, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword, refreshAccessToken, changePassword, getUserProfile, updateUserProfile};