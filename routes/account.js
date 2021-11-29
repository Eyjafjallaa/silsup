var express = require('express');
var router = express.Router();
const db = require('../middleware/db')
const decode = require('../middleware/token')
const defaultMoney= require('../config/default').money;
const defaultaccountID=require('../config/default').accountStartNum;
const crypto = require('crypto');


router.get('/',decode, async(req,res,next)=>{
  try {
    var sql = 'select accounts.ID as accountID, accounts.money, sign.phonenum as userPhone, accounts.nickname from accounts left join sign ON accounts.sign_ID = sign.ID WHERE sign.ID= ?'
    const params = [req.token.sub];
    var result = (await db.executePreparedStatement(sql, params)).rows;
    sql = 'select sign.phonenum as phone, sign.name, sign.id, sign.birth from accounts left join sign ON accounts.sign_ID = sign.ID WHERE sign.ID = ?'
    var user = (await db.executePreparedStatement(sql,params)).rows[0]
    for(i in result){
      result[i].user=user;
    }
    res.status(200).json(result); 
  } catch (error) {
    error.status = 400;
    next(error);
  }
})

router.post('/',decode, async(req, res, next)=> {
  try {
      if(req.body.pw.length!=4){
        res.send(200).send('wrong passowrd');
        return;
      }

      var ID;
      while(true){
        ID= Math.floor(Math.random()*1000000000)
        var result = (await db.executePreparedStatement('SELECT * FROM accounts WHERE id = ?',[defaultaccountID+ID])).rows;
        if(result.length==0)break;
      }

      var pw = crypto.createHash('sha512').update(req.body.pw).digest('base64');
      const sql = "INSERT INTO accounts (ID, PW, money, sign_ID, nickname) VALUES (?,?,?,?,?)"
      const params = [defaultaccountID+ID, pw, defaultMoney,req.token.sub ,req.body.nickname];
      
      await db.executePreparedStatement(sql, params);
      res.status(200).send({msg:'success'});
  } catch (error) {
      error.status=400;
      next(error);
  }
});

router.post('/check',decode,async(req,res,next)=>{
  try {
    var sql = "SELECT * FROM sign WHERE ID=? AND name=? AND birth=?";
    var params = [req.token.sub,req.body.name,req.body.birth];
    // console.log(params)
    const result = (await db.executePreparedStatement(sql,params)).rows;
    // console.log(result);
    if (result.length==0){
      res.status(200).send({msg:'fail'});
    }else{
      res.status(200).json({msg:'success'});
    }
  } catch (error) {
    error.status(400);
    next(error);
  }
})

router.get("/name/:name",async(req,res,next)=>{
  try {
    const sql= "SELECT * FROM accounts WHERE nickname = ?"
    const params= [req.params.name]
    var result = (await db.executePreparedStatement(sql,params)).rows
    if(result.length==0){
      res.status(200).send({msg:'available'})
    }else{
      res.status(200).send({msg:'exist'});
    }
  } catch (error) {
    error.status(400);
    next(error);
  }
})



module.exports = router;
