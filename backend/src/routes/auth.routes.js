import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    resendVerificationEmail, 
    resetPassword, 
    verifyEmail,
    forgotPassword,  
    refreshAccessToken, 
    changePassword, 
    getUserProfile, 
    updateUserProfile 
} from "../controllers/auth.controllers.js";

import { validate } from "../middlewares/validator.middlewares.js";
import { userLoginValidator, userRegistrationValidator } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Public Routes
router.post("/register", userRegistrationValidator(), validate, registerUser);
router.post("/login", userLoginValidator(), validate, loginUser);

router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification-email", resendVerificationEmail);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.get("/refresh-access-token", refreshAccessToken);

// Protected Routes (require login)
router.get("/logout", verifyJWT, logoutUser);
router.put("/change-password", verifyJWT, changePassword);
router.get("/user-profile", verifyJWT, getUserProfile);
router.put("/update-profile", verifyJWT, updateUserProfile);

export default router;
