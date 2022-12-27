const express = require('express');
const multer  = require('multer');
const route = require('./routes/route');
const mongoose  = require('mongoose');

const app = express();
app.use(multer().any());
app.use(express.json());
mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://aparna21:tpzmDVkZSc3mpMTf@cluster21.u69lmjr.mongodb.net/test", {
    useNewUrlParser: true
})

.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route);

app.use((req, res) => res.status(400).send({ status: false, message: 'Provide Valid url path' }));


app.listen(3000, function () {
    console.log('Express app running on port ' + (3000))
});