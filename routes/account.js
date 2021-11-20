var express = require('express');
var router = express.Router();
const db = require('../middleware/db')
const decode = require('../middleware/token')
const defaultMoney= require('../config/default').money;
const defaultaccountID=require('../config/default').accountStartNum;
const crypto = require('crypto');

/* GET home page. */
router.post('/',decode, async(req, res)=> {
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
      console.log(error);
      res.status(400).json(error);
  }
});

router.post('/check',decode,async(req,res)=>{
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
    res.status(400).json(error);
  }
})

router.get("/name/:name",async(req,res)=>{
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
    console.log(error);
    res.status(400).json(error);
  }
})



module.exports = router;
