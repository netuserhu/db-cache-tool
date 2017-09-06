var SqliteManager = require('./SqliteManager');

let dbInfo = [
  {"id": 1, "connectionName":"dev_open_platform","host":"10.9.51.13","port":3008,"username":"user_oplatform","password":"open_platform","schema":""},
  {"id": 2, "connectionName":"dev_carmen","host":"10.9.23.250","port":3008,"username":"user_carmen","password":"3PEMWC6XXW9Mn2DJYd2M","schema":"saas_carmen"}
];

let schemas = ["aaaa","bbbb"];

exports.selectConnections = function(callback){
   SqliteManager.select('select * from DB_INFO',function(err, res){
      callback(err,res);
   });
};


exports.getSchemaList = function(id, callback){
   SqliteManager.select('select * from DB_INFO where id ='+id ,function(err, res){
      callback(err,res);
   });
};

exports.getTableList = function(db, schema, callback){
   return schemas;
};