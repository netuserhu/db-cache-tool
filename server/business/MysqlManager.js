var Promise = require('bluebird');

var mysql=require("mysql");  
var SqliteManager = require('./SqliteManager');
var pools = {};
  

exports.query = function(db, sql,options){
  return new Promise(function(resolve, reject){
     getConn(db).then(conn=>{
          conn.query(sql,options,function(err,results,fields){  
              conn.release();  
              if(err){
                 reject(err);
              }else{
                 let result = {
                    results: results,
                    fields: fields
                 };
                 resolve(result);
              }
          });  
     }).catch(err=>{
        reject(err);
     });
       
  });
}

let getConn = function(db){
  return new Promise(function(resolve, reject) {
    let pool = pools[db];
    if (pool) {
      pool.getConnection(function(err, conn) {
        if (err) {
          reject(err);
        } else {
          resolve(conn);
        }
      });
    } else {
      SqliteManager.selectOne('select * from db_info where id=' + db).then((obj) => {
        let {HOST,PORT,USER_NAME,PASSWORD,SCHEMA} = obj;
        pool = mysql.createPool({
          host: HOST,
          user: USER_NAME,
          password: PASSWORD,
          database: SCHEMA,
          port: PORT
        });
        pools[db] = pool;
        pool.getConnection(function(err, conn) {
          if (err) {
            reject(err);
          } else {
            resolve(conn);
          }
        });
      });
    }
  });
}


exports.execute=function(db, sql,options){
  return new Promise(function(resolve, reject){
      getConn(db).then(conn=>{
            conn.query(sql,options,function(err,results,fields){  
                conn.release();  
                if(err){
                   reject(err);
                }else{
                   let result = {
                      results: results,
                      fields: fields
                   };
                   resolve(result);
                }
            });  
       }).catch(err=>{
          reject(err);
       });
  });
}; 

