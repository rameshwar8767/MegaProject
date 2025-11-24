import {Router} from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { userLoginValidator, userRegistrationValidator } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";


const router= Router();

router.post("/register",userRegistrationValidator(),validate,registerUser);

router.post("/login",userLoginValidator(),validate,loginUser);

router.get("/logout",verifyJWT,logoutUser);


export default router;