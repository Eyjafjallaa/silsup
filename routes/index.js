var express = require('express');
var router = express.Router();
var request = require('request');
var URL = require('../config/APIconfig')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/a',async(req,res,next)=>{
  try {
    const a=[];
    a=[];
    res.status(200).json({});
  } catch (error) {
    next(error);
  }
})
module.exports = router;
