var Db_Manager = require('../business/db_business');


let url = require('url');  
let dealFn = require('./dealfn.js');

function sendDataFn(req, res, filename, needcity) {
    let query = url.parse(req.url, true).query,
        name = query.name || '',
        city = query.city,
        readFileName = '',
        sendData = {
            errno: 0,
            city: city,
            msg: 'ok',
            data: {}
        };
    if (needcity) {
        readFileName = city + filename;
    } else {
        readFileName = filename;
    }
    dealFn.readFileData(name + readFileName).then((data) => {
        sendData.data = data;
        res.send(JSON.stringify(sendData));
    }, (msg) => {
        sendData.errno = -1;
        sendData.msg = '暂时没有数据';
        res.send(JSON.stringify(sendData));
    })
}

function sendResult(res, result){
   try{
     let sendData = {
            errno: 0,
            msg: 'ok',
            data: result
      };
     res.send(JSON.stringify(sendData));
   }catch(err){
     console.error("出错了，原因是:"+err);
   }
}


exports.swiper = (req, res) => {
    sendDataFn(req, res, 'swiper.json', false);
}

exports.city = (req, res) => {
    sendDataFn(req, res, 'city.json', false);
}

exports.cinema_detail = (req, res) => {
    sendDataFn(req, res, 'cinema_detail.json', false);
}

exports.getConnection = (req, res) => {
    Db_Manager.selectConnections().then((result)=>{
        sendResult(res, result);
    }).catch(err=>{
      sendResult(res, err);
    });
}

exports.getSchemaList = (req, res) => {
   let {db} = req.params;
   Db_Manager.getSchemaList(db, (err , result, fields)=>{
       if(err){
         sendResult(res,err);
       }else{
         sendResult(res,result);
       }
   });

};

exports.getTableList = (req, res) => {
   let {db, schema} = req.params;
   Db_Manager.getTableList(db, schema,(err, results, fields)=>{
     if(err){
       sendResult(res, err);
     }else{
       let columnName = fields[0].name;
       let tableNames = results.map(p=>{
         return p[columnName];
       });
       sendResult(res, tableNames);
     }
   });
};

exports.commands = (req, res) =>{
  let {id, schema, commands} = req.body;
  Db_Manager.commands(id, schema, commands, (err, result)=>{
      sendResult(res, result);
  });
};
