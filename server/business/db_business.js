var SqliteManager = require('./SqliteManager');
var MysqlManager = require('./MysqlManager');

let schemas = ["aaaa","bbbb"];

exports.selectConnections = function(){
   return SqliteManager.select('select * from DB_INFO');
};

exports.getSchemaList = function(id){
   return MysqlManager.query(id,'SELECT SCHEMA_NAME FROM information_schema.SCHEMATA', null);
};

exports.getTableList = function(id, schema){
  return MysqlManager.query(id,'show tables from '+schema, null);
};

exports.commands = function(id, schema, commands, callback){
   let out = commands.trim();
   if(out &&';'!=out.charAt(out.length-1)){
      out = out+";";
   }
   let commandArray = out.split(';');
   let results = [];
   command(results, id, schema, commandArray, 0, callback);
};

function command(out, id, schema, commands, index, callback){
  if(index == commands.length - 1){
  	return callback(null, out);
  }
  let command_i = commands[index].trim().toLowerCase();
  if(command_i.match(EXEC_SQL_EXP)){
     MysqlManager.execute(id, command_i, null).then((result)=>{
       let {results,fields} = result;
       let tmpResult = {"type":"execute"};
       tmpResult['data'] = results.message;
       out.push(tmpResult);
       command(out, id, schema, commands, ++index, callback);
     });
  }else if(command_i.match(SELECT_SQL_EXP)){
     MysqlManager.query(id, command_i, null).then((result)=>{
       let {results,fields} = result;
       let tmpResult = {"type":"query"};
       let data = results.map(p=>{
         let item = {}; 
         for(let i=0;i<fields.length; i++){
            let columnName = fields[i].name;
            item[columnName] = p[columnName];
         }
         return item;
       });
       tmpResult['data'] = data;
       out.push(tmpResult);
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