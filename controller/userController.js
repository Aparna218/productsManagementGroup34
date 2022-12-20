const userModel = require('../model/userModel')
const aws = require('../aws/aws')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const validator = require('../util/validator');
const { isValidObjectId } = require('mongoose');
const {isvalidName,isValidEmail,isvalidpassword,isvalidimage,isvalidphone,isvalidPinCode} = validator

//Register api
exports.createuser = async function(req,res){
    try {
        const data = req.body
        

        let {fname,lname,email,profileImage,phone,password,address}=data

        if(Object.keys(data).length = 0) return res.status(400).send({status:false, message:"Please Provide body Details"})
       
        if(!fname)return res.status(400).send({status:false, message:"fname is mandatory"})
        if(!lname)return res.status(400).send({status:false, message:"lname is mandatory"})
        if(!email)return res.status(400).send({status:false, message:"email is mandatory"})
        //if(!profileImage)return res.status(400).send({status:false, message:"profileImage is mandatory"})
        if(!phone)return res.status(400).send({status:false, message:"phone is mandatory"})
        if(!password)return res.status(400).send({status:false, message:"password is mandatory"})
        

        if(!isvalidName(fname))return res.status(400).send({status:false, message:"Please provide valid fname"});
        if(!isvalidName(lname))return res.status(400).send({status:false, message:"Please provide valid lname"});
        if(!isValidEmail(email))return res.status(400).send({status:false, message:"Please provide valid email"});
        if(!isvalidphone(phone))return res.status(400).send({status:false, message:"Please provide valid phone"})
        if(!isvalidpassword(password))return res.status(400).send({status:false, message:"Please provide valid password"})
        
        data.address = JSON.parse(address);
        data.address=address
       
        if(!address.shipping.street)return res.status(400).send({status:false, message:"Shipping street address is required"})
        if(!isvalidName(address.shipping.street))return res.status(400).send({status:false, message:"Please provide valid shipping.street"});
        if(!address.shipping.city)return res.status(400).send({status:false, message:"Shipping city address is required"})
        if(!isvalidName(address.shipping.city))return res.status(400).send({status:false, message:"Please provide valid shipping.city"});
        if(!address.shipping.pincode)return res.status(400).send({status:false, message:"Shipping pincode address is required"})
        if(!isvalidPinCode(address.shipping.pincode))return res.status(400).send({status:false, message:"Please provide valid shipping.pincode"});
        
        if(!address.billing.street)return res.status(400).send({status:false, message:"billing street address is required"})
        if(!isvalidName(address.billing.street))return res.status(400).send({status:false, message:"Please provide valid billing.street"});
        if(!address.billing.city)return res.status(400).send({status:false, message:"billing city address is required"})
        if(!isvalidName(address.billing.city))return res.status(400).send({status:false, message:"Please provide valid billing.city"});
        if(!address.billing.pincode)return res.status(400).send({status:false, message:"billing pincode address is required"})
        if(!isvalidPinCode(address.billing.pincode))return res.status(400).send({status:false, message:"Please provide valid billing.pincode"});
        
        //checking emial and phone exists
        const userEmail = await userModel.findOne({email})
        if(userEmail.email == email) return res.status(400).send({status:false, message:"This emails is already exist"})
        const userPhone= await userModel.findOne({phone})
        if(userPhone.phone == phone) return res.status(400).send({status:false, message:"This mobile number is already exist"})

        //bcryption of password
        data.password = await bcrypt.hash(password,saltRounds)

        //creating profileImage Url
        let files = req.files
        if (files && files.length > 0) {
            
              let  uploadedFileURL = await aws.uploadFile(files[0])
                data.profileImage = uploadedFileURL}
            
        else {
            return res.status(400).send({ status: false, message: "Please upload profile image for registration" })
        }
        

        const usercreated = await userModel.create(data)
        return res.status(201).send({status : true, message: "User created successfully",data: usercreated})
        
    } catch (error) {
        return res.status(500).send({status : false, message: error.message})
    }
}

// Login api
exports.loginuser = async function(req,res){
    try {
        const data = req.body;
        let {email, password} = data;
        
        if(!email) return res.status(400).send({ status: false, message: "email is required." })
        if(!password)return res.status(400).send({ status: false, message: "password is required." })

        if(!isValidEmail(email))return res.status(400).send({ status: false, message: "Please provide valid Email." })
       
        
        let user = await userModel.findOne({ email: email, password: password });
        let checkPassword = await bcrypt.compare(password, user.password)
        

        if(!user)return res.status(400).send({ status: false, msg: "email or password is not corerct" });

        let token = jwt.sign(
            {userId: user._id.toString()},
            "group34-secret-key",
            { expiresIn: '5h' }
        );
        let userdetails = { userId: user['_id'], token: token }

        console.log(token)
        return res.status(200).send({message:"User login successfull",data:userdetails})
        
    } catch (error) {
        return res.status(500).send({status : false, message: error.message})
    }
}

//Get users
exports.getUser = async function(req,res){
    try {
        const userId = req.params.userId
       
        if(! userId)return res.status(400).send({ status: false, message: "userId is required." })
        if(!isValidObjectId(userId))return res.status(400).send({ status: false, message: "Provide valid userId." })
         
        const getUser = await userModel.findById({_id: userId})
        if(!getUser)return res.status(400).send({ status: false, message: "User not found by this UserId" })

        return res.status(200).send({ status: true, message: "User found" , data:getUser})
    } catch (error) {
        return res.status(500).send({status : false, message: error.message})
    }
}

//Update users
exports.updateUser = async function(req,res){
    try {
        let data = req.body
        const userId = req.params.userId
        const updationfileds = {}

        if(! userId)return res.status(400).send({ status: false, message: "userId is required." })
        if(!isValidObjectId(userId))return res.status(400).send({ status: false, message: "Provide valid userId." })
       let {fname,lname,email,phone,password, address} = data

       if(Object.keys(data).length=0)return res.status(400).send({status:false, message:"provid at least one field"})
       
       if(fname){
        if(!isvalidName(fname))return res.status(400).send({status:false, message:"provide valid fname"})
        updationfileds.fname=fname
       }

       if(lname){
        if(!isvalidName(lname))return res.status(400).send({status:false, message:"provide valid lname"})
        updationfileds.lname=lname
       }

       if(email){
        if(!isValidEmail(email))return res.status(400).send({status:false, message:"provide valid email"})
        updationfileds.email=email
       }

       if(phone){
        if(!isvalidphone(phone))return res.status(400).send({status:false, message:"provide valid phone"})
        updationfileds.phone=phone
       }

       if(password){
        if(!isvalidphone(password))return res.status(400).send({status:false, message:"provide valid password"})
        updationfileds.password=password
       }
       


       

       

        const updateUser = await userModel.findOneAndUpdate({_id:userId},{$set:updationfileds},{new:true})
        if(!updateUser)return res.status(200).send({ status: true, message: "User not found by this userId"})
        return res.status(200).send({ status: true, message: "User updated sucessfully" , data:updateUser})
    } catch (error) {
        return res.status(500).send({status : false, message: error.message})
    }
}

