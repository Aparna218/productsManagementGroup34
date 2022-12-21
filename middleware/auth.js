const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const userModel = require('../model/userModel')

//Authenticaion.........................................................................................................
exports.authenticaion = async function(req,res,next){
    try {

        let token = req.headers["authorization"]
        //token = token.split(" ")   
        
        

        if (!token)return res.status(400).send({ status: false, message: "Token is required." })
       // token = token.split(" ")
    
        let decodedToken = jwt.verify(Token, 'group42-very-very-secret-key', function (err, decodedToken) {
            if (err)return res.status(401).send({ status: false, message: err.message })
            else req.token = decodedToken
             next()
        })
    }

    catch (err) {return res.status(500).send({ status: false, message: err.message })}
}

//Authorizaion......................................................................................................
exports.authorization = async function(req,res,next){
    try {
        const userId = req.params.userId
        if(!userId)return res.status(400).send({status:false,message:"provide userId"})
        if(mongoose.isValidObjectId(userId))return res.status(400).send({status:false,message:"provide valid userId"})
         
        const userData = await userModel.findById({userId})
         if(!userData)return res.status(400).send({status:false,message:"User not found by this userId"})
         if (userData['_id'].toString() !== req.token.userId)return res.status(403).send({ status: false, message: "Unauthorized User Access!" })
        next()

    } catch (error) {
        return res.status(500).send({status:false, message:error.message})
    }
}

