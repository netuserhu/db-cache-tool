var sqlite3 = require('sqlite3');
var constantDb = require('../constants/dbsql');
var fs = require('fs');
var dbName = '../database/mineinfo.db';
var dbAbsoluteName = __dirname + "/" + dbName;
var Promise = require("bluebird");
var async = require('async');

let init = function() {
	fs.exists(dbAbsoluteName, function(exists) {
		if (!exists) {
			fs.writeFile(dbAbsoluteName, '', function(err, fd) {
				console.log('获取数据库文件,执行结果'+err);
				getConn().then(db =>{
          let tasks = [];
          for(let i=0; i<constantDb.getDDL().length; i++){
             let ddl = constantDb.getDDL()[i];
             tasks.push(function(callback){
               console.log("执行ddl语句"+ddl);
               db.run(ddl,callback);
             });
          }
          for(let i=0; i<constantDb.getDML().length; i++){
             let dml = constantDb.getDML()[i];
             tasks.push(function(callback){
               console.log("执行dml语句"+dml);
               db.execute(dml,callback);
             });
          }
          tasks.push(function(callback){
            db.close();
          });
          async.series(tasks,function(err,result){
            if(err){
              console.log("初始化失败"+err);
            }else{
              console.error("初始化完成");
            }
          });
       });   
			});
	  }
	});
}

init();


let getConn = function(){
	return new Promise(function(resolve, reject){
       let db = new sqlite3.Database(dbAbsoluteName,function(err){
            if(err){
            	reject(err);
            }else{
            	resolve(db);
            }  
       });
	});
}

exports.selectOne = function(sql) {
	return new Promise(function(resolve, reject){
        getConn().then(db=>{
            db.get(sql,function(err, result){
               db.close();
               if(err){
                 reject(err);
               }else{
               	 resolve(result);
               }
            })
        });   
    });
};

exports.select = function(sql) {
	return new Promise(function(resolve, reject){
        getConn().then(db=>{
            db.all(sql,function(err, result){
               db.close();
               if(err){
                 reject(err);
               }else{
               	 resolve(result);
               }
            })
        });   
     });
};

exports.execute = function(sql) {
	return new Promise(function(resolve, reject){
        getConn().then(db=>{
            db.execute(sql, function(err, result){
               db.close();
               if(err){
                 reject(err);
               }else{
               	 resolve(result);
               }
            });
        });   
    });   
};