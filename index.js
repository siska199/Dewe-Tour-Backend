//Import package that required:
require('dotenv').config()
//1.express's package
const express = require('express')
//2.router's module
const router = require('./src/routes/routes')
//3. import path package
const path = require('path');
//4. import cors
const cors = require('cors')
//Put express in app variable
const app = express()
//User express.json() to receive/send data in json form
app.use(express.json())
app.use(cors())//Put above api key
//Make route for access the api
app.use('/api199/v1/', router)
//Initialize cors so we can use it

//Serve an image 
const dir = path.join(__dirname);
app.use(express.static(dir));

//Make server
const port = process.env.PORT || 3002;
app.listen(port,()=>{
    console.log(`listen to port ${port}`)
}) 