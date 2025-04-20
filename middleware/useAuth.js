const jwt = require('jsonwebtoken')
const secret_key = '55354trw4fvrg65grtv56'
const userModel = require('../model/userModel')

module.exports = async(req,res,next) =>{
  const token = req?.headers?.authorization;
  console.log("....>>>>.Token >>>>",token)
  if(!token){
    return res.status(401).json({massage:"Unauthoriza"});
  }
  const splitToken = token.split(" ")[1]
  // console.log(">>>>>>SplitToken>>>",splitToken)
  
  const decode = jwt.verify(splitToken,secret_key)
  // console.log(">>>>Decode>>>",decode)
  if(!decode){
    return res.status(401).json({massage:'invalid token'});
  }
  const user = await userModel.findById(decode._id)
  console.log(">>>>>>decode>>>>",user)
  if(!user){
    return res.status(401).json({massage:'user not found'})

  }
  req.user = user;
  next() 
}