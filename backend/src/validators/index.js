import {body} from "express-validator";


const userRegistrationValidator = ()=>{
    return [
        body("email")
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is invalid"),

        body("username")
            .trim()
            .notEmpty().withMessage("Username is required")
            .isLength({ min: 3, max: 16 })
            .withMessage("Username must be between 3 and 16 characters"),

        body("password")
            .trim()
            .notEmpty().withMessage("Password is required")
            .isLength({ min: 6 })
            .withMessage("Password should be at least 6 characters long")
            .isStrongPassword()
            .withMessage("Password should contain uppercase, lowercase, number, and symbol"),

        body("fullName")
            .trim()
            .notEmpty().withMessage("Full name is required"),
    ];
}

const userLoginValidator = ()=>{
    return[
        body("email")
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is invalid"),

        body("password")
            .trim()
            .notEmpty().withMessage("Password is required")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters"),
    ];
}

const userForgotPasswordValidator = ()=>{
    return[
        body("email")
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is invalid"),

        body("forgotPasswordToken")
            .trim()
            .notEmpty().withMessage("forgotPasswordToken is required")

    ];
}

export {userRegistrationValidator, userLoginValidator};