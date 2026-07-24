class ApiError extends Error{
    constructor(
        statusCode,
        messages="Something went wrong",
        error=[],
        stack=""
    ){
        super(messages)
        this.statusCode=statusCode
        this.data=null
        this.success=false;
        this.errors=error
        if(stack){
            this.stack=stack


        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }

    }
}
export   {ApiError}
