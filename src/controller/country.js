
//Import model that require to make http request
const { country } = require('../../models')
const Joi = require('joi') 

//1. Make controller to add country 
exports.addCountry = async (req, res)=>{
    const scheme = Joi.object({
        name: Joi.string().required(),
    })
    const {error} = scheme.validate(req.body)
    
    if(error){ 

        return res.status(400).send({
            status : 'error',
            message : 'Please Fill Country Name'
        })
    }

    try {

        //Cek is the country have been exist or not
        const matchCountry = await country.findOne({
            where :{
                name : req.body.name[0].toUpperCase()+req.body.name.substring(1)
            }
        })

        if(matchCountry){
            return res.status(400).send({
                status: 'failed',
                message :'This name country has been exist',
            })
        }
        
        const countryAdded = await country.create(req.body)
        
        //Make response data:
        const dataCountry = await country.findOne({
            where: {id:countryAdded.id},
            attributes: {
                exclude :  ["createdAt", "updatedAt"]
            }
        })

        res.status(201).send({
            status : 'success',
            data : dataCountry
        })   
    } catch (error) {

        res.status(500).send({
            status: 'faild',
            message: 'Server error'
        })
    }
}

//2. Make controller to get all data country 
exports.getCountries = async (req, res)=>{
    try {
        const findData = await country.findAll({
            attributes:{
                exclude :  ["createdAt", "updatedAt"]
            }
        })
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

//3. Make controller to get data country by id
exports.getCountry = async (req, res)=>{
    try {
        const findData = await country.findOne({
            where :{
                id : req.params.id
            },
            attributes:{
                exclude :  ["createdAt", "updatedAt"]
            }
        })
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

//4. Make controller to get Edit country by id
exports.editCountry = async (req, res)=>{
    try {
        const {id} = req.params
        await country.update(req.body, {
            where :{
                id
            },  
        })

        //make response data:
        const dataCountry = await country.findOne({
            where :{
                id 
            },
            attributes:{
                exclude :  ["createdAt", "updatedAt"]
            }
        })

        res.status(200).send({
            status : 'success',
            data : dataCountry
        }) 
    } catch (error) {

        res.status(500).send({
            status: 'faild',
            message: 'Server error'
        })
    }
}

//5. Make controller to get Edit country by id
exports.deleteCountry = async (req, res)=>{
    try {
        const { id } = req.params
        await country.destroy({
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