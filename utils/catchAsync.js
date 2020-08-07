/* eslint-disable prettier/prettier */
const catchAsync = fn =>{
    return (req,res,next) =>{
      fn(req,res,next).catch(next)
    }
  }
  

  module.exports ={catchAsync}
  ;