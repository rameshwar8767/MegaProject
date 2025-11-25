import { validationResult } from "express-validator";
import {ApiError} from "../utils/api-error.js"

// export const validate = (req,res,next)=>{
//     const errors = validationResult(req);
//     if(!errors.isEmpty()){
//         const extractedErrors = [];
//         errors.array().map(err=>extractedErrors.push({
//             [err.path]: err.msg,
//         }));

//         throw new ApiError(422,"Validation Error", extractedErrors);
//     }
//     next();
// }

export const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log("VALIDATION ERRORS:", errors.array());  // 👈 ADD THIS
        const extractedErrors = [];

        errors.array().map(err =>
            extractedErrors.push({ [err.path]: err.msg })
        );

        throw new ApiError(422, "Validation Error", extractedErrors);
    }

    next();
};


