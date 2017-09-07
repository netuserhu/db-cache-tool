var SqliteManager = require('./SqliteManager');
var MysqlManager = require('./MysqlManager');

let schemas = ["aaaa","bbbb"];

exports.selectConnections = function(callback){
   SqliteManager.select('select * from DB_INFO',function(err, res){
      callback(err,res);
   });
};


exports.getSchemaList = function(id, callback){
   MysqlManager.query(id,'SELECT SCHEMA_NAME FROM information_schema.SCHEMATA', null ,function(err, results,fields){
      callback(err , results, fields);
   });
};

exports.getTableList = function(id, schema, callback){
   MysqlManager.query(id,'show tables from '+schema, null ,function(err,results,fields){
      callback(err,results,fields);
   });
};

exports.commands = function(id, schema, commands, callback){
   let commandArray = commands.split(';');
   for(let i=0; i<commandArray.length; i++){
     console.log(commandArray[i].trim()); 
   }
   callback(null , null);
};

String.prototype.trim = function() { 
  return this.replace(/(^\s*)|(\s*$)/g, ''); 
}; 