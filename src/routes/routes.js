const express = require('express')
const router = express.Router()
const { uploadFile } = require('../middleware/uploadfile')
const {auth} = require('../middleware/auth')
const { register, login, getUsers, deleteUser, getUser , checkAuth, updateUser} = require('../controller/user')
const { addTrip, getTrips, deleteTrip, getTrip, editTrip, getTripTransactions } = require('../controller/trip')
const { addCountry, getCountries, getCountry, editCountry, deleteCountry } = require('../controller/country')
const { addTransaction, getTransactions, getTransaction, editTransaction, deleteTransaction} = require('../controller/transaction')
const { sendEmail } = require('../controller/additional')


//Send email
router.post('/send-email',sendEmail)

//User
router.post('/register',uploadFile('image'),register)
router.post('/login',login)
router.get('/users',auth,getUsers)
router.get('/profile',auth,getUser)
router.delete('/user/:id',auth,deleteUser)
router.patch('/user',auth, uploadFile('image'),updateUser)
router.get('/check-auth',auth,checkAuth)

//Trip:
router.post('/trip',auth,uploadFile('images'),addTrip)
router.get('/trips',getTrips) 
router.get('/trip-transactions', getTripTransactions )
router.get('/trip/:id',getTrip)
router.patch('/trip/:id',auth,uploadFile('images'),editTrip)
router.delete('/trip/:id',auth,deleteTrip)

//Country
router.post('/country',auth,addCountry)
router.get('/countries',getCountries)
router.get('/country/:id',getCountry)
router.patch('/country/:id',auth,editCountry)
router.delete('/country/:id',auth,deleteCountry)

//Transaction
router.post('/transaction',auth,addTransaction)
router.get('/transactions',auth,getTransactions)
router.get('/transaction/:id',auth,getTransaction)
router.patch('/transaction/:id',auth,uploadFile('attachment'),editTransaction)
router.delete('/transaction/:id',auth,deleteTransaction)

//Export module router
module.exports = router