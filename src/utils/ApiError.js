class ApiError extends Error{
    constructor(
        statusCode,
        messages="Something went wrong",
        error=[],
        statck=""
    ){
        super(messages)
        this.statusCode=statusCode
        this.data=null
        this.message=this.message
        this.sucess=false;
        this.errors=errors
        if(statck){
            this.stack=statck


        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }

    }
}
export {ApiError}