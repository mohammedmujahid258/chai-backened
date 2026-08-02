import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiRespnse.js";
import jwt from  "jsonwebtoken"



const generateAcessAndRefreshToken=async(userId)=>{
  try {
    const user=await User.findById(userId)
    const accessToken=user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()
    user.refreshToken=refreshToken
    await user.save({ validateBeforeSave: false })
    return {accessToken,refreshToken}
    
  } catch (error) {
    throw new ApiError(500,"Something went wrong while generating refresh and access token ")
    
  }
}
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
    const {fullname,email,username,password}=req.body || {}
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
const loginUser=asyncHandler(async(req,res)=>{
  // req body->data
  // username or email
  // find the user
  // password check
  // access and refresh
  // send cookie
 const {email,username,password}=req.body || {}
 const normalizedEmail = email?.trim().toLowerCase()
 const normalizedUsername = username?.trim().toLowerCase()

  if(!normalizedUsername && !normalizedEmail){
   throw new ApiError(400,"username or email is required")
  }

  const user=await User.findOne({
  $or:[normalizedUsername && {username: normalizedUsername}, normalizedEmail && {email: normalizedEmail}].filter(Boolean)
 })
 if(!user){
  throw new ApiError(404,"user does not exist")
 }


 const isPasswordValid=await user.isPasswordCorrect(password)

 if(!isPasswordValid){
  throw new ApiError(401,"Invalid crentials")
 }
 const {accessToken,refreshToken}=await generateAcessAndRefreshToken(user._id)



 const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

 const options={
   httpOnly:true,
   secure: process.env.NODE_ENV === "production",
   sameSite: "lax",
   path: "/"

 }
 return res.
 status(200).
 cookie("accessToken",accessToken,options)
 .cookie("refreshToken",refreshToken,options)
 .json(
  new ApiResponse(
    200,
    {
      user:loggedInUser,accessToken,
      refreshToken
    },
    "User logged in successfully "
  )
  )
})

const logoutUser=asyncHandler(async(req,res)=>{

     await User.findByIdAndUpdate(
      req.user._id,
      {
        $set:{
          refreshToken:undefined
        }
      },
      {
        new:true
      }
    )
     
  const options={
  httpOnly:true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/"

 }
  return res.status(200).clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .clearCookie("acessToken",options)
  .json(new ApiResponse(200,{},"USer logout sucessfully"))
 
 
 
})


const refreshAccessToken=asyncHandler(async(req,res)=>{

    const IncomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken

    if(!IncomingRefreshToken){
      throw new ApiError(401,"unauthoriized request")
    }
     try {
      const decodedToken=jwt.verify(
       IncomingRefreshToken,
       process.env.REFRESH_TOKEN_SECRET
     )
 
     const user=await User.findById(decodedToken?._id)
      if(!user){
       throw new ApiError(401,"invalid refresh token")
     }
     if(IncomingRefreshToken!==user?.refreshToken){
       throw new ApiError(401,"Refresh token is expired or used ")
 
     }
     const options={
       httpOnly:true,
       secure:true
 
     }
     const {accessToken,newrefreshToken}= await generateAcessAndRefreshToken(user._id)
     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .ccokie("refreshToken",newrefreshToken,options)
     .json(
       new ApiResponse(
         200,
         {accessToken,refreshToken:newrefreshToken},
         "Access token refreshed "
       )
     )
   
 
 
 
 
 
 
     } catch (error) {

      throw new ApiError(401,error?.message|| "invalid refresh token ")
      
     }
})
 const changeCurrentPassword=asyncHandler(async(req,res)=>{
  const{oldPassword,newPassword}=req.body
  const user=await User.findById(req.user?._id)
  const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new ApiError(400,"Invalid old password")
  }
  user.password=newPassword
  await user.save({validateBeforeSave:false})


  return res.status(200)
  .json(new ApiResponse(200,{},"Password change a successfully "))
        
    })

    const getCurrentUser=asyncHandler(async(req,res)=>{

      return res.status(200)
      .json(200,req.user, "current user fectching sucesssfully ")
    })
    const updateCurrentUser=asyncHandler(async(req,res)=>{
      const {fullname,email}=req.body
      if(!fullname && !email){
        throw new ApiError(400,"Atleast one field is required to update")
      }   
      const user=User.findByIdAndUpdate( 
        req.user?._id,
      {
        $set:{
          fullName,
          email:email
        }
      },
        
        {
          new:true
        }
        ).select("-password")
        return res.status(200)
        .json(new ApiResponse(200,user,"User updated successfully"))  
      })  

    const updateUserAvatar=asyncHandler(async(req,res)=>{
      const avatarLocalPath=req.file?.path
      if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required ")
       }  
       const avatar=await uploadOnCloudinary(avatarLocalPath)
       if(!avatar.url){
        throw new ApiError(500,"Avatar upload failed")
      }

       const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
          $set:{
            avatar:avatar.url

          }
        },
        {new:true}
      ).select("-password")
       return res
      .status(200)
      .json(
        new ApiResponse(200,user,"Avatar image updated sucessfully")
      )
    })
    
     const updateUsercoverImage=asyncHandler(async(req,res)=>{
      const coverImageLocalPath=req.file?.path
      if(!coverImageLocalPath){
        throw new ApiError(400,"coverImage file is required ")
       }  
       const coverImage=await uploadOnCloudinary(coverImageLocalPath)
       if(!coverImage.url){
        throw new ApiError(500,"coverImage is missing ")
      }

      await User.findByIdAndUpdate(
        req.user?._id,
        {
          $set:{
            coverImage:coverImage.url

          }
        },
        {new:true}
      ).select("-password")
      return res
      .status(200)
      .json(
        new ApiResponse(200,user,"cover image updated sucessfully")
      )
    })

    
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateCurrentUser,
  updateUserAvatar,
  updateUsercoverImage

         
}
