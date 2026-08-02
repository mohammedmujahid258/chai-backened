import mongoose, {Schema, schema} from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";

const subscriptionSchema=new Schema({

    subscriber:{
        type:Schema.Types.ObjectId, /*one who ssubscribing*/

        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,/* one to who subscriber subscribing */

        ref:"User",

    }
   

},{timestamps:true})
export const Subscription=mongoose.model("Subscription",subscriptionSchema)