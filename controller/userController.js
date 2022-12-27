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

        if (file === undefined || !file.length || Object.keys(reqBody).length === 0) return res.status(400).send({ status: false, message: `Please provide Profile Image for user registration` })

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


//login
exports.login = async (req, res) => {
    try {
        const reqBody = req.body;
        const { email, password } = reqBody;
        if (Object.keys(reqBody).length === 0) return res.status(400).send({ status: false, message: `Please fill the data.` })

        if (!email) return res.status(400).send({ status: false, message: `email is required.` });
        if (!password) return res.status(400).send({ status: false, message: `Password is required.` });

        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: ` '${email}' this email is not valid.` });
        if (!isValidPass(password)) return res.status(400).send({ status: false, message: `Password should be 8-15 char & use 0-9,A-Z,a-z & special char this combination.` });

        //existUser
        const existUser = await userModel.findOne({ email });
        if (!existUser) return res.status(404).send({ status: false, message: 'Please register first.' });

        // decoding hash password
        const matchPass = await bcrypt.compare(password, existUser.password);
        if (!matchPass) return res.status(401).send({ status: false, message: 'Password is wrong.' })

        // token generation
        const payload = { userId: existUser._id, iat: Math.floor(Date.now() / 1000) };
        const token = jwt.sign(payload, 'group34', { expiresIn: '365d' });

        return res.status(200).send({ status: true, message: 'Login Successful.', data: { userId: existUser._id, token: token } });
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, error: err.message });
    }
};

//Get users
exports.getUser = async function (req, res) {
    try {
        const userId = req.params.userId

        if (!userId) return res.status(400).send({ status: false, message: "userId is required." })
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "` '${userId}' this is invalid userId.`" })

        const getUser = await userModel.findById({ _id: userId })
        if (!getUser) return res.status(400).send({ status: false, message: "Invalid UserId" })

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
        const obj = {}

        if (!userId) return res.status(400).send({ status: false, message: "userId is required." })
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Provide valid userId." })
        let { fname, lname, email,profileImage, phone, password, address } = data

        if (Object.keys(data).length = 0) return res.status(400).send({ status: false, message: "provid at least one field" })

        if (fname) {
            if (!isValidName(fname)) return res.status(400).send({ status: false, message: "provide valid fname" })
            obj.fname = fname
        }

        if (lname) {
            if (!isValidName(lname)) return res.status(400).send({ status: false, message: "provide valid lname" })
            obj.lname = lname
        }

        if (email) {
            if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "provide valid email" })
            obj.email = email
        }

        if (phone) {
            if (!isValidNumber(phone)) return res.status(400).send({ status: false, message: "provide valid phone" })
            obj.phone = phone
        }

        if (password) {
            if (!isValidPass(password)) return res.status(400).send({ status: false, message: "provide valid password" })
            pass = await bcrypt.hash(password, 10);
            obj.password = pass
        }
        //image updation......
        if(profileImage){
            let uploadedURL = await aws.uploadFile(files[0])
            obj.profileImage = uploadedURL
        }

       //address updation..........
       
        if(address){
            try {
                data.address = JSON.parse(address);
            
            }
            catch (err) {
                if (err) return res.status(400).send({ status: false, message: `Please write address properly.` });
            }
            const {shipping,billing}=data.address
            if(shipping.street){
                if(!isValidAddress(shipping.street))return res.status(400).send({ status: false, message: "provide valid shipping Street" })
                obj["obj.shipping.street"] = shipping.street
            }
            if(shipping.city){
                if(!isValidAddress(shipping.city))return res.status(400).send({ status: false, message: "provide valid shipping city" })
                obj["obj.shipping.city"] = shipping.city
            }
            if(shipping.pincode){
                if(!isValidPin(shipping.pincode))return res.status(400).send({ status: false, message: "provide valid shipping pincode" })
                obj["obj.shipping.pincode"] = shipping.pincode
            }

            if(billing.street){
                if(!isValidAddress(billing.street))return res.status(400).send({ status: false, message: "provide valid billing Street" })
                obj["obj.billing.street"] = billing.street
            }
            if(shipping.city){
                if(!isValidAddress(billing.city))return res.status(400).send({ status: false, message: "provide valid billing city" })
                obj["obj.billing.city"] = billing.city
            }
            if(shipping.pincode){
                if(!isValidPin(billing.pincode))return res.status(400).send({ status: false, message: "provide valid billing pincode" })
                obj["obj.billing.pincode"] = billing.pincode
            }
        }


        const updateUser = await userModel.findOneAndUpdate({ _id: userId }, { $set: obj }, { new: true })
        if (!updateUser) return res.status(200).send({ status: true, message: "User not found by this userId" })
        return res.status(200).send({ status: true, message: "User updated sucessfully", data: updateUser })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

