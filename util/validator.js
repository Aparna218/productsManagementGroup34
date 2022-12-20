const mongoose= require('mongoose')
//name
const isvalidName = (name) =>{
    const nameRegex = 
    /^[a-zA-Z]+$/
    return nameRegex.test(name)
} 
//email
const isValidEmail = (email) =>{
    const emailRegex = 
    /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/
    return emailRegex.test(email)
}
//password
const isvalidpassword = (password) =>{
    const passwordRegex = 
    /^[a-zA-Z0-9!@#$%^&*]{8,15}$/
    return passwordRegex.test(password)
} 
//profileimageUrl 
const isvalidimage = (image) =>{
    const Regex = 
    /^(ftp|https?):\/\/+(www\.)?[a-z0-9\-\.]{3,}\.[a-z]{3}$/
    return Regex.test(image)
} 
//phone
const isvalidphone = (phone) =>{
    const phoneRegex = 
    /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/
    return phoneRegex.test(phone)
} 
//pincode
const isvalidPinCode = (pincode) =>{
    const pincodeRegex = 
    /^[1-9][0-9]{5}$/
    return pincodeRegex.test(pincode)
} 
module.exports = {isvalidName,isValidEmail,isvalidpassword,isvalidimage,isvalidphone,isvalidPinCode}