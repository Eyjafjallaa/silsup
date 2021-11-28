var express = require('express');
var router = express.Router();
var request = require('request');
var URL = require('../config/APIconfig')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/a',async(req,res)=>{
  var server;
  for(var x of URL){
    if (x.bankNum=="001"){
      server= x;
    }
  }
  request({url:server.URL+server.sendURL},(err,data,body)=>{
    result = JSON.parse(body)
    // console.log(result);
    res.json(result)
  })
})
module.exports = router;
