import {asyncHandler} from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import ApiError from "../utils/api-error.js";
import ApiResponse from "../utils/api-response.js";
import crypto, { hash } from "crypto";
import {sendMail,forgotPasswordMailGenContent,emailVerificationMailGenContent} from "../utils/mail.js";
import jwt from "jsonwebtoken";


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

const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;

    // 1. Validate token
    if (!token) {
        throw new ApiError(400, "Invalid or missing token");
    }

    // 2. Hash the token (DB stores hashed version)
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    // 3. Find user with matching token + not expired
    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(400, "Token is invalid or expired");
    }

    // 4. Mark email as verified
    user.isEmailVerified = true;

    // 5. Clear token fields
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiry = undefined;

    // 6. Save user
    await user.save();

    // 7. Response
    return res
        .status(200)
        .json(
        new ApiResponse(200, null, "Email verified successfully")
        );
});

const resendVerificationEmail = asyncHandler(async(req,res)=>{});

const forgotPassword = asyncHandler(async(req,res)=>{
    const {email} = req.body;

    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(400, "Invalid email");
    }

    const { hashedToken, unHashedToken, tokenExpiry } =
    user.generateTemporaryToken();

    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordTokenExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${unHashedToken}`;

    const message = `You requested a password reset.\n\nClick the link below to reset your password:\n\n${resetUrl}\n\nThis link expires in 15 minutes.`;
    console.log("Reset URL:", resetUrl);

    const mailgenContent = forgotPasswordMailGenContent(
        user.username,
        resetUrl
    );

    try {
        await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        mailgenContent,
        });

        return res
        .status(200)
        .json(
            new ApiResponse(
            200,
            null,
            "Password reset link has been sent to your email"
            )
        );
    } catch (error) {
    // If email fails → cleanup token
        user.forgotPasswordToken = undefined;
        user.forgotPasswordTokenExpiry = undefined;
        await user.save({ validateBeforeSave: false });

        throw new ApiError(500, "Failed to send reset email");
    }

});

const resetPassword = asyncHandler(async (req, res) => {

    // 1. Extract token from URL
    const { token } = req.params;
    if (!token) {
        throw new ApiError(400, "Invalid or missing token");
    }

    // 2. Extract new password
    const { newPassword } = req.body;
    if (!newPassword) {
        throw new ApiError(400, "New password is required");
    }

    // 3. Hash the received token (because DB stores only hashed token)
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    // 4. Find user by token + expiry
    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordTokenExpiry: { $gt: Date.now() }, // token not expired
    }).select("+password");

    if (!user) {
        throw new ApiError(400, "Invalid or expired token");
    }

    // 5. Update password (pre-save hook will hash it)
    user.password = newPassword;

    // 6. Clear password reset fields
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;

    // Optional: Logout from all devices
    user.refreshToken = undefined;

    // 7. Save updated user
    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Password has been reset successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    // 1. Extract refresh token from cookie or header
    const cookieRefresh = req.cookies?.refreshToken;
    const headerRefresh = req.headers["authorization"]
        ? req.headers["authorization"].replace("Bearer ", "")
        : null;

    const refreshToken = cookieRefresh || headerRefresh;

    if (!refreshToken) {
        throw new ApiError(401, "Refresh token is missing");
    }

    // 2. Verify token
    let decodedToken;
    try {
        decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    if (!decodedToken?._id) {
        throw new ApiError(401, "Invalid refresh token");
    }

    // 3. Find user in DB
    const user = await User.findById(decodedToken._id).select("+refreshToken");

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    // 4. Compare stored refresh token
    if (user.refreshToken !== refreshToken) {
        throw new ApiError(401, "Refresh token does not match");
    }

    // 5. Generate new access token
    const newAccessToken = user.generateAccessToken();

    if (!newAccessToken) {
        throw new ApiError(500, "Failed to generate new access token");
    }

    // 6. Send token to client
    return res
        .status(200)
        .json(
        new ApiResponse(
            200,
            { accessToken: newAccessToken },
            "Access token refreshed successfully"
        )
        );
});

const changePassword = asyncHandler(async(req,res)=>{});

const getUserProfile = asyncHandler(async(req,res)=>{});

const updateUserProfile = asyncHandler(async(req,res)=>{});


export {registerUser, loginUser, logoutUser, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword, refreshAccessToken, changePassword, getUserProfile, updateUserProfile};