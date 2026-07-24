import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiRespnse.js";


const registerUser=asyncHandler(async(req,res)=>{
    // get user details from frontened
    // validation - not empty 
    // check if user already exists: username,email 
    // check for images ,check for avtar
    // upload them to cloudinary,avtar
    // create user object -create entry in db 
    // remove password and refresh token field from response
    // check fr the user creation 
    // return response
    const {fullname,email,username,password}=req.body
    const normalizedEmail = email?.trim().toLowerCase()
    const normalizedUsername = username?.trim().toLowerCase()
    // if(fullName===""){
    //     throw new ApiError(400,"fullame is required")
    // }
    if([fullname, normalizedEmail, normalizedUsername, password].some((field)=>!field?.trim()))
    {
        throw new ApiError(400,"All fields are required")
    }
      const existingUser = await User.findOne({
        $or:[{username: normalizedUsername},{email: normalizedEmail}]
      })
      if(existingUser){
        throw new ApiError(409,"User with email or username already exists ")
      }
      // console.log(req.files);
      


       const avatarLocalPath=req.files?.avatar?.[0]?.path
      //  const coverImageLocalPath=req.files?.coverImage?.[0]?.path
       let coverImageLocalPath;
      if(req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path
      }
    
       if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required ")
       }
       const avatar=await uploadOnCloudinary(avatarLocalPath)
       const coverImage=await uploadOnCloudinary(coverImageLocalPath)
       if(!avatar){
         throw new ApiError(500,"Avatar upload failed")

       }
       const user=await User.create({
        fullname,
        avatar:avatar.secure_url,
        coverImage:coverImage?.secure_url ||"",
        email: normalizedEmail,
        password,
        username: normalizedUsername
       })


       const createdUser=await User.findById(user._id).select(
        "-password  -refreshToken"

       )
       if(!createdUser){
        throw new ApiError(500,"something went wrong while regitering the User ")
       }
       return res.status(201).json(
        new ApiResponse(201,createdUser,"User registered successfully")
       )
       
       




})
export {registerUser}
