module.exports = {
	API_PROTOCOL: [
		{text: 'DUBBO', value: 'dubbo' },
		{text: 'PHP', value: 'php' },
		{text: 'NOVA_JAVA', value: 'nova_java' },
		{text: 'NOVA_PHP', value: 'nova_php' }
	],
	API_OUTER_TYPE: [
		{text: 'String', value: 'String' },
		{text: 'Number', value: 'Number' },
		{text: 'Price', value: 'Price' },
		{text: 'Boolean', value: 'Boolean' },
		{text: 'Date', value: 'Date' },
		{text: 'String[]', value: 'String[]' },
		{text: 'Number[]', value: 'Number[]' },
		{text: 'Price[]', value: 'Price[]' },
		{text: 'Boolean[]', value: 'Boolean[]' },
		{text: 'Date[]', value: 'Date[]' },
		{text: 'byte[]', value: 'byte[]' },
		{text: 'File', value: 'file' }
	],
	API_OUTER_JAVA_TYPE: [
		{text: 'java.lang.String', value: 'java.lang.String' },
		{text: 'java.lang.Integer', value: 'java.lang.Integer' },
		{text: 'java.lang.Long', value: 'java.lang.Long' },
		{text: 'java.lang.Float', value: 'java.lang.Float' },
		{text: 'java.lang.Double', value: 'java.lang.Double' },
		{text: 'java.lang.Boolean', value: 'java.lang.Boolean' },
		{text: 'java.util.List', value: 'java.util.List' },
		{text: 'java.util.Map', value: 'java.util.Map' },
		{text: 'int(兼容以前，新接口勿选)', value: 'int' },
		{text: 'long(兼容以前，新接口勿选)', value: 'long' },
		{text: 'boolean(兼容以前，新接口勿选)', value: 'boolean' },
		{text: 'String(兼容以前，新接口勿选)', value: 'String' }
	],
	API_METHOD: [
		{text: 'GET', value: '0' },
		{text: 'POST', value: '1' }
	],
	API_AUTH_TYPE: [
		{text: '免签名(Token)', value: 'token' },
		{text: '签名(Sign)', value: 'sign' }
	],
	API_INNER_PARAMS: [
		{text: 'kdt_id', value: 'kdt_id' },
		{text: 'admin_id', value: 'admin_id' },
		{text: 'user_id', value: 'user_id' },
		{text: 'client_id', value: 'client_id' },
		{text: 'app_id', value: 'app_id' },
		{text: 'fans_id', value: 'fans_id' },
		{text: 'fans_type', value: 'fans_type' },
		{text: 'request_ip', value: 'request_ip' },
		{text: 'client_name', value: 'client_name' },
		{text: 'client_type', value: 'client_type' },
		{text: 'client_secret', value: 'client_secret' },
		{text: 'client_source', value: 'client_source' },
		{text: 'client_num', value: 'client_num' },
		{text: 'access_token', value: 'access_token' },
		{text: 'clientId(兼容以前，新接口勿选)', value: 'clientId' },
		{text: 'kdtId(兼容以前，新接口勿选)', value: 'kdtId' },
		{text: 'adminId(兼容以前，新接口勿选)', value: 'adminId' }
	]
}