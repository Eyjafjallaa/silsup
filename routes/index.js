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
      server= x.URL;
    }
  }
  request({url:server+'account/find/id/001354799393'},(err,data,body)=>{
    result = JSON.parse(body)
    // console.log(body)
    console.log(result);
    res.json(result)
  })
})
module.exports = router;
