const mongoose= require('mongoose')

//isValidName
const isValidName = (name) => {
    if ((typeof name == 'string' && name.trim().length != 0 && name.match(/^[A-Z a-z]{2,}$/)))
        return true
    return false
};

//isValidEmail
const isValidEmail = (email) => {
    const regex =  /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/.test(email)
    return regex
};

//isValidFile
const isValidFile = (img) => {
    const regex = /(\/*\.(?:png|gif|webp|jpeg|jpg))/.test(img)
    return regex
}
//isValidPwd
const isValidPass = (pass) => {
    const regex = /^[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(pass)
    return regex
};

//isValidNumber
const isValidNumber = (ph) => {
    let regex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(ph)
    return regex
};

//isValidAddress
const isValidAddress = (txt) => {
    const regex = /^(?=.*[A-Za-z,.-?%!&]+)[A-Za-z,.-?%!&\s0-9]{2,}$/.test(txt)
    return regex
}

//isValidNumber
const isValidPin = (pin) => {
    let regex = /^[1-9]{1}[0-9]{5}$/.test(pin)
    return regex
};

//objectId
const isValidObjectId = (objId) => {
    return mongoose.Types.ObjectId.isValid(objId)
};

module.exports = { isValidName, isValidEmail, isValidFile, isValidNumber, isValidPass, isValidAddress, isValidPin, isValidObjectId };