var express = require('express');
var router = express.Router();
const db = require('../middleware/db');
const tokenkey = require('../config/tokenkey');
const decode = require('../middleware/token');
const crypto = require('crypto');
const API = require('../config/APIconfig');
var request = require('request');

router.post('/',decode,async(req,res,next)=>{// 송금
    try {
        // 서버 통신주소 찾기
        const banknum = req.body.receiveAccountId.substr(0,3);
        var server;
        for (var x of API) {
            if (banknum == x.bankNum) {
                server = x;
                break;
            }
        }

        //돈 출금
        var sql = "SELECT * from accounts WHERE id = ? "
        var params = [req.body.sendAccountId];
        const account = (await db.executePreparedStatement(sql,params)).rows;
        if (!account) {
            throw {
                status : 403,
                msg : '계좌가 없습니다.'
            }
        }
        if(account.money < req.body.money){
            throw{
                status :403,
                msg : '돈이 부족합니다.'
            }
        }
        sql = "UPDATE accounts SET money = money - ? WHERE ID = ?";
        params = [req.body.money,req.body.sendAccountId];
        await db.executePreparedStatement(sql,params);
        
        sql = "INSERT INTO log (send, receive, money) VALUES(?,?,?)"
        params = [req.body.sendAccountId, req.body.receiveAccountId,req.body.money];
        await db.executePreparedStatement(sql,params);

        const options = {
            uri : server.URL+server.sendURL,
            method: 'POST',
            json:true,
            body: {
                sendAccountId: req.body.sendAccountId,
                receiveAccountId: req.body.receiveAccountId,
                money: req.body.money,
            }
        }

        //입금
        request.post(options,(err,data,body)=>{
            if(err) throw err;
            console.log(body);
            // body = JSON.parse(body)
            res.status(body.status).json(body);
        })     
        
    } catch (error) {
        if(!error.status)
            error.status = 400;
        next(error);
    }
})


router.post('/receive',async(req,res,next)=>{
    //로그 남기고 
    //recieve 돈 증가하기
    try {
        var sql="UPDATE accounts SET money = money + ? WHERE ID = ?";
        var params = [req.body.money,req.body.receiveAccountId];
        db.executePreparedStatement(sql,params);
        
        if(req.body.sendAccountId.substr(0,3)!='003'){
            sql = "INSERT INTO log ( send, receive, money) VALUES(?,?,?)"
            params = [req.body.sendAccountId, req.body.receiveAccountId,req.body.money];
            await db.executePreparedStatement(sql,params);
        }

        res.json({
            status:200,
            msg:'입금 되었습니다.'
        })
    } catch (error) {
        if(!error.status)
            error.status = 400;
        next(error)
    }
})

router.get('/check/local/:accountID',async(req,res,next)=>{
    try {
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
            res.status(200).json({ 
                status:403,
                'msg': '등록되지 않은 계좌 입니다.', 
            })
        }
    } catch (error) {
        error.status(400);
        next(error);
    }
})

router.get('/check/:accountID',decode,async(req,res,next)=>{
    // console.log(banknum)
    try {
        const banknum = req.params.accountID.substr(0,3);
        var server;
        for (var x of API) {
            // console.log(x)
            if (banknum == x.bankNum) {
                server = x;
                break;
            }
        }
        // console.log(server.URL + server.findURL + req.params.accountID)
        const option = { 
            uri: server.URL + server.findURL + req.params.accountID 
        }
        request.get(option, (err, data, body) => {
            if (err) throw err;
            body = JSON.parse(body);
            res.status(body.status).json(body);
        })

    } catch (error) {
        error.status(400);
        next(error);
    }
})

  router.post('/pw',async(req,res,next)=>{
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
        error.status(400);
        next(error); 
      }
  })
module.exports=router;