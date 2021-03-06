var sqlite3 = require('sqlite3');
var constantDb = require('../constants/dbsql');
var fs = require('fs');

var sqliteDir = process.env.NODE_DATA;
var dbAbsoluteName = sqliteDir+'/database/mineinfo.db';
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
               db.run(ddl,callback);
             });
          }
          for(let i=0; i<constantDb.getDML().length; i++){
             let dml = constantDb.getDML()[i];
             tasks.push(function(callback){
               db.run(dml,callback);
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

exports.execute = function(sql, params) {
	return new Promise(function(resolve, reject){
        getConn().then(db=>{
            db.run(sql,params,function(err, result){
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