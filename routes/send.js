var express = require('express');
var router = express.Router();
const db = require('../middleware/db');
const tokenkey = require('../config/tokenkey');
const decode = require('../middleware/token');

router.put('/',async(req,res)=>{

})


module.exports=router;