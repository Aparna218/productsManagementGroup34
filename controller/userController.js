const userModel = require('../model/userModel')
const aws = require('../aws/aws')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const { isValidObjectId } = require('mongoose');
const { isValidName, isValidEmail, isValidFile, isValidNumber, isValidPass, isValidAddress, isValidPin } = require('../util/validator');


//createUser
exports.createUser = async (req, res) => {
    try {
        const reqBody = req.body;
        const file = req.files;
        const { fname, lname, email, phone, password, address } = reqBody;

        if (file === undefined || !file.length || Object.keys(reqBody).length === 0) return res.status(400).send({ status: false, message: `Please provide user details` })

        if (!isValidFile(file[0].originalname)) return res.status(400).send({ status: false, message: `Enter formate jpeg/jpg/png only.` })

        if (!fname) return res.status(400).send({ status: false, message: `fname is required.` });
        if (!isValidName(fname)) return res.status(400).send({ status: false, message: ` '${fname}' this fname is not valid.` });

        if (!lname) return res.status(400).send({ status: false, message: `lname is required.` });
        if (!isValidName(lname)) return res.status(400).send({ status: false, message: ` '${lname}' this lname is not valid.` });

        if (!email) return res.status(400).send({ status: false, message: `email is required.` });
        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: ` '${email}' this email is not valid email.` });

        if (!phone) return res.status(400).send({ status: false, message: `phone is required.` });
        if (!isValidNumber(phone)) return res.status(400).send({ status: false, message: ` '${phone}' this is not valid indian phone number.` });

        if (!password) return res.status(400).send({ status: false, message: `password is required.` });
        if (!isValidPass(password)) return res.status(400).send({ status: false, message: `Use this combination 8-15 char & use 0-9,A-Z,a-z & special char.` });

        //address validation
        if (!address) return res.status(400).send({ status: false, message: `address is required.` });
        try {
            reqBody.address = JSON.parse(address);
        }
        catch (err) {
            if (err) return res.status(400).send({ status: false, message: `Please write address properly.` });
        }

        const { shipping, billing } = reqBody.address;

        //shipping validation
        if (!shipping) return res.status(400).send({ status: false, message: `shipping is required.` })

        if (!shipping.street) return res.status(400).send({ status: false, message: `street is required in shipping.` })
        if (!isValidAddress(shipping.street)) return res.status(400).send({ status: false, message: ` '${shipping.street}' street is not valid in shipping.` })

        if (!shipping.city) return res.status(400).send({ status: false, message: `city is required in shipping.` });
        if (!isValidAddress(shipping.city)) return res.status(400).send({ status: false, message: ` '${shipping.city}' city is not valid in shipping.` })

        if (!shipping.pincode) return res.status(400).send({ status: false, message: `pincode is required in shipping.` });
        if (!isValidPin(shipping.pincode)) return res.status(400).send({ status: false, message: ` '${shipping.pincode}' pincode is not valid in shipping.` })

        //billing validation
        if (!billing) return res.status(400).send({ status: false, message: `billing is required.` })

        if (!billing.street) return res.status(400).send({ status: false, message: `street is required in billing.` })
        if (!isValidAddress(billing.street)) return res.status(400).send({ status: false, message: ` '${billing.street}' street is not valid in billing.` })

        if (!billing.city) return res.status(400).send({ status: false, message: `city is required in billing.` });
        if (!isValidAddress(billing.city)) return res.status(400).send({ status: false, message: ` '${billing.city}' city is not valid in billing.` })

        if (!billing.pincode) return res.status(400).send({ status: false, message: `pincode is required in billing.` });
        if (!isValidPin(billing.pincode)) return res.status(400).send({ status: false, message: ` '${billing.pincode}' pincode is not valid in billing.` })

        //existing email
        const duplicateEmail = await userModel.findOne({ email });
        if (duplicateEmail) return res.status(400).send({ status: false, message: `Email already exits.` });

        //existing phone
        const duplicatePhone = await userModel.findOne({ phone });
        if (duplicatePhone) return res.status(400).send({ status: false, message: `Phone no already exits.` });

        //file uploading on aws
        reqBody['profileImage'] = await aws.uploadFile(file[0]);

        //password hashing
        reqBody['password'] = await bcrypt.hash(password, 10);

        //user creation
        const saveUser = await userModel.create(reqBody);
        return res.status(201).send({ status: true, message: `User created successfully!!`, data: saveUser });

    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err });
    }
};


// Login api
exports.loginuser = async function (req, res) {
    try {
        const data = req.body;
        let { email, password } = data;

        if (!email) return res.status(400).send({ status: false, message: "email is required." })
        if (!password) return res.status(400).send({ status: false, message: "password is required." })

        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "Please provide valid Email." })


        let user = await userModel.findOne({ email: email, password: password });
        let checkPassword = await bcrypt.compare(password, user.password)


        if (!user) return res.status(400).send({ status: false, msg: "email or password is not corerct" });

        let token = jwt.sign(
            { userId: user._id.toString() },
            "group34-secret-key",
            { expiresIn: '5h' }
        );
        let userdetails = { userId: user['_id'], token: token }

        console.log(token)
        return res.status(200).send({ message: "User login successfull", data: userdetails })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//Get users
exports.getUser = async function (req, res) {
    try {
        const userId = req.params.userId

        if (!userId) return res.status(400).send({ status: false, message: "userId is required." })
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Provide valid userId." })

        const getUser = await userModel.findById({ _id: userId })
        if (!getUser) return res.status(400).send({ status: false, message: "User not found by this UserId" })

        return res.status(200).send({ status: true, message: "User found", data: getUser })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//Update users
exports.updateUser = async function (req, res) {
    try {
        let data = req.body
        let files=req.files
        const userId = req.params.userId
        const updationfileds = {}

        if (!userId) return res.status(400).send({ status: false, message: "userId is required." })
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Provide valid userId." })
        let { fname, lname, email, phone, password, address } = data

        if (Object.keys(data).length = 0) return res.status(400).send({ status: false, message: "provid at least one field" })

        if (fname) {
            if (!isValidName(fname)) return res.status(400).send({ status: false, message: "provide valid fname" })
            updationfileds.fname = fname
        }

        if (lname) {
            if (!isValidName(lname)) return res.status(400).send({ status: false, message: "provide valid lname" })
            updationfileds.lname = lname
        }

        if (email) {
            if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "provide valid email" })
            updationfileds.email = email
        }

        if (phone) {
            if (!isValidNumber(phone)) return res.status(400).send({ status: false, message: "provide valid phone" })
            updationfileds.phone = phone
        }

        if (password) {
            if (!isValidPass(password)) return res.status(400).send({ status: false, message: "provide valid password" })
            updationfileds.password = password
        }
        //image updation......
        if(files){
            let uploadedURL = await aws.uploadFile(files[0])
            updationfileds.profileImage = uploadedURL
        }

       //address updation..........
        try {
            data.address = JSON.parse(address);
        
        }
        catch (err) {
            if (err) return res.status(400).send({ status: false, message: `Please write address properly.` });
        }
        const {shipping,billing}=data.address
        if(address){
            if(shipping.street){
                if(!isValidName(shipping.street))return res.status(400).send({ status: false, message: "provide valid shipping Street" })
                updationfileds["address.shipping.street"] = shipping.street
            }
            if(shipping.city){
                if(!isValidName(shipping.city))return res.status(400).send({ status: false, message: "provide valid shipping city" })
                updationfileds["address.shipping.city"] = shipping.city
            }
            if(shipping.pincode){
                if(!isValidPin(shipping.pincode))return res.status(400).send({ status: false, message: "provide valid shipping pincode" })
                updationfileds["address.shipping.pincode"] = shipping.pincode
            }

            if(billing.street){
                if(!isValidName(billing.street))return res.status(400).send({ status: false, message: "provide valid billing Street" })
                updationfileds["address.billing.street"] = billing.street
            }
            if(shipping.city){
                if(!isValidName(billing.city))return res.status(400).send({ status: false, message: "provide valid billing city" })
                updationfileds["address.billing.city"] = billing.city
            }
            if(shipping.pincode){
                if(!isValidPin(billing.pincode))return res.status(400).send({ status: false, message: "provide valid billing pincode" })
                updationfileds["address.billing.pincode"] = billing.pincode
            }
        }


        const updateUser = await userModel.findOneAndUpdate({ _id: userId }, { $set: updationfileds }, { new: true })
        if (!updateUser) return res.status(200).send({ status: true, message: "User not found by this userId" })
        return res.status(200).send({ status: true, message: "User updated sucessfully", data: updateUser })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

