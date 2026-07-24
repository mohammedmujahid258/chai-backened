import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import dotenv from "dotenv"

dotenv.config({ path: "./.env", override: true })

 cloudinary.config({ 
        cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
        api_key:process.env.CLOUDINARY_API_KEY , 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });
const uploadOnCloudinary=async (localFilePath)=>{
        try{
            if (!localFilePath) return null
            // upload the file on cloudinary
            const response= await cloudinary.uploader.upload(localFilePath,{
                resource_type:"auto"
            })
            // file has been upload sucessfull
            // console.log("file is uploaded on cloudinary",
            //     response.url)
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath)
            }
                return response
                
            
        }
        catch(error){
            const message = error?.error?.message || error?.message || JSON.stringify(error)
            console.error("Cloudinary upload error:", message)
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath)
            }
            throw new Error(`Cloudinary upload failed: ${message}`)

        }
    }
    export {uploadOnCloudinary}
   
