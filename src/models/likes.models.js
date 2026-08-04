import mongoose,{Schema} from "mongoose";
const likeSchema=new mongoose.Schema({
    video:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video",
        required:true
    },
    comment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment",
        required:true
    },
    tweet:{
        type:Schema.Types.ObjectId,
        ref:"Tweet",
        required:true
    },
    likedby:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true       
    },
   
},{timestamps:true})
export const Like=mongoose.model("Like",likeSchema)