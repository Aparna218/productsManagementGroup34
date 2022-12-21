const express = require('express');
const router = express.Router();

const {createUser,loginuser,getUser,updateUser}= require('../controller/userController')
const mw=require('../middleware/auth')

//Register
router.post('/register',createUser )
//Login
router.post('/login',loginuser)
//Get Users
router.get('/user/:userId',getUser)
//Update Users
router.put('/user/:userId',updateUser)


 module.exports= router