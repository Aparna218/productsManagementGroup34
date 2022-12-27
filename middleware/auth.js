const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const userModel = require('../model/userModel')

const {isValidObjectId}=require('../util/validator')



//authorization
const authentication = async (req, res, next) => {
    try {
        let token = req.headers.authorization
        if (!token) return res.status(400).send({ status: false, message: `Please provide token.` })
        token = req.headers.authorization.slice(7);
        console.log(token)
       await jwt.verify(token, 'group34', (err, decoded) => {
            if (err) return res.status(401).send({ status: false, message: `Authentication Failed!`, error: err.message })
            req['user'] = decoded.userId
            next()
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, error: err.message })
    }
};

//authorization
const authorization = async (req, res, next) => {
    try {
        const userId = req.params.userId
        if (!userId) return res.status(400).send({ status: false, message: `userId is required.` });
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: ` '${userId}' this userId isn't valid.` })

        if (req.user != userId)
            return res.status(403).send({ status: false, message: ` '${userId}'You are unauthorized.` });
        next()
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};

module.exports = { authentication, authorization };