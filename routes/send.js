var express = require('express');
var router = express.Router();
const db = require('../middleware/db');
const tokenkey = require('../config/tokenkey');
const decode = require('../middleware/token');
const crypto = require('crypto');
const API = require('../config/APIconfig');
var request = require('request');

router.put('/',decode,async(req,res)=>{
    try {
        console.log(req.body);
        const banknum = req.body.targetAccount.substr(0,3);
        if(banknum =='003'){
            console.log('json')
        }else{
            
        }    
    } catch (error) {
        
    }
    res.send('')
})

router.get('/check/:accountID',decode,async(req,res)=>{
    const banknum = req.params.accountID.substr(0,3);
    console.log(banknum)
    try {
        if(banknum=='003'){
            var sql = 'select accounts.ID as accountID, accounts.money, sign.phonenum as userPhone from accounts left join sign ON accounts.sign_ID = sign.ID WHERE accounts.ID = ?'
            const params = [req.params.accountID];
            var result = (await db.executePreparedStatement(sql, params)).rows;
            sql = 'select sign.phonenum as phone, sign.name, sign.id, sign.birth from accounts left join sign ON accounts.sign_ID = sign.ID WHERE accounts.ID = ?'
            var user = (await db.executePreparedStatement(sql,params)).rows[0]
            if (result.length === 1) {
                result[0].user=user;
                res.status(200).json({ 
                    status:200,
                    msg: 'success' ,
                    data:result[0]
                })
            } else {
                res.status(200).json({ 'msg': 'fail' })
            }
        }
        else{
            var server;
            for(var url of API){
                console.log(url)
                if(banknum==url.bankNum){
                    server = url.URL;
                    break;
                }
            }
            request({url:server+'account/find/id/'+req.params.accountID},(err,data,body)=>{
                if(err)throw err;
                body = JSON.parse(body);
                res.status(body.status).json(body);
            })
        }
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
})

  router.post('/pw',async(req,res)=>{
      try {
        const sql = "SELECT * FROM accounts WHERE pw = ? AND ID=?"
        var pw = crypto.createHash('sha512').update(req.body.pw).digest('base64');
        const params=[pw,req.body.account];
        const result = (await db.executePreparedStatement(sql,params)).rows;
        if(result.length === 1){
            res.status(200).json({'msg':'success'})
        }else{
            res.status(200).json({'msg':'fail'})
        }
      } catch (error) {
          console.log(error);
          res.status(400).json(error)  
      }
  })
module.exports=router;