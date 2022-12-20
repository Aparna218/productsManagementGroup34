const express = require('express');
const router = express.Router();

const {createuser,loginuser,getUser,updateUser}= require('../controller/userController')
const{authenticaion,authorization}=require('../middleware/auth')

//Register
router.post('/register',createuser )
//Login
router.post('/login',loginuser)
//Get Users
router.get('/user/:userId',getUser)
//Update Users
router.put('/user/:userId',updateUser)


 module.exports= router