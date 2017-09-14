var Db_Manager = require('../business/db_business');
let session = require('session');

let url = require('url'); 
var request = require('superagent'); 
let indexUrl = process.env.INDEX||"http://localhost:3000";

function sendResult(res, result){
   try{
     let sendData = {
            data: result
      };
     res.send(JSON.stringify(sendData));
   }catch(err){
     console.error("出错了，原因是:"+err);
   }
}

function sendError(res , status , error){
     res.status(status);
     res.send(JSON.stringify(error));
}

exports.index = (req, res) => {
    res.render('index');
}

exports.getConnection = (req, res) => {
    let user = req.session.username;
    Db_Manager.selectConnections(user.id).then((result)=>{
        sendResult(res, result);
    }).catch(err=>{
      let errorMsg = {};
      errorMsg.code = err.code;
      errorMsg.msg = err.sqlMessage;
      sendError(res, 500 ,errorMsg);
    });
}

exports.getSchemaList = (req, res) => {
   let {db} = req.params;
   Db_Manager.getSchemaList(db).then((result)=>{
      let {results, fields} = result;
      sendResult(res,results);
   }).catch((err)=>{
      let errorMsg = {};
      errorMsg.code = err.code;
      errorMsg.msg = err.sqlMessage;
      sendError(res, 500 ,errorMsg);
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
      let errorMsg = {};
      errorMsg.code = err.code;
      errorMsg.msg = err.sqlMessage;
      sendError(res, 500 ,errorMsg);
   });
};

exports.commands = (req, res) => {
  let {id, schema, commands} = req.body;
  Db_Manager.commands(id, schema, commands, (err, result)=>{
      if(err){
        let errorMsg = {};
        errorMsg.code = err.code;
        errorMsg.msg = err.sqlMessage;
        sendError(res, 500 ,errorMsg); 
      }else{
        sendResult(res, result);
      }
  });
};

exports.createConnection = (req, res) => {
  let user = req.session.username;
  let params = req.body;
  Db_Manager.createConnection(params,user.id).then((result)=>{
    sendResult(res, result);
  }).catch(err=>{
      let errorMsg = {};
      errorMsg.code = err.code;
      errorMsg.msg = err.sqlMessage;
      sendError(res, 500 ,errorMsg);
  });

};

exports.editConnection = (req, res) => {
  let {db} = req.params;
  let user = req.session.username;
  let params = req.body;
  params.ID = db;
  Db_Manager.editConnection(params,user.id).then((result)=>{
    sendResult(res, result);
  }).catch(err=>{
      let errorMsg = {};
      errorMsg.code = err.code;
      errorMsg.msg = err.sqlMessage;
      sendError(res, 500 ,errorMsg);
  });
};

exports.deleteConnection = (req, res) => {
  let {db} = req.params;
  let user = req.session.username;
  Db_Manager.deleteConnection(db,user.id).then((result)=>{
    sendResult(res, result);
  }).catch(err=>{
      let errorMsg = {};
      errorMsg.code = err.code;
      errorMsg.msg = err.sqlMessage;
      sendError(res, 500 ,errorMsg);
  });
};


exports.getAccessConnection = (req, res) => {
   let user = req.session.username;
   let params = req.body;
   Db_Manager.createConnections(params,user.id).then((result)=>{
      sendResult(res, result);
   }).catch(err=>{
      let errorMsg = {};
      errorMsg.code = err.code;
      errorMsg.msg = err.sqlMessage;
      sendError(res, 500 ,errorMsg);
   });
};


// 认证
exports.authorize = (req, res, next) =>{
   let session = req.session;
   if (session.username == null) {
        doLogin(req , res);
    }else{
      next();
    }
};

let doLogin = (req, res)=>{
  //是一个ajax请求
  if ("XMLHttpRequest"==req.headers['x-requested-with']) {
     let map = {};
     map.location = "https://cas.qima-inc.com/public/oauth/authorize?name=db-cache-tool-local&qs="+req.requestUrl;
     map.callbackUrl = req.requestUrl;
     sendError(res ,401 , map);
  }else{
     let redirectUrl = "https://cas.qima-inc.com/public/oauth/authorize?name=db-cache-tool-local&qs="+req.requestUrl;
     res.redirect(redirectUrl);
  }
};


exports.callback = (req, res) =>{
  const code = req.query.code;
  if (!code) {
      console.warn("CAS callback has no code, "+ request.requestUrl.toString());
      doLogin(req, res);
      return;
  }
  request.get('http://cas.qima-inc.com/oauth/users/self?code='+code)
        .set('authorization', 'oauth 3ab75c8e-e52d-4f6a-a433-7a871e2d0a04')
        .end((err, r) => {
          if (err){ 
            doLogin(req, res);
            return;
          }
          if (r.body.code !== 0) {
            doLogin(req, res);
            return;
          }
          let user = r.body.data.value;
          req.session.regenerate(function(){
              req.session.username = user;
              let qs = req.query.qs;
              if (qs&&qs!='undefined') {
                res.redirect(qs);
              } else {
                res.redirect(indexUrl);
              }
          });
        });
};
