//Import package that required
const multer =  require('multer')

exports.uploadFile = (image) =>{
    //Initialization multer diskstorage:
    const storage = multer.diskStorage({
        // Make destination where the file should get save
        destination : function (req, file, cb){
            if(image=='images'){
                cb(null, "upload/trip")
            }else if(image=='image'){
                cb(null, "upload/profile")
            }else{
                cb(null, "upload/attachment")
            }
        },
        filename: function(req, file, cb){
            cb(null, Date.now()+'-'+file.originalname.replace(/\s/g,''))
        }
    })

    //Make filter
    const fileFilter = function(req,file,cb){
        if(file.filename===image){
            if(!file.originalName.match(/\.(|jpg|JPG|jpeg|JPEG|png|PNG)%/))
                req.fileValidationError = {
                    message : 'Only image files are allowed'
                }
                return cb(new Error('Only image files are allowed'), false)
        }
        cb(null, true)
    }
    const sizeInMB = 10;
    const maxSize = sizeInMB*1000*1000

//Manipulate here for uplouds sigle or multiple image
    let upload

    if(image=='image'|| image=='attachment'){
        upload  = multer({
            storage,
            fileFilter,
            limits:{
                fileSize: maxSize
            }
        }).single(image)
    }

    if(image=='images'){
        upload  = multer({
            storage,
            fileFilter,
            limits:{
                fileSize: maxSize
            }
        }).array(image,7)
    }

    return (req, res, next)=>{
        upload(req, res, function(err){
            if(req.fileValidationError){
                return res.status(400).send(req.fileValidationError)
            }

            if(!err){
                if(!image=='images' && !req.files){
                    return res.status(400).send({
                        message: 'Please select files to uploud'
                    })
                }

                if(!image=='image' || !image=='attachment' && !req.file){
                    return res.status(400).send({
                        message: 'Please select file to uploud'
                    })
                }
            }

            if(err){
                if(err.code=="LIMIT_FILE_SIZE"){
                    return res.status(400).send({
                        message: 'Max file sized 10MB'
                    })
                }
                return res.status(400).send(err)
            }

            return next()
        })
    }
}