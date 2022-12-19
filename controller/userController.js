const userModel = require('../model/userModel')
const aws = require('../aws/aws')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const saltRounds = 10;
c

//Register api
const createuser = async function(req,res){
    try {
        const data = req.body

        let {fname,lname,profileImage,email,password,address,...rest}=data
        

        const usercreated = await userModel.create(data)
        return res.status(201).send({status : true, message: "User created successfully",data: usercreated})
        
    } catch (error) {
        return res.status(500).send({status : false, message: error.message})
    }
}

// Login api
const loginuser = async function(req,res){
    try {
        
    } catch (error) {
        return res.status(500).send({status : false, message: error.message})
    }
}

module.exports.createuser= createuser;
module.exports.loginuser= loginuser