const asyncHandler = (handler)=>{
    return async(req,res,next)=>{
        try {
            await handler(req,res,next)
        } catch (error) {
            // next(error)
            console.log({error : error})
        }
    }
}

export default asyncHandler