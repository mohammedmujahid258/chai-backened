import mongoose from"mongoose"
const { Schema } = mongoose

const videoSchema=new Schema(
    {
        videoFile:{
            type:String,/*cloudinary*/
            required:true


        },
        thumbnail:{
            type:String,/* cloudinary  url*/
            required:true
        },
          title:{
            type:String,
            required:true
        },
          discription:{
            type:String,
            required:true
        },
        duration:{
            type:Number,
            required:true
        },
        view:{
            type:Number,
            default:0
        

        },
        isPublished:{
            type:Boolean,
             default:true

        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },

        

    },
    {
         timestamps:true
    }
)
export const Video=mongoose.model("Video",videoSchema)
