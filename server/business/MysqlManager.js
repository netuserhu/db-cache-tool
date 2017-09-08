var mysql=require("mysql");  
var SqliteManager = require('./SqliteManager');
var pools = {};
  
exports.query=function(db, sql,options,callback){  
    let pool = pools[db];
    if(!pool){
      SqliteManager.selectOne('select * from db_info where id='+db, function(err, obj){
         let {HOST,PORT, USER_NAME,PASSWORD,SCHEMA} = obj;
         pool = mysql.createPool({  
           host: HOST,  
           user: USER_NAME,  
           password: PASSWORD,  
           database: SCHEMA,  
           port: PORT
         });  
         pools[db] = pool;
         queryByConnection(pool, sql, options, callback);
      });
    }else{
         queryByConnection(pool, sql, options, callback);
    }
}; 

exports.execute=function(db, sql,options,callback){
    let pool = pools[db];
    if(!pool){
      SqliteManager.selectOne('select * from db_info where id='+db, function(err, obj){
         let {HOST,PORT, USER_NAME,PASSWORD,SCHEMA} = obj;
         pool = mysql.createPool({  
           host: HOST,  
           user: USER_NAME,  
           password: PASSWORD,  
           database: SCHEMA,  
           port: PORT
         });  
         pools[db] = pool;
         executeByConnection(pool, sql, options, callback);
      });
    }else{
         executeByConnection(pool, sql, options, callback);
    }
}; 

queryByConnection = function(pool, sql , options , callback){
    pool.getConnection(function(err,conn){  
        if(err){
            callback(err,null,null);  
        }else{
            conn.query(sql,options,function(err,results,fields){  
                //释放连接  
                conn.release();  
                //事件驱动回调  
                callback(err,results,fields);  
            });  
        }  
    });  
};

executeByConnection = function(pool, sql , options , callback){
    pool.getConnection(function(err,conn){  
        if(err){
            callback(err,null,null);  
        }else{
            conn.query(sql,options,function(err,results,fields){  
                //释放连接  
                conn.release();  
                //事件驱动回调  
                callback(err,results,fields);  
            });  
        }  
    });  
};
  