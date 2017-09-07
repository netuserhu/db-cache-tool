var sqlite3 = require('sqlite3');
var constantDb = require('../constants/dbsql');
var fs = require('fs');
var dbName = '../database/mineinfo.db';
var dbAbsoluteName = __dirname + "/" + dbName;

init = function() {
	fs.exists(dbAbsoluteName, function(exists) {
		if (!exists) {
			fs.writeFile(dbAbsoluteName, '', function(err, fd) {
				console.log('获取数据库文件,执行结果'+err);
				let db = new sqlite3.Database(dbAbsoluteName, function(err, res) {
					console.log('获取一个数据库,执行结果'+err);
					db.run(constantDb.getDDL(), function(err, res) {
						console.log('执行DDl语句,执行结果'+err);
						db.run(constantDb.getDML(), function(err, res) {
							console.log('执行DMl语句,执行结果'+err);
							db.close();
						});
					});
				});

			});
		}
	});
}

init();

exports.select = function(sql, callback) {
	let db = new sqlite3.Database(dbAbsoluteName,function(){
		db.all(sql, callback);
		db.close();
	});
};

exports.selectOne = function(sql, callback) {
	let db = new sqlite3.Database(dbAbsoluteName,function(){
		db.get(sql, callback);
		db.close();
	});
};

exports.execute = function(sql, callback) {
	let db = new sqlite3.Database(dbAbsoluteName,function(){
			db.execute(sql, callback);
			db.close();
	});
    
};