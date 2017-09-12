
let initCreateTableSql=
      "CREATE TABLE DB_INFO(                  "              
      +"ID INTEGER PRIMARY KEY,               "
      +"CONNECTION_NAME VARCHAR(50) NOT NULL, "
      +"HOST CHAR(30) NOT NULL,               "
      +"PORT INTEGER NOT NULL,                "
      +"USER_NAME VARCHAR(100) NOT NULL,      " 
      +"PASSWORD VARCHAR(100) NOT NULL,       "
      +"SCHEMA VARCHAR(100) NOT NULL,         "
      +"BELONG INTEGER NOT NULL)              ";

let initCreateAccessTableSql=
      "CREATE TABLE DB_ACCESS_SNAPSHOT(       "              
      +"ID INTEGER PRIMARY KEY,               "
      +"DB_INFO_ID INTEGER,                   "
      +"CONNECTION_NAME VARCHAR(50) NOT NULL, "
      +"HOST CHAR(30) NOT NULL,               "
      +"PORT INTEGER NOT NULL,                "
      +"USER_NAME VARCHAR(100) NOT NULL,      " 
      +"PASSWORD VARCHAR(100) NOT NULL,       "
      +"SCHEMA VARCHAR(100) NOT NULL,         "
      +"ACCESS_TIME VARCHAR(100) NOT NULL)    ";


let initInsertTableSql=
    "INSERT INTO                                                                                             "
    +"DB_INFO('CONNECTION_NAME',                                                                             "
    +"	    'HOST',                                                                                          "
    +"	    'PORT',                                                                                          "
    +"	    'USER_NAME',                                                                                     "
    +"	    'PASSWORD',                                                                                      "
    +"	    'SCHEMA',                                                                                        "
    +"      'BELONG')                                                                                        "
    +"VALUES('dev_open_platform','10.9.51.13',3008, 'user_oplatform', 'open_platform', 'open_platform',-1),"
    +"      ('dev_carmen','10.9.23.250',3008, 'user_carmen', '3PEMWC6XXW9Mn2DJYd2M', 'saas_carmen', -1)     ";

exports.getDDL = function(){
	return [initCreateTableSql,initCreateAccessTableSql];
}

exports.getDML = function(){
	return [initInsertTableSql];
}