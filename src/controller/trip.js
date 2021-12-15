//Import model that require to make http request
const { trip, country, user, transaction} = require('../../models')
const fs = require('fs')
const Joi = require('joi') 
const cloudinary = require('../helper/cloudinary')
const streamifier = require('streamifier')

//Simplicity:
const countryInformation = 
    {
        model : country,
        as : 'country',
        attributes: {
            exclude :  ["id","createdAt", "updatedAt"]
        }
    }

const transactionInformation = {
    model : transaction,
    as : 'tripTransactions',
    where: {
        status: "Approve"
    },
    attributes :{
        exclude :  ["id","status","attachment","idTrip","idUser","counterQty","createdAt", "updatedAt"]
    }
} 

const tripExclude =   ["createdAt", "updatedAt","idCountry","idUser"]

//1. Controller for add trip
exports.addTrip = async (req, res) =>{
        // Make validation scheme using joi
        const scheme = Joi.object({
            title: Joi.string().required(),
            country: Joi.string().required(),
            accomodation: Joi.string().required(),
            transportation: Joi.string().required(),
            eat: Joi.string().required(),
            day: Joi.string().required(),
            night: Joi.string().required(),
            dateTrip: Joi.string().required(),
            price: Joi.number().required(),
            quota: Joi.number().required(),
            description: Joi.string().required(),
        })
        //Check data user that register match or not with the scheme:
        const {images,quotaFilled, ...dataVal} = req.body;
        const {error} = scheme.validate(dataVal)
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

            for (file of req.files){
                fs.unlinkSync('upload/trip/'+file.filename)
            }

            return res.status(400).send({
                status : 'error',
                message : err.join(' ')
            })
        }

    try {
        const {country:countryName, ...data} = req.body;
        const admin = await user.findOne({
            where:{
                id : req.user.id
            }
        }) 
        if(!admin){
            res.status(404).send({
                status: 'failed',
                message : 'The token is not valid'
            })
        }

        //Cek is the trip have been exist or not
        const matchTrip = await trip.findOne({
            where :{
                title : req.body.title
            }
        })
        if(matchTrip){
            // Prevent picture get save's
            for (file of req.files){
                fs.unlinkSync('upload/trip/'+file.filename)
            }
            return res.status(400).send({
                status: 'failed',
                messsage :'This name trip has been existed',
            })
        }

        //Check is countryName exist in category table
        let countryTrip = await country.findOne({
            where:{
                name : countryName
            }
        }) 

        if(!countryTrip){
            //if country don't exist direct creted data in countrytrip table 
            countryTrip = await country.create({name : countryName}) //there'is ID inside this
        }
        //Making data trip that will send in response data:
        //Add new product:
        // http://localhost:3002/upload/trip/
        let images = []
        for (file of req.files){
            const path = await cloudinary.uploader.upload(file.path,{
                folder : 'trip',
                use_filename : true,
                unique_filename: false
            })
            images.push(path.public_id)
        }

        const tripAdded = await trip.create({
            ...data,
            idCountry : countryTrip.id,
            idUser : req.user.id, // this idUser only we get when we login as a admin
            images : JSON.stringify(images)
        })

        //Make response data for response body
        const tripData = await trip.findOne({
            where : {
                id : tripAdded.id
            },
            include: countryInformation,
            attributes:{
                exclude : tripExclude 
            }
        }) 
        //Send response
        res.send({
            status : 'sucsess',
            data : tripData ,
        })
    } catch (error) {
        if(req.files){
            //Prevent picture get save's
            for (file of req.files){
                fs.unlinkSync('upload/trip/'+file.filename)
            }
        }
        res.status(500).send({
            status: 'failed',
            message:'Server error'
        })
    }
}

//2. Controller for get trip
exports.getTrips = async(req, res)=>{
    try {
        let findData = await trip.findAll({
            include : countryInformation,
            attributes:{
                include: ['id', 'title', 'images', 'price']             
            },
            raw : true,
            nest: true
        })

        findData = findData.map(data=>{
            let images = []
            for (file of JSON.parse(data.images)){
                const path = cloudinary.url(file,{secure: true})
                images.push(path)
            }

            return({
                ...data,
                images: JSON.stringify(images)
            })

        })
        res.status(200).send({
            status : 'success',
            data : findData
        })
    } catch (error) {
        res.status(500).send({
            status: 'failed',
            message:'Server error'
        })
    }
}

exports.getTripTransactions = async(req, res)=>{
    try {

        let findData = await trip.findAll({
            include: [countryInformation,transactionInformation],
            attributes:{
                exclude:  ["createdAt", "updatedAt","accomodation","day",
                "description","eat","id","idCountry","idUser","night","price",
                "quota","transportation"
            ]         
            }
        })

        res.status(200).send({
            status : 'success',
            data : findData
        })
    } catch (error) {
        res.status(500).send({
            status: 'failed',
            message:'Server error'
        })
    }
}

//3. Controller for get trip by id
exports.getTrip = async (req, res)=>{
    try {
        let findData = await trip.findOne({
            where:{
                id : req.params.id
            },
            include:countryInformation,
            attributes:{
                    exclude :  tripExclude 
                },
                raw : true,
                nest : true
        })

        let images = []
        for (file of JSON.parse(findData .images)){
            const path = cloudinary.url(file,{secure: true})
            images.push(path)
        }

        findData = {
            ...findData,
            images : JSON.stringify(images)
        }
        res.status(200).send({
            status : 'success',
            data : findData
        }) 
    } catch (error) {
        res.status(500).send({
            status: 'faild',
            message: 'Server error'
        })
    }
}

//4. Controller for edit trip
exports.editTrip = async (req,res)=>{
    try {

        const {id} = req.params

        const tripFinded = await trip.findOne({
            where :{id}
        })
        let data
        if(req.files){
            for (file of JSON.parse(tripFinded.images)){
                await cloudinary.uploader.destroy(file,(result)=>console.log("Deleted :", result))
            }
        
            let images = []
            for (file of req.files){
                const path = await cloudinary.uploader.upload(file.path,{
                    folder : 'trip',
                    use_filename : true,
                    unique_filename: false
                })
                images.push(path.public_id)
            }
            data = {
                ...req.body,
                images : JSON.stringify(images)
            }
        }else{
            data = {
                ...req.body
            }
        }

        await trip.update(data, {
            where :{
                id
            },
        })
        //Make response data
        let tripData = await trip.findOne({
            where:{
                id
            },
            include:countryInformation,
            attributes:{
                exclude :  tripExclude 
            }
        }) 

        res.status(200).send({
            status : 'success',
            data : tripData
        }) 
    } catch (error) {
        res.status(500).send({
            status: 'faild',
            message: 'Server error'
        })
    }
}

//5. Controller for delete trip
exports.deleteTrip = async (req, res)=>{
    try {
        const { id } = req.params
        //Delete trip images:
        const tripData = await trip.findOne({
            where :{id}
        })

        if(tripData && req.files){

            for (file of JSON.parse(tripData.images)){
                await cloudinary.uploader.destroy(file,(result)=>console.log("Deleted :", result))
            }

        }

        await trip.destroy({
            where :{
                id
            },
        })

        res.status(200).send({
            status : 'success',
            data : {
                id
            }
        }) 
    } catch (error) {
        res.status(500).send({
            status: 'faild',
            message: 'Server error'
        })
    }
}