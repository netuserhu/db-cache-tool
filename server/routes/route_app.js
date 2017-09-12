var Db_Manager = require('../business/db_business');
let session = require('session');

let url = require('url'); 
var request = require('superagent'); 

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
     res.status(401);
     res.send(JSON.stringify(map));
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
                res.redirect("http://localhost:3000");
              }
          });
        });
};
