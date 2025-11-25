import {asyncHandler} from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import {ApiError} from "../utils/api-error.js";
import {ApiResponse} from "../utils/api-response.js";
import crypto, { hash } from "crypto";
import {sendMail,forgotPasswordMailGenContent,emailVerificationMailGenContent} from "../utils/mail.js";
import jwt from "jsonwebtoken";


const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password, fullName } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    // 1. Validate email uniqueness
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
        throw new ApiError(400, "User with this email already exists");
    }

    // 2. Validate username uniqueness
    const existingUsername = await User.findOne({ username: normalizedUsername });
    if (existingUsername) {
        throw new ApiError(400, "Username is already taken");
    }

    // 3. Create user
    const newUser = await User.create({
        email: normalizedEmail,
        username: normalizedUsername,
        password,
        fullName: fullName.trim(),
    });

    if (!newUser) {
        throw new ApiError(500, "Failed to register user");
    }

    // 4. Generate email verification token
    const emailTokenData = newUser.generateTemporaryToken();
    newUser.emailVerificationToken = emailTokenData.hashedToken;
    newUser.emailVerificationTokenExpiry = emailTokenData.tokenExpiry;

    await newUser.save({ validateBeforeSave: false });

    // 5. Prepare email verification link
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${emailTokenData.unHashedToken}`;

    const mailgenContent = emailVerificationMailGenContent(
        newUser.username,
        verificationUrl
    );

    // 6. Send verification email
    try {
    await sendMail({
        to: newUser.email,
        subject: "Verify Your Email Address",
        mailgenContent: mailgenContent,
    });
    } catch (error) {
        console.error("🔥 REAL EMAIL SEND ERROR:", error);

        newUser.emailVerificationToken = undefined;
        newUser.emailVerificationTokenExpiry = undefined;
        await newUser.save({ validateBeforeSave: false });

        throw new ApiError(500, error.message || "Failed to send verification email");
    }


    return res.status(201).json(
        new ApiResponse(
        201,
        {
            _id: newUser._id,
            email: newUser.email,
            username: newUser.username,
            fullName: newUser.fullName,
            isEmailVerified: newUser.isEmailVerified,
        },
        "User registered successfully. Please verify your email."
        )
    );
});





const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // 1. Find user & include password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        throw new ApiError(400, "Invalid email or password");
    }

    // 2. Validate password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid email or password");
    }

    // 3. Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    const emailToken = user.generateTemporaryToken();

    // 4. Save refresh token in DB
    user.refreshToken = refreshToken;
    user.emailVerificationToken = emailToken.hashedToken;
    user.emailVerificationTokenExpiry = emailToken.tokenExpiry;   
    await user.save({ validateBeforeSave: false });

    // 5. Cookie settings
    const options = {
        httpOnly: true,
        secure: false,         // ❗ Set false for local development if needed
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    // 6. Send cookies + response
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
        new ApiResponse(
            200,
            {
            accessToken,
            refreshToken,
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                fullName: user.fullName,
                isEmailVerified: user.isEmailVerified,
            }
            },
            "User logged in successfully"
        )
        );
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
        secure: false,     // IMPORTANT for local testing
        sameSite: "lax",
        path: "/"
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

const resendVerificationEmail = asyncHandler(async(req,res)=>{
    const {email} = req.body;

    if(!email){
        throw new ApiError(400, "Email is required");
    }

    const existingUser = await User.findOne({email});
    if(!existingUser){
        throw new ApiError(400, "User not found");
    }

    if(existingUser.isEmailVerified === true){
        throw new ApiError(400, "Email already verified");
    }
    const emailTokenData = exitingUser.generateTemporaryToken();
    existingUser.emailVerificationToken = emailTokenData.hashedToken;
    existingUser.emailVerificationTokenExpiry = emailTokenData.tokenExpiry;

    await existingUser.save({ validateBeforeSave: false });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${emailTokenData.unHashedToken}`;

    const mailgenContent = emailVerificationMailGenContent(
        existingUser.username,
        verificationUrl
    );
    
    try {
        await sendMail({
        to: existingUser.email,
        subject: "Verify Your Email Address",
        mailgenContent: mailgenContent,
        });
        return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Verification email resent successfully. Please check your inbox."
        )
        );  
        
    } catch (error) {
        
        console.error("🔥 REAL EMAIL SEND ERROR:", error);
        
        exitingUser.emailVerificationToken = undefined;
        exitingUser.emailVerificationTokenExpiry = undefined;
        await exitingUser.save({ validateBeforeSave: false });
        
        throw new ApiError(500, error.message || "Failed to send verification email");
    }

    


});

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

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    // 1. Validate input fields
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "All fields are required");
    }

    // 2. Ensure user is logged in (auth middleware sets req.user)
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    // 3. Find user and include password
    const user = await User.findById(userId).select("+password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // 4. Verify old password
    const isValidOldPassword = await user.comparePassword(oldPassword);

    if (!isValidOldPassword) {
        throw new ApiError(400, "Old password is incorrect");
    }

    // 5. Prevent reuse of same password
    if (oldPassword === newPassword) {
        throw new ApiError(400, "New password must be different");
    }

    // 6. Update password (hashed automatically by pre-save)
    user.password = newPassword;

    // 7. OPTIONAL: Invalidate refresh token to log out all devices
    user.refreshToken = undefined;

    // 8. Save updated password
    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Password changed successfully"));
});


const getUserProfile = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    const user = await User.findById(userId).select(
        "-refreshToken -emailVerificationToken -emailVerificationTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry"
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(
        new ApiResponse(200, user, "User profile fetched successfully")
        );
});


const updateUserProfile = asyncHandler(async (req, res) => {
    // 1. Extract logged-in user's ID
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    // 2. Extract fields from body
    const { username, fullName } = req.body;

    if (!username && !fullName) {
        throw new ApiError(400, "At least one field is required to update");
    }

    // 3. Find existing user
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // 4. If username is being updated → ensure unique username
    if (username && username.toLowerCase() !== user.username) {
        const usernameExists = await User.findOne({ username: username.toLowerCase() });
        if (usernameExists) {
        throw new ApiError(400, "Username already taken");
        }
    }

    // 5. Apply updates
    if (username) user.username = username.toLowerCase();
    if (fullName) user.fullName = fullName;

    // 6. Save updated user
    await user.save();

    // 7. Send response
    return res.status(200).json(
        new ApiResponse(
        200,
        {
            _id: user._id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            isEmailVerified: user.isEmailVerified,
            avatar: user.avatar,
        },
        "User profile updated successfully"
        )
    );
});



export {registerUser, loginUser, logoutUser, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword, refreshAccessToken, changePassword, getUserProfile, updateUserProfile};