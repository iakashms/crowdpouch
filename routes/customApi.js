var express = require('express')
var multer  = require('multer')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const City = require('../models/city');
var router = express.Router()
var jsonParser = bodyParser.json()
var encodeParser = bodyParser.urlencoded({ extended: true })
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './my-uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})
var upload = multer({ storage: storage })

router.get('/',(req,res)=>{
    res.send({"status" : 200, "message" : "API is Live!"})
})

router.post('/user',jsonParser,async (req, res) => {
    try {
        let customErrors = {
            "status": 200,
            "errors": []
        }
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email: email});
        if(existingUser){
            customErrors.status = 400;
            customErrors.errors.push({
                "msg": `${email} is Already Taken.`,
                "param": "email"
            })
            return res.status(200).json(customErrors)
        }
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const user = new User({
            name: name,
            email: email,
            password: passwordHash
        });
        const userDetails = await user.save();
        return res.json({status: 200, dataSaved : userDetails});
    } catch (err) {
        console.log(err);
        return res.status(400).json({status: 400,message:`Something Went Wrong`,errorMessage:err})
    }
})
router.post('/login',jsonParser,async (req, res) => {
    try{
        let customErrors = {
            "status": 200,
            "errors": []
        }
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (!user) {
            customErrors.status = 400;
            customErrors.errors.push({
                "msg": `User ${email} does not exist!`,
                "param": "email"
            })
            return res.status(200).json(customErrors)
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            customErrors.status = 400;
            customErrors.errors.push({
                "msg": `Password is incorrect!`,
                "param": "password"
            })
            return res.status(200).json(customErrors)
        }
        const token = jwt.sign(
            { userId: user.id, email: user.email },
                'crowedPouchAppBackend',
            {
                expiresIn: '1h'
            }
        );
        return res.json({status: 200, loginDetails : { userId: user.id, token: token, tokenExpiration: 1}});
    } catch (err) {
        console.log(err);
        return res.status(400).json({status: 400,message:`Something Went Wrong`,errorMessage:err})
    }
})
router.get('/city',async (req, res) => {
    try{
        console.log(req.query)
        let customErrors = {
            "status": 200,
            "errors": []
        }
        if (!req.isAuth) {
            customErrors.status = 400;
            customErrors.errors.push({
                "msg": `Unauthenticated`
            })
            return res.status(200).json(customErrors)
        }
        let query = {}, sort = { _id: 1 } ;
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit);
        let queryParams = req.query;
        if(queryParams.query){
            query = Object.assign(JSON.parse(queryParams.query),query)
        }
        if(queryParams.sort){
            sort = JSON.parse(queryParams.sort);
        }
        console.log(sort)
        let skipIndex = (page - 1) * limit;
        console.log(skipIndex,limit)
        let cityDetails = await City.find(query)
                        .sort(sort)
                        .limit(limit)
                        .skip(skipIndex)
                        .exec();
        console.log(cityDetails)
        return res.json({status: 200, cityResults : cityDetails});
    } catch (err) {
        console.log(err);
        return res.status(400).json({status: 400,message:`Something Went Wrong`,errorMessage:err})
    }
})
router.get('/citywisepopulation/:sort',async (req, res) => {
    try{
        let sortType = req.params.sort
            sortType = sortType === 'desc' ? -1 : 1 ;
        let customErrors = {
            "status": 200,
            "errors": []
        }
        if (!req.isAuth) {
            customErrors.status = 400;
            customErrors.errors.push({
                "msg": `Unauthenticated`
            })
            return res.status(200).json(customErrors)
        }
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        let skipIndex = (page - 1) * limit;
        let query = [
            {
                "$group": { 
                    "_id": {
                        "city": "$city"
                    }, 
                    "pop": {
                        "$sum": "$pop"
                    }
                }
            },
            {
                "$sort": {
                   "pop" : sortType
                }
            },
            {
                "$project": {
                    "city": "$_id.city",
                    "population": "$pop"
                }
            },
            {
                "$skip":skipIndex
            },
            {
                "$limit":limit
            }
        ]
        console.log(skipIndex,limit)
        let cityDetails = await City.aggregate(query).exec()
        // console.log(cityDetails)
        return res.json({status: 200, cityResults : cityDetails});
    } catch (err) {
        console.log(err);
        return res.status(400).json({status: 400,message:`Something Went Wrong`,errorMessage:err})
    }
})
router.post('/upload/video',encodeParser,async (req, res) => {
    let customErrors = {
        "status": 200,
        "errors": []
    }
    try{
        if (!req.isAuth) {
            customErrors.status = 400;
            customErrors.errors.push({
                "msg": `Unauthenticated`
            })
            return res.status(200).json(customErrors)
        }
        let uploadFailed = false;
        await upload.single('myFile')(req, res, async (err,result) => {
            let fileDetails = req.file;
            if (err instanceof multer.MulterError) {
                uploadFailed = true
            } else if (err) {
                uploadFailed = true
            }
            if(uploadFailed){
                customErrors.status = 500
                customErrors.errors.push({
                    "msg": `Something Went Wrong : ${JSON.stringify(err)}.`,
                })
                return res.status(500).json(customErrors)
            }else{
                return res.status(200).json({status:200,message:`Video Uploaded Successfully`})
            }
        })
    }catch(e){
        console.error(`Error : POST : ${e}`)
        customErrors.status = 500
        customErrors.errors.push({
            "msg": `Something Went Wrong : ${JSON.stringify(e)}.`,
        })
        return res.status(200).json(customErrors)
    }
})

module.exports = router;