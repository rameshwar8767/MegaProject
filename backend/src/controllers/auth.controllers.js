import {asyncHandler} from "../utils/async-handler.js";
import user from "../models/user.models.js";

const registerUser = asyncHandler(async(req,res)=>{

    const {email,username,password,role}= req.body;

    

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