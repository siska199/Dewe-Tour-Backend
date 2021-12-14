const nodemailer = require('nodemailer')
exports.sendEmail = async (req, res)=>{
    try {
        let trasnporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth : {
                user : 'dewetour199@gmail.com',
                pass : '199Dewe@'
            }
        })
        let htmlContent = `
                <h1><strong>Contact Us Form</strong></h1>
                <p>from : ${req.body.email}</p>
                <p>${req.body.name} contacted with the following Details</p>
                <br/>
                <p>Message: ${req.body.message}</p>`

        let mailOptions = {
            from : req.body.email,
            to : 'dewetour199@gmail.com',
            subject: 'Contact Us',
            html: htmlContent
        }
        trasnporter.sendMail(mailOptions, function(error, info){
            if(error){
                return res.status(400).send({
                    status : 'error',
                    message : error
                })
            }else{
                return res.status(200).send({
                    status : 'Success',
                    message : info.response
                })
            }
        })
    } catch (error) {
        return res.status(500).send({
            status : 'error',
            message : error
        })
    }
}