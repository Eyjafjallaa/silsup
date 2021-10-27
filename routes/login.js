var express = require('express');
var router = express.Router();
const db = require('../middleware/db');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const tokenkey = require('../config/tokenkey');
const decode = require('../middleware/token');

router.post('/',async(req, res)=> {
    var pw = crypto.createHash('sha512').update(req.body.pw).digest('base64');
    try {
        const sql = "SELECT * FROM sign WHERE id = ? AND pw = ?";
        const params = [req.body.id,pw];
        const result = (await db.executePreparedStatement(sql,params)).rows;
        //console.log(result)
        if(result.length>0){
            var user = {
                sub: req.body.id,
                iat: new Date().getTime() / 1000
            };
            var token = jwt.sign(user, tokenkey, {
                expiresIn: "772H"
            })
            res.status(200).json({
                logintoken: token,
            });
        }
        else{
            res.status(200).send('fail')
        }
    } catch (error) {
        res.status(400).json(error);
    }
});

router.post('/quick',decode,async(req,res)=>{
    var quickpw = crypto.createHash('sha512').update(req.body.quickpw).digest('base64');
    try {
        const sql = "SELECT id FROM sign WHERE id = ? AND quick = ?";
        const params = [req.token.sub,quickpw];
        const result = (await db.executePreparedStatement(sql,params)).rows;
        if(result.length>0){
            var user = {
                sub: req.body.id,
                iat: new Date().getTime() / 1000
            };
            var token = jwt.sign(user, tokenkey, {
                expiresIn: "772H"
            })
            res.status(200).json({
                logintoken: token,
            });
        }
        else{
            res.status(200).send('fail')
        }
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
})
module.exports = router;
