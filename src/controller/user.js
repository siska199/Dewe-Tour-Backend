//Import model that require to make http request
const { user } = require('../../models')
//Import package that require's:
//->Joi's pakage for validation data
const Joi = require('joi') 
//->bcrypt's pakage for encryption data
const bcrypt = require('bcrypt')
//->jsonwebtoken's pakage for validation data
const jwt = require('jsonwebtoken')

//import fs:
const fs = require('fs')

//Import Cloudinary:
const cloudinary = require('../helper/cloudinary')

//1. Make controller to add data (Register)
exports.register = async (req, res)=>{
    // Make validation scheme using joi
    const scheme = Joi.object({
        fullName: Joi.string().min(2).required(),
        email: Joi.string().email().min(7).required(),
        password: Joi.string().min(7).required(),
        phone: Joi.number().integer().required(),
        address: Joi.string().required(),
        gender: Joi.string().required()
    })
    //Check data user that register match or not with the scheme:
    const {error} = scheme.validate(req.body)
    //if error exist that means there is something dont match beetween schme and data that we add:
    if(error){
        const err = error.details[0].message.split(' ').map((e,i)=>{
            if(i==0){
                const word = JSON.parse(e)
                return(word[0].toUpperCase()+word.substring(1))
            }else{
                return(e)
            }
        })

        return res.status(400).send({
            status : 'error',
            message : err.join(' ')
        })
    }
    try {
        //Cek is the gmail have been registered or not
        const matchEmail = await user.findOne({
            where :{
                email : req.body.email
            }
        })
        if(matchEmail){
            //Prevent image uplouded
            // fs.unlinkSync('upload/profile/'+req.file.filename)
            return res.status(400).send({
                status: 'failed',
                message :'This email has been registered',
            })
        }

        //if error not happen / email haven't registered, so next step we make encryption for user's password:
        const salt = await bcrypt.genSalt(10);
        //Encryption password:
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        //Add user's data to database
        const userCreated = await user.create({
            ...req.body,
            password: hashedPassword,
            image : 'https://res.cloudinary.com/university-state-of-malang-city/image/upload/v1639396684/profile/profile_x0iats.jpg', //Default value
            status: "user" //Default value
        })

        //generate token base on status of user
        const token = jwt.sign({id: userCreated.id},process.env.TOKEN_USER)

        res.status(201).send({
            status :'success',
            data : {
                email: userCreated.email,
                token
            }
        })
    } catch (error) {
        res.status(500).send({
            status: 'faild',
            message: 'Server error'
        })
    }
}

//2. Make controller to login user (Login)
exports.login = async (req, res) =>{
    //Making scheme for validate user login
    const scheme = Joi.object({
        email : Joi.string().email().min(7).required(),
        password : Joi.string().min(6).required()
    }) 
    const {error} = scheme.validate(req.body)
    if(error){
        const err = error.details[0].message.split(' ').map((e,i)=>{
            if(i==0){
                const word = JSON.parse(e)
                return(word[0].toUpperCase()+word.substring(1))
            }else{
                return(e)
            }
        })
        return res.status(400).send({
            status  : 'error',
            message : err.join(' ')
        })
    }
    try {
        //After data user get validate than we search the user's data in database
        //Search email's data that match
        const userFinded = await user.findOne({
            where:{
                email : req.body.email
            },
            attributes : {
                exclude : ['fullName','phone','address','createdAt','updatedAt']
            }
        })

        //if data user's (email) not found
        if(!userFinded){
            res.status(404).send({
                status : 'failed',
                message: 'Email or password is wrong'
            })
        }
        //validate password match or not:
        const isPasswordValid = await bcrypt.compare(req.body.password, userFinded.password)

        //if data user's (password) not match
        if(!isPasswordValid){
            return res.status(404).send({
                status: 'failed',
                message: 'Email and password dont match'
            })
        }

        //If data get validated (user and password found or match) next:
        //Generate token:
        const token = jwt.sign({id: userFinded.id},process.env.TOKEN_USER)

        res.status(200).send({
            status:'success',
            message: 'Login success',
            data :{
                email : userFinded.email,
                token,
                status: userFinded.status,
                image: cloudinary.url(userFinded.image,{secure:true})
            }
        })
    } catch (error) {
        res.status(500).send({
            status: 'failed',
            message: 'Server error'
        })
    } 
}

//3. Make controller to get users:
exports.getUsers = async (req, res) =>{
    try {
        let dataUsers = await user.findAll({
            attributes : {
                exclude : ['createdAt','updatedAt','password']
            },
            raw: true,
            nest: true,
        })

       dataUsers =  dataUsers.map(data=>{
           return({
               ...data,
                image : cloudinary.url(data.image,{secure:true})
           })
       }) 
       
        res.status(200).send({
            status: 'success',
            data : dataUsers
        })

    } catch (error) {
        res.status(500).send({
            status: 'failed',
            message: 'Server error'
        })
    }
}

//4. Make controller to get user by id (Profile):
exports.getUser = async (req, res) =>{
    try {
        let dataUser = await user.findOne({
            where:{
                id : req.user.id
            },  
            attributes : {
                exclude : ['createdAt','updatedAt',"password"]
            },
            raw: true,
            nest: true,
        })

        dataUser = {
            ...dataUser,
            image : cloudinary.url(dataUser.image,{secure:true})
        }
        
        res.status(200).send({
            status: 'success',
            data : dataUser
        })

    } catch (error) {
        res.status(500).send({
            status: 'failed',
            message: 'Server error'
        })
    }
}

//Make controller to edit userdata (picture only) :
exports.updateUser = async (req, res) =>{
    try {
        
        let data 
        if(req.file){
            const dataUser = await user.findOne({
                where:{
                    id : req.user.id
                }
            })
            if(!dataUser.image.match(/profile\/profile_x0iats.jpg/g) ){
                //Get public id :
                await cloudinary.uploader.destroy(dataUser.image,(result)=>console.log("Result destroy: ",result))
            }
            const imagePath = await cloudinary.uploader.upload(req.file.path,{
                folder: 'profile',
                use_filename:true,
                unique_filename: false
            })

            data = {
                ...req.body,
                image : imagePath.public_id
            }
        }else{
            data = req.body
        }

        await user.update(data, {
            where :{
                id : req.user.id
            },
        })
        
        res.status(200).send({
            status: 'success',
            message : 'Success update user data',
            data
        })

    } catch (error) {
        res.status(500).send({
            status: 'failed',
            message: 'Server error'
        })
    }
}


//5. Make controller to delete user:
exports.deleteUser = async (req, res) =>{
    try {
        const {id} = req.params;

        //Delete profile image user:
        const userData = await user.findOne({
            where :{id}
        })
        
        if(!userData){
            res.status(401).send({
                status : 'failed',
                message : 'this user has been removed'
            })
        }
        //Ekstra
        if(!userData.image.match(/profile\/profile_x0iats.jpg/g)){
            await cloudinary.uploader.destroy(userData.image, (result)=console.log(result))
        }

        //Delete user drom database
        await user.destroy({
            where: {id}
        })
    
        res.status(200).send({
            status : 'success',
            data : {
                id
            } 
        })
    } catch (error) {
        res.status(500).send({
            status: 'failed',
            message:'Server error'
        })
    }
}

//6. Make controller to Check user:
exports.checkAuth = async (req, res)=>{
    try {
        const id = req.user.id;
        const dataUser = await user.findOne({
            where : {
                id
            },
            attributes :{
                exclude: ["createdAt", "updatedAt", "password"],
            }
        })
        if (!dataUser) {
            return res.status(404).send({
              status: "failed",
            });
          }


          res.status(200).send({
              status : 'success',
              data : {
                email : dataUser.email,
                status: dataUser.status,
                image: cloudinary.url(dataUser.image,{secure:true})
              }
          })
    } catch (error) {
        res.status(500).send({
          status: "failed",
          message: "Server Error",
        });
    }
}

