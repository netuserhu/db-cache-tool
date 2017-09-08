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
   let results = [];
   command(results, id, schema, commandArray, 0, callback);
};

function command(out, id, schema, commands, index, callback){
  if(index == commands.length - 1){
  	return callback(null, out);
  }
  let command_i = commands[index].trim().toLowerCase();
  if(command_i.match(EXEC_SQL_EXP)){
     MysqlManager.execute(id, command_i, null, function(err,results,fields){
       let result = {"type":"execute"};
       result['data'] = results.message;
       out.push(result);
       command(out, id, schema, commands, ++index, callback);
     });
  }else if(command_i.match(SELECT_SQL_EXP)){
     MysqlManager.query(id, command_i, null, function(err,results,fields){
       let result = {"type":"query"};
       let data = results.map(p=>{
         let item = {}; 
         for(let i=0;i<fields.length; i++){
            let columnName = fields[i].name;
            item[columnName] = p[columnName];
         }
         return item;
       });
       result['data'] = data;
       out.push(result);
       command(out, id, schema, commands, ++index, callback);
     });
  }else{
      let result = {"type":"error","data":"bad command"};
      out.push(result);
	  command(out, id, schema, commands, ++index, callback);
  }
}; 

String.prototype.trim = function() { 
  return this.replace(/(^\s*)|(\s*$)/g, ''); 
}; 

const EXEC_SQL_EXP = /^insert|update|delete\s*/g;
const SELECT_SQL_EXP =/^select\s*/g;