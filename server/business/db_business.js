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
     let sql = commandArray[i].trim();
     
   }
   callback(null , null);
};

function command(results, id, schema, commands, index, callback){
  if(index == commands.length){
  	callback(results);
  }
  command = commands[index];
  if(EXEC_SQL_EXP.match(command)){
     MysqlManager.execute(id, command, null, function(err,results,fields){
       let result = {"type":"execute"};
       result[data] = results;
       results.push(result);
       command(results, id, schema, commands, index++, callback);
     });
  }else if(SELECT_SQL_EXP.match(command)){
     MysqlManager.query(id, command, null, function(err,results,fields){
       let result = {"type":"query"};
       let data = results.map(p=>{
         let item = {};
         for(let i=0;i<fields.length; i++){
            let columnName = fields[i];
            item[columnName] = p[columnName];
         }
         return item;
       });
       result['data'] = data;
       results.push(result);
       command(results, id, schema, commands, index++, callback);
     });
  }else{

  }
} 

String.prototype.trim = function() { 
  return this.replace(/(^\s*)|(\s*$)/g, ''); 
}; 

const EXEC_SQL_EXP = /^INSERT|UPDATE|DELETE\s*/g;
const SELECT_SQL_EXP =/^SELECT\s*/g;