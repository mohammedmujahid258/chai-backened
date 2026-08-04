import express from "express"
import cookieParser from "cookie-parser"
const app=express()
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
// routes import 
import userRouter from "./routes/user.routes.js"   
// route declaration
app.use("/api/v1/user",userRouter)  
// Keep the plural form available for clients using /api/v1/users.
app.use("/api/v1/users", userRouter)
// http:localhost :8000/api/v1/users/register

// Return API errors as JSON instead of Express's default HTML error page.
app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500
    res.status(statusCode).json({
        statusCode,
        success: false,
        message: error.message || "Something went wrong",
        errors: error.errors || []
    })
})


export {app}
