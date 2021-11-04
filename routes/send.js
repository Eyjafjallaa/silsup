var express = require('express');
var router = express.Router();
const db = require('../middleware/db');
const tokenkey = require('../config/tokenkey');
const decode = require('../middleware/token');
const crypto = require('crypto');

router.put('/',async(req,res)=>{
    try {
        console.log(req.body);
        if(req.body.targetAccount.substr(0,3)=='003'){
            console.log('json')
        }else{
    
        }    
    } catch (error) {
        
    }
    res.send('')
})

router.get('/check/:accountID',async(req,res)=>{
    if(req.body.targetAccount.substr(0,3)=='003'){
        try {
            const sql = 'select * from accounts WHERE ID = ?'
            const params=[req.params.accountID];
            var result = (await db.executePreparedStatement(sql,params)).rows;
            if(result.length === 1){
                res.status(200).json({'msg':'success'})
            }else{
                res.status(200).json({'msg':'fail'})
            }
        } catch (error) {
            console.log(error);
            res.status(400).json(error);
        }
    }else{
        
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