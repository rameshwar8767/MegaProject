import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    avatar:{
        type: {
            url: String,
            localpath: String
        },
        default:{
            url: `https://placehold.co/400`,
            localpath: ""
        }
    },
    username:{
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        index: true
    },
    email:{
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
    },
    password:{
        type: String,
        required: true,
        minlength: 6
    },
    fullName:{
        type: String,
        required: true,
        trim: true
    },
    isEmailVerified:{
        type: Boolean,
        default: false
    },
    forgotPasswordToken:{
        type: String
    },
    forgotPasswordTokenExpiry:{
        type: Date
    },
    refreshToken:{
        type: String
    },
    emailVerificationToken:{
        type: String
    },
    emailVerificationTokenExpiry:{
        type: Date
    }
},{ timestamps: true});


userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next();
    }
    this.password=await bcrypt.hash(this.password,10);
    next();
})

userSchema.methods.comparePassword=async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken= async function(){
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d"
    })
}

userSchema.methods.generateRefreshToken= async function(){
    return jwt.sign({
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d"
    })
}

userSchema.methods.generateTemporaryToken = function(){
    const unHashedToken= crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto
        .createHash("sha256")
        .update(unHashedToken)
        .digest("hex")
    
    const tokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    
    return {hashedToken,unHashedToken, tokenExpiry};
}

export const User = mongoose.model("User", userSchema);