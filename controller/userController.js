const userModel = require('../model/userModel')
const aws = require('../aws/aws')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const validator = require('../util/validator')
const {isvalidName,isValidEmail,isvalidpassword,isvalidimage,isvalidphone,isvalidPinCode} = validator

//Register api
const createuser = async function(req,res){
    try {
        const data = req.body
        let files = req.files

        let {fname,lname,email,profileImage,phone,password,address}=data

        if(Object.keys(data).length = 0) return res.status(400).send({status:false, message:"Please Provide body Details"})
       
        if(!fname)return res.status(400).send({status:false, message:"fname is mandatory"})
        if(!lname)return res.status(400).send({status:false, message:"lname is mandatory"})
        if(!email)return res.status(400).send({status:false, message:"email is mandatory"})
        if(!profileImage)return res.status(400).send({status:false, message:"profileImage is mandatory"})
        if(!phone)return res.status(400).send({status:false, message:"phone is mandatory"})
        if(!password)return res.status(400).send({status:false, message:"password is mandatory"})
        

        if(!isvalidName(fname))return res.status(400).send({status:false, message:"Please provide valid fname"});
        if(!isvalidName(lname))return res.status(400).send({status:false, message:"Please provide valid lname"});
        if(!isValidEmail(email))return res.status(400).send({status:false, message:"Please provide valid email"});
        if(!isvalidphone(phone))return res.status(400).send({status:false, message:"Please provide valid phone"})
        if(!isvalidpassword(password))return res.status(400).send({status:false, message:"Please provide valid password"})
        
        //data.address = JSON.parse(address);
       //let {shipping, billing}= data.address;
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
        const userEmail = await userModle.findOne({email})
        if(userEmail == email) return res.status(400).send({status:false, message:"This emails is already exist"})
        const userPhone= await userModel.findOne({phone})
        if(userPhone == phone) return res.status(400).send({status:false, message:"This mobile number is already exist"})

        //bcryption of password
        data.password = await bcrypt.hash(password,saltRounds)

        //creating profileImage Url
        if (files && files.length > 0) {
            data.profileImage = await uploadFile(files[0])}
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
const loginuser = async function(req,res){
    try {
        const data = req.body;
        let {email, password} = data;
        
        if(!email) return res.status(400).send({ status: false, message: "email is required." })
        if(!password)return res.status(400).send({ status: false, message: "password is required." })

        if(!isValidEmail(email))return res.status(400).send({ status: false, message: "Please provide valid Email." })
        if(!isValidPassword(password))return res.status(400).send({ status: false, message: "Please provid valid Password." })
        
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

module.exports.createuser= createuser;
module.exports.loginuser= loginuser