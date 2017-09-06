let dbInfo = [
  {"connectionName":"dev_open_platform","host":"10.9.51.13","port":3008,"username":"user_oplatform","password":"open_platform","schema":""},
  {"connectionName":"dev_open_platform","host":"10.9.23.250","port":3008,"username":"user_carmen","password":"3PEMWC6XXW9Mn2DJYd2M","schema":"saas_carmen"}
];


exports.selectConnections = function(){
   return dbInfo;
};