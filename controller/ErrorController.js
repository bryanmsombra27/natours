/* eslint-disable no-prototype-builtins */
/* eslint-disable no-unused-vars */
/* eslint-disable node/no-unsupported-features/es-syntax */
const AppError = require('../utils/appError');

/* eslint-disable prettier/prettier */
const sendErrorDev = (err,res) =>{
    res.status(err.statusCode).send({
        status:err.status,
        error:err,
         message:err.message,
         stack:err.stack
      })    
}
const sendErrorProd = (err,res)=>{
    if(err.isOperational){
        res.status(err.statusCode).send({
            status:err.status,
             message:err.message
    
          })
    }else{
        console.error("Error ",err);
        res.status(500).send({
            status:"error",
             message:"algo anda mal"
    
          })
    }
  
}   
const handleCastErrorDB = (err) =>{
    const message = `invalido: ${err.path}: ${err.value}.`;
    return new AppError(message,400);
}
const handleDuplicateFieldsDB = (err) =>{
    // console.log(err.keyValue.name);
    // const value =  err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
   const value = err.keyValue.name || err.keyValue.email;

    const message =`Campos Duplicados por favor utilice otro valor  valor ingresado:${value}`;
    return new AppError(message,400);
}  


const handleValidationErrorDB = (err)=>{
        // console.log(err.errors.ratingsAverage.message);
        let message;

        if(err.errors.ratingsAverage){
        message = err.errors.ratingsAverage;
    }else if(err.errors.difficulty){
        message = err.errors.difficulty;
    }else{
        message = err.errors.passwordConfirm
    }

        return new AppError(message,400);

}


const handleJsonWebTokenError = error=>new AppError("El token es invalido, logueate",401);
const handleTokenExpiredError= error=>new AppError("El token ha expirado, logueate",401);
const globalErrorHandler =(err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";


    if(process.env.NODE_ENV ==="development"){
        sendErrorDev(err,res);
    }else if(process.env.NODE_ENV ==="production"){
        let error ={...err}; 
        
        if(error.name === "CastError") error= handleCastErrorDB(error);
        if(error.code ===11000) error = handleDuplicateFieldsDB(error); 
        // if(error.name==="ValidationError") error= handleValidationErrorDB(error);
        if(error.name ==="JsonWebTokenError") error = handleJsonWebTokenError(error);
        if(error.name ==="TokenExpiredError") error = handleTokenExpiredError(error);
    
        //controlador de ERRORES PARA ACTUAlIZAR
         if(err.errors) {
             if(error.errors.ratingsAverage || error.errors.difficulty || error.errors.passwordConfirm){
                 error = handleValidationErrorDB(error);
             } 
         }
         
          sendErrorProd(error,res);
    }
    
}


  module.exports ={
      globalErrorHandler 
  }