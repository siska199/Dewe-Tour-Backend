//Import model that require to make http request
const Op = require('sequelize').Op;
const { user, trip, transaction, country} = require('../../models')
const fs = require('fs')
const cloudinary = require('../helper/cloudinary')

//Simplicity:
const countryInformation = 
    {
        model : country,
        as : 'country',
        attributes: {
            exclude :  ["updatedAt","id"]
        }
    }

const tripInformation = {
    model: trip,
    as : 'trip',
    attributes: {
        exclude : ['id','eat','description','quota','images','idUser','idCountry','createdAt', 'updatedAt']
    },
    include: countryInformation
}

const userInformation = {
    model: user,
    as : 'user',
    attributes: {
        exclude : ['email','image','address','status','password','createdAt', 'updatedAt']
    },
}

const transactionExclude = ['createdAt','idTrip','idUser']

//Add transaction
exports.addTransaction = async(req, res)=>{
    try {
        const {counterQty,...data} = req.body;
        const userAssociated = await  user.findOne({
            where:{
                id : req.user.id
            }
        })
        if(!userAssociated){
            res.status(404).send({
                status: 'failed',
                message : `Can't add transaction`
            })
        }

        // Cek idTrip exist or not:
        const tripAssociated = await  trip.findOne({
            where:{
                id : req.body.idTrip
            }
        }) 

        if(!tripAssociated){
            res.status(404).send({
                status: 'failed',
                message : 'No Trip not found'
            })
        }

        //Add transaction:
        const transactionAdded = await transaction.create({
            ...data,
            idUser :req.user.id,
            counterQty,
            attachment: '',
            status : 'Waiting Payment'

        })
        
        // Make data for response body
        const dataResponse = await transaction.findOne({
            where:{
                id : transactionAdded.id
            },
            include : tripInformation,
            attributes:{
                exclude :  transactionExclude
            },
        })
        res.status(200).send({
            status : 'success',
            data : dataResponse
        }) 

    } catch (error) {
        res.status(500).send({
            status: 'failed',
            message:'Server error'
        })
    }
}

//Get transactions
exports.getTransactions = async (req, res) =>{

    try {

        //check role user:
        const userData = await user.findOne({
            where : {
                id : req.user.id
            }
        })

        let dataFinded
        if(userData.status=='admin'){
            dataFinded = await transaction.findAll({
                where : {
                    status: {
                        [Op.not]: 'Waiting Payment'
                      }
                },
                include : [
                    tripInformation,
                    userInformation
                ],
                attributes:{
                    exclude : transactionExclude
                },
                raw : true,
                nest : true
            })

        }else{
            dataFinded = await transaction.findAll({
                include : [
                    tripInformation,
                    {
                        model: user,
                        as : 'user',
                        where : {
                            id : req.user.id
                        },
                        attributes: {
                            exclude : ['email','image','address','status','password','createdAt', 'updatedAt']
                        },
                    }
                ],
                attributes:{
                    exclude : transactionExclude
                },
                raw : true,
                nest : true
            })

        }
        dataFinded = dataFinded.map(data=>{
            if(data.status!="Waiting Payment"){
                return({
                    ...data,
                    attachment: cloudinary.url(data.attachment, {secure: true})
                })
            }else{
                return({
                    ...data,
                })
            }
        })
        res.status(200).send({
            status : 'success',
            data : dataFinded
        }) 

    } catch (error) {
        res.status(500).send({
            status: 'failed',
            message:'Server error'
        })
    }
}

//Get transaction by id
exports.getTransaction = async (req, res) =>{
    try {
        let dataFinded = await transaction.findOne({
            where :{
                id : req.params.id
            },
            include : tripInformation,
            attributes:{
                exclude : transactionExclude
            },
            raw : true,
            nest: true
        })
        
        dataFinded = {
            ...dataFinded,
            attachment : cloudinary.url(dataFinded.attachment, {secure: true})
        }

        res.status(200).send({
            status : 'success',
            data : dataFinded
        }) 

    } catch (error) {
        res.status(500).send({
            status: 'failed',
            message:'Server error'
        })
    }
}

//Edit transaction by id
exports.editTransaction = async (req, res) =>{
    try {
        const {id} = req.params

        let dataForm
        
        if(req.file){
            attachmentPath = await cloudinary.uploader.upload(req.file.path,{
                folder : 'attachment',
                use_filename:true,
                unique_filename: false

            })
            dataForm = {
                ...req.body,
                attachment:attachmentPath.public_id
            }
        }else{
            dataForm = {...req.body}
        }
        //Data transaction sebelum di Edit
        const dataTransaction = await transaction.findOne({
            where : {
                id
            }
        })
        //Find data trip that associate with transaction 
        const tripFinded = await trip.findOne({
            where :{
                id : dataTransaction.idTrip
            }
        })

        if(req.body.status=="Approve" && dataTransaction.status=="Payment Rejected"){
            await trip.update(
                {quota : tripFinded.quota-dataTransaction.counterQty},
                {where : {
                    id : dataTransaction.idTrip
            }}) 
        }

        // Edit quota in trip:
        if(req.body.status=="Waiting Approve"){
            await trip.update(
                {quota : tripFinded.quota-dataTransaction.counterQty},
                {where : {
                    id : dataTransaction.idTrip
            }}) 
        }else if(req.body.status=="Payment Rejected"){
            await trip.update(
                {quota : tripFinded.quota+dataTransaction.counterQty},
                {where : {
                    id : dataTransaction.idTrip
            }})
        }

        await transaction.update(dataForm, {
            where :{
                id 
        }})



        //Make response data:
        const dataResponse = await transaction.findOne({
            where :{
                id
            },
            include : tripInformation,
            attributes:{
                exclude : transactionExclude
            },
        })

        res.status(200).send({
            status : 'success edit',
            data : dataResponse
        }) 
    } catch (error) {
        res.status(500).send({
            status: 'failed',
            message:'Server error'
        })
    }
}

//Delete transaction 
exports.deleteTransaction = async (req, res) =>{
    try {
        const {id} = req.params;
        //Delete profile image user:
        const transactionData = await transaction.findOne({
            where :{id}
        })

        if(!transactionData){
            res.status(401).send({
                status : 'failed',
                message : 'this transaction data has been removed'
            })
        }

        if(transactionData.attachment){
            await cloudinary.uploader.destroy(transactionData.attachment,(result)=>console.log("Destroy result: ",result))
        }

        await transaction.destroy({
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