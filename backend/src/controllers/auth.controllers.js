import {asyncHandler} from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import ApiError from "../utils/api-error.js";
import ApiResponse from "../utils/api-response.js";

const registerUser = asyncHandler(async(req,res)=>{

    const {email,username,password,fullName}= req.body;

    const existingUser= await User.findOne({email});
    if(existingUser){
        throw new ApiError(400,"User with this email already exists");
    }
    const newUser = await User.create({
        email:email,
        username:username,
        password:password,
        fullName:fullName
    })

    if(!newUser){
        throw new ApiError(500,"Failed to register user");
    }
    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                {
                    _id: newUser._id,
                    email: newUser.email,
                    username: newUser.username,
                    fullName: newUser.fullName,
                    isEmailVerified: newUser.isEmailVerified,
                },
                "User registered successfully"
            )
         );
});




const loginUser = asyncHandler(async(req,res)=>{
    const {email,password}= req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        throw new ApiError(400, "Invalid email or password");
    }

    const isPasswordValid = await user.comparePassword(password);
    if(!isPasswordValid){
        throw new ApiError(400,"Invalid email or password");
    }
    
     // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    };

    return res
        .status(200)
        .json(new ApiResponse(200,"User logged in successfully",{
            _id:user._id,
            email:user.email,
            username:user.username,
            role:user.role,
            fullName:user.fullName
        }));
});

const logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

  // Remove refresh token from DB
    await User.findByIdAndUpdate(
        userId,
        {
            $unset: { refreshToken: "" },
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    };

    // Clear cookies
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, null, "Logged out successfully"));
});

const verifyEmail = asyncHandler(async(req,res)=>{
    
});

const resendVerificationEmail = asyncHandler(async(req,res)=>{});

const forgotPassword = asyncHandler(async(req,res)=>{});

const resetPassword = asyncHandler(async(req,res)=>{});

const refreshAccessToken = asyncHandler(async(req,res)=>{});

const changePassword = asyncHandler(async(req,res)=>{});

const getUserProfile = asyncHandler(async(req,res)=>{});

const updateUserProfile = asyncHandler(async(req,res)=>{});


export {registerUser, loginUser, logoutUser, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword, refreshAccessToken, changePassword, getUserProfile, updateUserProfile};