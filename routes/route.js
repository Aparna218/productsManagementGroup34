const express = require('express');
const router = express.Router();

const {createUser,login,getUser,updateUser}= require('../controller/userController')
const {authentication,authorization}=require('../middleware/auth')

//Register
router.post('/register',createUser )
//Login
router.post('/login',login)
//Get Users
router.get('/user/:userId/profile',authentication,getUser)
//Update Users
router.put('/user/:userId/profile',authentication,authorization,updateUser)


 module.exports= router