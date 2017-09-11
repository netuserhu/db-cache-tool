var Db_Manager = require('../business/db_business');


let url = require('url');  

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

exports.getConnection = (req, res) => {
    Db_Manager.selectConnections().then((result)=>{
        sendResult(res, result);
    }).catch(err=>{
      sendResult(res, err);
    });
}

exports.getSchemaList = (req, res) => {
   let {db} = req.params;
   Db_Manager.getSchemaList(db).then((result)=>{
      let {results, fields} = result;
      sendResult(res,results);
   }).catch((err)=>{
      sendResult(res,err);
   });

};

exports.getTableList = (req, res) => {
   let {db, schema} = req.params;
   Db_Manager.getTableList(db, schema).then((result)=>{
       let {results, fields} = result;
       let columnName = fields[0].name;
       let tableNames = results.map(p=>{
         return p[columnName];
       });
       sendResult(res, tableNames);
   }).catch((err)=>{
      sendResult(res,err);
   });
};

exports.commands = (req, res) => {
  let {id, schema, commands} = req.body;
  Db_Manager.commands(id, schema, commands, (err, result)=>{
      sendResult(res, result);
  });
};
