var express = require('express');
var router = express.Router();
const db = require('../middleware/db');
var fileload = require('../middleware/fileload');
/* GET home page. */
router.get('/', async (req, res)=> {
  res.send({title:"something responded"})
});

router.post('/',fileload.single('attachmnet'),async(req, res)=> {
    try{
        await db.executePreparedStatement("INSERT INTO sign(ID,PW,email,birth,name,nickname,profile) values(?,?,?,?,?,?,?)",
        [req.body.id,req.body.pw,req.body.email,req.body.birth,req.body.name,req.body.nickname,"public/images/sign"+req.file.filename]);
    }
    catch(err){
        res.status(400).json({err});
    }
    console.log(req.file);
});

module.exports = router;
