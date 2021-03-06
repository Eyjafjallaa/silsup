var express = require('express');
var router = express.Router();
const db = require('../middleware/db');
var fileload = require('../middleware/fileload');
const crypto = require('crypto');
const  jwt =require('jsonwebtoken');
const tokenkey = require('../config/tokenkey')
const decode = require('../middleware/token')
const defaultImage= require('../config/default').picture;
/* GET home page. */
router.get('/', async (req, res)=> {
  res.send({title:"something responded"})
});

router.get('/id/:id',async(req,res,next)=>{
    try {
        const sql="SELECT id FROM sign WHERE id = ?";
        const params=[req.params.id];
        var result =(await db.executePreparedStatement(sql,params)).rows;
        if(result.length>0){
            res.status(200).json({msg:'exist'})
        }
        else{
        res.status(200).json({msg:'available'});
        }
    } catch (error) {
        error.status(400);
        next(error);
    }
})


router.post('/',fileload.single('attachment'),async(req, res,next)=> {
    console.log(req.body);
    try{
        var pw = crypto.createHash('sha512').update(req.body.pw).digest('base64');
        const sql="INSERT INTO sign(ID,PW,phonenum,birth,name,nickname,profile) values(?,?,?,?,?,?,?)";
        var picture = defaultImage
        if (req.file != undefined){
            picture = "/images/signup/"+req.file.filename
        }
        const params=[req.body.id,pw,req.body.phonenum,req.body.birth,req.body.name,req.body.nickname,picture];
        await db.executePreparedStatement(sql,params);
        var user = {
            sub: req.body.id,
            iat: new Date().getTime() / 1000
        };
        var token = jwt.sign(user, tokenkey, {
            expiresIn: "772H"
        })
        res.status(200).json({
            msg: token,
        });
    }
    catch(err){
        error.status(400);
        next(error);
    }
});

router.post('/quick',decode,async(req,res,next)=>{
    var quickpw = crypto.createHash('sha512').update(req.body.quickpw).digest('base64');
    try {
        const sql = "UPDATE sign SET quick=? WHERE ID = ?"
        const params = [quickpw, req.token.sub];
        await db.executePreparedStatement(sql,params);
        res.status(200).json({msg:"success"});
    } catch (error) {
        error.status(400);
        next(error);
    }
})

router.get('/profile',decode,async(req,res,next)=>{
    try {
        const sql="SELECT phonenum,birth,name,nickname from sign WHERE id = ?"
        const params =[req.token.sub];
        const result = (await db.executePreparedStatement(sql,params)).rows;
        res.status(200).json(result[0]);
    } catch (error) {
        error.status(400);
        next(error);
    }
})
module.exports = router;
