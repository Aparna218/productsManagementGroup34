const express = require('express');
const router = express.Router();

const {createuser,loginuser}= require('../controller/userController')

//Register
router.post('/register',createuser )
//Login
router.post('/login',loginuser)


 module.exports= router