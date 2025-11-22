import {asyncHandler} from "../utils/async-handler.js";
import user from "../models/user.models.js";

const registerUser = asyncHandler(async(req,res)=>{
    const {email,username,password,role}= req.body;

    //validation here
    
});

const loginUser = asyncHandler(async(req,res)=>{

});

export {registerUser, loginUser};