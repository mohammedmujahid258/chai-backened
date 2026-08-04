import mongoose from "mongoose"
 import { DB_NAME } from "../constants.js"
 const connectDB=async()=>{
 try {
   if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not configured")
   }
   const mongoUri = process.env.MONGODB_URI.replace(/\/+$/, "")
   const connectionInstance= await mongoose.connect(`${mongoUri}/${DB_NAME}`)
    console.log(`\n mongoDB connected !! DB HOST:${connectionInstance.connection.host}` );
    
    
 } catch (error) {
    console.log("MONGODB connection error ",error);
    process.exit(1)
    
    
 }
 }
 export default connectDB
 
