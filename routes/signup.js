var express = require('express');
var router = express.Router();
const db = require('../middleware/db');
var fileload = require('../middleware/fileload');
/* GET home page. */
router.get('/', async (req, res)=> {
  res.send({title:"something responded"})
});

router.post('/',fileload.single('attachmnet'),async(req, res)=> {
    console.log(req.file);
});

module.exports = router;
