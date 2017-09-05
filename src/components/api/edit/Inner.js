import React, { Component } from 'react';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox, Button, Radio, notification, Table, Badge, Modal, Card, InputNumber, message } from 'antd';
import Constant from '../../../constant/global';
import {connect} from 'react-redux';
const uuidV1 = require('uuid/v1');
var _ = require('lodash');
const { Column, ColumnGroup } = Table;

class Inner extends React.Component {

	constructor(props) {
		super(props);
		this.state = {apiGroups: [], typeFields: [], typeName: '', typeId: 0,showTypeAdd: false, showTypeEdit: false, showTypeList: false, outerParamNames: [], outerParamTypes: []};
	}

    componentDidMount() {
        this.props.onInitParam(this.props.state.outer);
    }

	handleContinue(e) {
		this.props.handleContinue(e);
	}

	onAddTypeField() {
		this.state.typeFields.push({
			id: uuidV1(),
            isBasic: true
		});
		this.setState({typeFields: this.state.typeFields});
	}

	onDeleteTypeField(row) {
		var newParams = this.state.typeFields.filter(f => f.id != row);
		this.setState({typeFields: newParams});
		console.log(this.state);
	}

	onTypeNameChange(e) {
		e.preventDefault();
		this.setState({typeName: e.target.value});
	}

	onSetTypeField(row, col, val) {
		this.state.typeFields.map(f => {
			if (f.id != row) {
				return f;
			}
            const outerTypes = Constant.API_OUTER_JAVA_TYPE;
            if (col == 'type') {
                var isBasic = false;
                for (var i=0; i<outerTypes.length; i++) {
                    if (outerTypes[i].value == val) {
                        isBasic = true;
                        break;
                    }
                }
                f.isBasic = isBasic;
            }
			f[col] = val;
		});
		this.setState({typeFields: this.state.typeFields});
	}

	onAddType() {
		if (!this.state.typeName) {
			notification.error({message: '请输入类型名称'});
			return false;
		}
		const id = uuidV1();
        for (var idx=0; idx<this.state.typeFields.length; idx++) {
            const f = this.state.typeFields[idx];
            if (!f.name) {
                notification.error({message: '第' + (idx+1) + '个字段名称不能为空'});
                return;
            }
            if (!f.type) {
                notification.error({message: '第' + (idx+1) + '个字段类型不能为空'});
                return;
            }
        }
        this.props.onAddType({
			id: id, 
			text: this.state.typeName, 
			name: this.state.typeName,
			value: this.state.typeName, 
			isBasic: false, 
			fields: [...this.state.typeFields]
		});
		this.setState({typeName: '', typeFields: []});
		notification.info({message: '添加成功'});
		return true;
	}

    onUpdateType() {
        if (!this.state.typeName) {
            notification.error({message: '请输入类型名称'});
            return false;
        }
        for (var idx=0; idx<this.state.typeFields.length; idx++) {
            const f = this.state.typeFields[idx];
            if (!f.name) {
                notification.error({message: '第' + (idx+1) + '个参数名称不能为空'});
                return;
            }
            if (!f.type) {
                notification.error({message: '第' + (idx+1) + '个参数类型不能为空'});
                return;
            }
        }
        this.props.onUpdateType(this.state.typeId, {
            id: this.state.typeId, 
            text: this.state.typeName, 
            name: this.state.typeName,
            value: this.state.typeName, 
            isBasic: false, 
            fields: [...this.state.typeFields]
        });
        this.props.onRebuildMappingParam();
        this.setState({typeName: '', typeFields: []});
        notification.info({message: '更新成功'});
        return true;
    }

    onEditType(id) {
        const restoreType = (type) => {
            this.setState({typeName: type.name, typeFields: type.fields, typeId: type.id});
        }

        const types = this.props.inner.types;
        for (var i=0; i<types.length; i++) {
            const type = types[i];
            if (type.id == id) {
                restoreType(type);
                break;
            }
        }
    }

	onValidateParam() {
		var inner = this.props.inner;

        const notifyError = (msg, desc) => {
            notification.error({
                message: msg,
                description: desc
            });
        }

        // TODO 参数校验
        if (!inner.protocol) {
            notifyError('协议不能为空');
            return false;
        }
        if (inner.protocol == 'dubbo' || inner.protocol == 'nova_java' || inner.protocol == 'nova_php') {
        	if (!inner.url) {
        		notifyError('服务地址不能为空');
        		return false;
        	}
        	if (!inner.service) {
        		notifyError('服务接口不能为空');
        		return false;
        	}
        	if (!inner.method) {
        		notifyError('服务方法不能为空');
        		return false;
        	}
        	if (!inner.appName) {
        		notifyError('应用名不能为空');
        		return false;
        	}
        } else if (inner.protocol == 'php') {
        	if (!inner.url) {
        		notifyError('Http地址不能为空');
        		return false;
        	}
        	if (!inner.path) {
        		notifyError('服务路径不能为空');
        		return false;
        	}
        } else {
        	notifyError('未知协议类型');
        	return false;
        }
        if (!inner.timeout) {
            notifyError('超时不能为空');
            return false;
        }
        // 校验参数
        for (var i=0; i<inner.params.length; i++) {
        	var param = inner.params[i];
        	if (!param.name) {
        		notifyError('第' + (i+1) + '个参数未设置名称');
            	return false;
        	}
        	if (inner.protocol == 'dubbo' || inner.protocol == 'nova_java') {
                if (!param.type) {
                    notifyError('第' + (i+1) + '个参数未设置类型');
                    return false;
                }
            }
        }
        // 校验映射关系
        for (var i=0; i<inner.mappingParams.length; i++) {
        	var mappingParam = inner.mappingParams[i];
        	if (!mappingParam.outerName) {
        		notifyError('参数' + _.join(mappingParam.paths, '/') + '未设置参数映射');
            	return false;
        	}
        }

        return true;
	}

	handleSubmit = (e) => {
	    e.preventDefault();
	    this.props.form.validateFieldsAndScroll((err, values) => {
	      if (!err) {
	        if (!this.onValidateParam()) {
				return false;
			}
			this.onAddApi();
	      }
	    });
    }

    handleConfirmBlur = (e) => {
      const value = e.target.value;
      this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    }
    checkPassword = (rule, value, callback) => {
      const form = this.props.form;
      if (value && value !== form.getFieldValue('password')) {
        callback('Two passwords that you enter is inconsistent!');
      } else {
        callback();
      }
    }
    checkConfirm = (rule, value, callback) => {
      const form = this.props.form;
      if (value && this.state.confirmDirty) {
        form.validateFields(['confirm'], { force: true });
      }
      callback();
    }

    onAddApi() {
    	const parentState = this.props.state;
        const outer = parentState.outer;
        const inner = parentState.inner;
        var name = outer.name;
        var version = outer.version;
        var appName = inner.appName;
        var apiGroup = outer.group;
        var apiDesc = outer.desc;
        var apiScenarios = outer.scenarios;
        var addressUrl = inner.url;
        var protocol = inner.protocol;
        var enableInnerOuter = outer.isOuter;
        var requestType = inner.httpMethod;
        var sessionFlag = outer.isLogin;
        var transResult = outer.transResult;
        var resultFormat = outer.resultFormat;
        var enableLog = outer.enableLog;
        var apiStatus = 1;
        var timeout = inner.timeout;

        var apiType = 1;
        if (protocol == 'dubbo') {
            apiType = 1;
        } else if (protocol == 'php') {
            apiType = 2;
        } else if (protocol == 'nova_java') {
            apiType = 3;
        } else if (protocol == 'nova_php') {
            apiType = 4;
        }
        var authType = 1;
        if (outer.auth == 'all') {
            authType = 1;
        } else if (outer.auth == 'token') {
            authType = 2;
        } else if (outer.auth == 'sign') {
            authType = 3;
        }

        if (inner.protocol != 'php') {
            requestType = outer.httpMethod;
        }

        const notifyError = (msg, desc) => {
            notification.error({
                message: msg,
                description: desc
            });
        }

        // TODO 参数校验
        if (!name) {
            notifyError('名称不能为空');
            return state;
        }
        if (!version) {
            notifyError('版本不正确');
            return state;
        }
        if (!apiGroup) {
            notifyError('分组不正确');
            return state;
        }
        if (!apiDesc) {
            notifyError('描述不正确');
            return state;
        }
        if (!addressUrl) {
            notifyError('服务地址不正确');
            return state;
        }
        if (!protocol) {
            notifyError('请选择协议');
            return state;
        }
        if (typeof enableInnerOuter == 'undefined') {
            notifyError('对外开放不能为空');
            return state;
        }
        if (typeof sessionFlag == 'undefined') {
            notifyError('是否登录不能为空');
            return state;
        }
        if (!timeout) {
            notifyError('超时不能为空');
            return state;
        }

        var service = name.substring(0, name.lastIndexOf('.'));
        var action = name.substring(name.lastIndexOf('.') + 1, name.length);

        var carmenApiForm = {
            namespace: service,
            name: action,
            version: version,
            appName: appName,
            apiGroup: apiGroup,
            apiDesc: apiDesc,
            apiScenarios: apiScenarios,
            addressUrl: addressUrl,
            enableInnerOuter: enableInnerOuter ? 1 : 0,
            apiType: apiType,
            sessionFlag: sessionFlag ? 1 : 0,
            requestType: requestType,
            transResult: transResult,
            resultFormat: resultFormat,
            enableLog: enableLog,
            apiStatus: apiStatus,
            authType: authType,
            timeout: timeout,
            owners: []
        }

        // 责任人
        if (outer.owners) {
            outer.owners.map(owner => {
                carmenApiForm.owners.push(owner.key);
            });
        }

        var carmenApiParams = [];
        for (var i = 0; i < outer.params.length; i++) {
            var param = outer.params[i];
            var paramForm = {
                paramName: param.name,
                paramType: param.type,
                isRequired: param.isRequired ? 1 : 0,
                isStructure: 0,
                describle: param.desc,
                example: param.example,
                defaultValue: param.defaultValue
            }
            carmenApiParams.push(paramForm);
        }

        var carmenServiceMethod = {
            id: inner.serviceMethodId,
            name: inner.service,
            method: inner.method,
            version: '*'
        };

        var carmenStructs = [];
        // 仅dubbo支持复杂结构配置
        if (protocol == 'dubbo' || protocol == 'nova_java') {
            var types = inner.types;
            for (var i = 0; i < types.length; i++) {
                const type = types[i];
                if (type.isBasic) {
                    continue;
                }
                var fields = [];
                type.fields.map(p => {
                    fields.push({
                        fieldName: p.name,
                        fieldType: p.type,
                        isStructure: p.isBasic ? 1 : 0  // 注意这个地方是一个坑，isBasic是反的
                    });
                });
                var structForm = {
                    className: type.name,
                    fields: fields
                }
                carmenStructs.push(structForm);
            }
        }
        if (protocol == 'php') {
            const path = inner.path;
            const name = path.substring(0, path.lastIndexOf('/'));
            const method = path.substring(path.lastIndexOf('/') + 1, path.length);
            carmenServiceMethod.name = name;
            carmenServiceMethod.method = method;
        }

        var carmenServiceMethodParams = [];
        for (var i = 0; i < inner.params.length; i++) {
            var param = inner.params[i];
            var serviceMethodParam = {
                paramName: param.name,
                paramType: param.type,
                isExpand: param.isExpand ? 1 : 0,
                isStructure: param.isBasic ? 0 : 1  // 注意这个和上面的struct的isStructure是反的，历史残留的坑
            }
            if (protocol == 'dubbo' || protocol == 'nova_java') {
                serviceMethodParam.sequence = param.order;
            } else {
                // php, nova_php都是基础类型，没有复杂类型
                serviceMethodParam.isStructure = 0;
            }
            carmenServiceMethodParams.push(serviceMethodParam);
        }

        var carmenParamMappings = [];
        for (var i = 0; i < inner.mappingParams.length; i++) {
            var mappingParam = inner.mappingParams[i];
            var paths = mappingParam.paths;
            var carmenParamMappingForm = {
                dataFrom: mappingParam.source == 'outer' ? 1 : 2,
                fieldType: mappingParam.type,
                paths: paths
            }
            if (protocol == 'dubbo' || protocol == 'nova_java') {
                // form.name => name
                carmenParamMappingForm.fieldName = paths[paths.length - 1];
                carmenParamMappingForm.apiParamName = mappingParam.outerName;
                // form.name => form
                carmenParamMappingForm.methodParamRef = paths[0];
            } else {
                if (mappingParam.source == 'inner') {
                    // 内部参数需要设置fieldName
                    carmenParamMappingForm.fieldName = mappingParam.outerName;
                }
                carmenParamMappingForm.fieldType = null;
                carmenParamMappingForm.apiParamName = mappingParam.outerName;
                // form.name => form
                carmenParamMappingForm.methodParamRef = paths[0];
            }
            carmenParamMappings.push(carmenParamMappingForm);
        }

        var updateForm = {
            carmenApi: carmenApiForm,
            carmenApiParams: carmenApiParams,
            carmenServiceMethod: carmenServiceMethod,
            carmenServiceMethodParams: carmenServiceMethodParams,
            carmenStructs: carmenStructs,
            carmenParamMappings: carmenParamMappings
        }

        console.log(updateForm);
        this.props.onSetFieldValue('isCreating', true);

        if ((this.props.mode && this.props.mode == 'edit') || this.props.inner.apiId) {
            fetch('/web/api/' + this.props.inner.apiId, {
                method: 'PUT',
                body: JSON.stringify(updateForm)
            }).then((resp) => {
                notification.info({
                    message: '更新API成功'
                });
                this.props.onSetFieldValue('isCreated', true);
            });
        } else {
            fetch('/web/api', {
                method: 'POST',
                body: JSON.stringify(updateForm)
            }).then((resp) => {
                notification.info({
                    message: '新增API成功'
                });
                this.props.onSetFieldValue('isCreated', true);
                this.props.onSetFieldValue('apiId', resp.data);
            });
        }
    }

    onTestService() {
        let registryUrl = this.props.inner.url;
        let interfaceName = this.props.inner.service;
        let method = this.props.inner.method;
        let appName = this.props.inner.appName;

        if (!registryUrl) {
            message.error('请输入注册中心地址');
            return;
        }
        if (!interfaceName) {
            message.error('请输入接口全类名');
            return;
        }
        if (!method) {
            message.error('请输入方法');
            return;
        }
        if (!appName) {
            message.error('请输入应用名');
            return;
        }
        fetch('/web/service/test', {
            method: 'POST',
            body: JSON.stringify({
                registryUrl: registryUrl,
                interfaceName: interfaceName,
                method: method,
                protocol: this.props.inner.protocol,
                appName: appName
            })
        }).then(resp => {
            message.success('服务存在，请继续配置', 3);
        });
    }

    checkPath = (rule, value, callback) => {
        if (!value || !/^\/([a-z]|[A-Z]|\/|[0-9])+([a-z]|[A-Z]|[0-9])$/g.test(value)) {
            callback('路径只能以"/"开头,a-z或A-Z结尾，中间可以包含字符"/"，例如: /user/list');
        }
        callback();
    }

    checkHttpUrl = (rule, value, callback) => {
        if (!value || !/^((http|ftp|https):\/\/){1}.+/g.test(value)) {
            callback('http地址必须以http或https开头，例如: http://api.youzan.com');
        }
        callback();
    }

    isPrimitiveType(typeName) {
		if (!typeName) {
			return true;
		}

		const types = Constant.API_OUTER_JAVA_TYPE;
		for (var i=0; i<types.length; i++) {
			if (types[i].value == typeName) {
				return true;
			}
		}

		return false;
	}

	render() {
        const { getFieldDecorator } = this.props.form;
        var types = this.props.inner.types;
        if (this.props.inner.protocol != 'dubbo' && this.props.inner.protocol != 'nova_java') {
            types = Constant.API_OUTER_TYPE;
        }

        return (
            <div >
              <Card title="对内配置">
                <Form >
                    <Form.Item labelCol={{md: 8}} wrapperCol={{md: 12}} label="协议类型" >
                      {getFieldDecorator('protocol', {
                        rules: [{
                            required: true, message: '请选择协议',
                        }],
                        initialValue: this.props.inner.protocol
                      })(
                          <Radio.Group onChange={e=> {this.props.onSetFieldValue('protocol', e.target.value)}} disabled={this.props.mode == 'edit' || this.props.mode == 'view'}>
                            <Radio value="dubbo">Dubbo</Radio>
                            <Radio value="php">PHP</Radio>
                            <Radio value="nova_java">NOVA_JAVA</Radio>
                            <Radio value="nova_php">NOVA_PHP</Radio>
                          </Radio.Group> 
                      )}
                      {
                            this.props.inner.protocol == 'dubbo' &&
                            <a href='http://gitlab.qima-inc.com/open-platform/carmen-console-ng-doc/wikis/result-format-for-dubbo-api' target='_blank'>点击查看dubbo返回值规范</a>
                        }
                    </Form.Item>
                    {
                        this.props.inner.protocol != 'php' && 
                        <Form.Item labelCol={{md: 8}} wrapperCol={{md: 8}} label="注册中心地址" >
                          {getFieldDecorator('addressUrl', {
                            rules: [{
                                required: true, message: '请输入注册中心地址',
                            }],
                            initialValue: this.props.inner.url
                          })(
                            <Input onChange={e=>{this.props.onSetFieldValue('url', e.target.value)}} placeholder="例如：10.1.1.1.2181,10.1.1.2:2181" disabled={this.props.mode == 'view'} />
                          )}
                        </Form.Item>
                    }
                    {
                        this.props.inner.protocol != 'php' && 
                        <Form.Item labelCol={{md: 8}} wrapperCol={{md: 7}} label="接口名称" >
                          {getFieldDecorator('service', {
                            rules: [{
                                required: true, message: '请输入接口名称',
                            }],
                            initialValue: this.props.inner.service
                          })(
                            <Input onChange={e=>{this.props.onSetFieldValue('service', e.target.value)}} placeholder="例如：com.youzan.carmen.InstanceService" disabled={this.props.mode == 'view'} />
                          )}
                        </Form.Item>
                    }
                    {
                        this.props.inner.protocol != 'php' && 
                        <Form.Item labelCol={{md: 8}} wrapperCol={{md: 6}} label="方法" >
                          {getFieldDecorator('method', {
                            rules: [{
                                required: true, message: '请输入接口方法',
                            }],
                            initialValue: this.props.inner.method
                          })(
                            <Input onChange={e=>{this.props.onSetFieldValue('method', e.target.value)}} placeholder="例如：getInstance" disabled={this.props.mode == 'view'} />
                          )}
                        </Form.Item>
                    }
                    {
                        this.props.inner.protocol != 'php' && 
                        <Form.Item labelCol={{md: 8}} wrapperCol={{md: 5}} label="应用名" >
                          {getFieldDecorator('appName', {
                            rules: [{
                                required: true, message: '请输入应用名',
                            }],
                            initialValue: this.props.inner.appName
                          })(
                            <Input onChange={e=>{this.props.onSetFieldValue('appName', e.target.value)}} placeholder="例如：trade" disabled={this.props.mode == 'view'} />
                          )}
                        </Form.Item>
                    }
                    {
                        this.props.inner.protocol == 'php' && 
                        <Form.Item labelCol={{md: 8}} wrapperCol={{md: 8}} label="http地址" >
                          {getFieldDecorator('httpUrl', {
                            rules: [{
                                required: true, message: '请输入http地址',
                            }, {
                                validator: this.checkHttpUrl
                            }],
                            initialValue: this.props.inner.url
                          })(
                            <Input onChange={e=>{this.props.onSetFieldValue('url', e.target.value)}} placeholder="例如：http://open.youzan.com" disabled={this.props.mode == 'view'} />
                          )}
                        </Form.Item>
                    }
                    {
                        this.props.inner.protocol == 'php' && 
                        <Form.Item labelCol={{md: 8}} wrapperCol={{md: 7}} label="http路径"  >
                          {getFieldDecorator('path', {
                            rules: [{
                                required: true, message: '请输入http路径',
                            }],
                            initialValue: this.props.inner.path
                          })(
                            <Input onChange={e=>{this.props.onSetFieldValue('path', e.target.value)}} placeholder="例如：/order/getList" disabled={this.props.mode == 'view'} />
                          )}
                        </Form.Item>
                    }
                    {
                        this.props.inner.protocol == 'php' && 
                        <Form.Item labelCol={{md: 8}} wrapperCol={{md: 4}} label="http方法" >
                          {getFieldDecorator('httpMethod', {
                            rules: [{
                              required: true, message: '请选择方法',
                            }],
                            initialValue: this.props.inner.httpMethodName
                          })(
                            <Select showSearch placeholder="选择http方法" value={this.props.inner.httpMethodName} onSelect={(val, option) => { this.props.onSetFieldValue('httpMethod', val); this.props.onSetFieldValue('httpMethodName', option.props.name); }} disabled={this.props.mode == 'view'}
                            filterOption={(input, option) => { return option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 || option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}}>
                              {
                                    Constant.API_METHOD.map(method => {
                                        return (
                                            <Option key={method.value} value={method.value} name={method.text}>{method.text}</Option>
                                        )
                                    })
                                }
                            </Select>
                          )}
                        </Form.Item>
                    }
                    <Form.Item labelCol={{md: 8}} wrapperCol={{md: 10}} label="超时" >
                      {getFieldDecorator('timeout', {
                        rules: [{
                            required: true, message: '请输入超时时间，单位为毫秒',
                        }],
                        initialValue: this.props.inner.timeout
                      })(
                        <InputNumber min={300} max={10000} onChange={ val => {this.props.onSetFieldValue('timeout', val)} } disabled={this.props.mode == 'view'} /> 
                      )}
                      ms &nbsp;&nbsp;&nbsp;&nbsp;
                      {
                          this.props.inner.protocol != 'php' && 
                          <span>
                            <Button type='primary' ghost onClick={e => { this.onTestService() }}>检测服务</Button>
                            &nbsp;&nbsp;&nbsp;
                            <Tooltip title="点击按钮检测服务是否存在">
			          			<a href='javascript:void(0);' style={{color: 'rgb(89, 89, 89)'}} ><Icon type="info-circle" /> </a>
			          		</Tooltip>
                          </span>
                      }
                    </Form.Item>
                </Form>
                {
                    (this.props.inner.protocol == 'php' || this.props.inner.protocol == 'dubbo' || (this.props.inner.protocol.indexOf('nova') >= 0 && this.props.mode == 'edit')) &&
                    <Table showHeader={true} dataSource={this.props.inner.params} pagination={false} bordered  >
                        <Column title='名称' dataIndex='name' key='name' width='20%' render={(text, param) => (
                            <Input value={param.name} onChange={e=> {this.props.onSetParamValue(param.id, 'name', e.target.value)}} onBlur={e=>{ this.props.onRebuildMappingParam() }} disabled={this.props.mode == 'view'} />
                        ) } />
                        {
                            (this.props.inner.protocol == 'dubbo' || this.props.inner.protocol == 'nova_java') &&
                            <Column title='类型' dataIndex='type' key='type' width='10%' render={(text, param) => (
                                <Row>
                                    <Col md={24}>
                                        <Select showSearch placeholder="选择类型" style={{width: '100%'}} value={param.type} onSelect={val=> {this.props.onSetParamValue(param.id, 'type', val)}} disabled={this.props.mode == 'view'} >
                                            { 
                                                types.map(type => {
                                                    return (
                                                        <Option key={type.value} value={type.value}>{type.text}</Option>
                                                    )
                                                })
                                            }
                                        </Select>
                                    </Col>
                                </Row>
                            ) } />
                        }
                        {
                            (this.props.inner.protocol == 'dubbo' || this.props.inner.protocol == 'nova_java') && 
                            <Column title='序号' dataIndex='order' key='order' width='5%' render={(text, param) => (
                                <Input type="number" value={param.order} onChange={e=>{this.props.onSetParamValue(param.id, 'order', e.target.value)}} disabled={this.props.mode == 'view'} /> 
                            ) } />
                        }
                        {
                            (this.props.inner.protocol == 'dubbo' || this.props.inner.protocol == 'nova_java') && 
                            <Column title='展开参数' dataIndex='isExpand' key='isExpand' width='5%' render={(text, param) => (
                                <Checkbox checked={param.isExpand} onChange={e=> { this.props.onSetParamValue(param.id, 'isExpand', e.target.checked); this.props.onRebuildMappingParam(); }} disabled={(this.props.mode == 'view') || this.isPrimitiveType(param.type)}>是</Checkbox> 
                            ) } />
                        }
                        <Column title='操作' dataIndex='operation' key='operation' width='10%' render={(text, param) => (
                            <span>
                            <Button onClick={e => {e.preventDefault(); this.props.onDeleteParam(param.id)}} disabled={this.props.mode == 'view'}>删除</Button>
                            </span>
                        )} />
                    </Table>
                }
                <br />
                {
                    (this.props.inner.protocol == 'php' || this.props.inner.protocol == 'dubbo' || (this.props.inner.protocol.indexOf('nova') >= 0 && this.props.mode == 'edit')) &&
                    <span><Button type="primary" htmlType="submit" size="large" onClick={e=>{e.preventDefault(); this.props.onAddParam()}} disabled={this.props.mode == 'view'} >+ 参数</Button>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                }
                {
                    !((this.props.inner.protocol == 'php' || this.props.inner.protocol == 'dubbo' || (this.props.inner.protocol.indexOf('nova') >= 0 && this.props.mode == 'edit'))) &&
                    <center><span style={{color: 'red'}}>nova协议服务，不支持参数配置，请透传参数</span></center>
                } 
                  {
                    (this.props.inner.protocol == 'dubbo' || (this.props.inner.protocol.indexOf('nova') >= 0 && this.props.mode == 'edit')) && <Button type="primary" htmlType="submit" size="large" onClick={e=>{e.preventDefault(); this.setState({showTypeAdd: true, typeName: '', typeFields: []})}} disabled={this.props.mode == 'view'} >+ 参数类型</Button>
                  }
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  {
                    (this.props.inner.protocol == 'dubbo' || (this.props.inner.protocol.indexOf('nova') >= 0 && this.props.mode == 'edit')) && <Button type="primary" htmlType="submit" size="large" onClick={e=>{e.preventDefault(); this.setState({showTypeList: true})}} ><Icon type='setting' />管理类型</Button>
                  }
                <br />
                <br />
                <Table showHeader={true} dataSource={this.props.inner.mappingParams} pagination={false} bordered >
                    <Column title='参数名' dataIndex='name' key='name' width='20%' render={(text, param) => (
                        <Cascader options={param.options} value={param.paths} placeholder="选择参数" disabled={true} className={'no-disable'} size={'large'} style={{background: '#fff', color: '#000', width: '100%'}} disabled={true} />
                     ) } />
                    {
                        (this.props.inner.protocol == 'dubbo' || this.props.inner.protocol == 'nova_java') &&
                        <Column title='参数类型' dataIndex='type' key='type' width='10%' render={(text, param) => (
                            <span className='badge alert-success'>{param.type}</span>
                         ) } />
                    }
                    <Column title='参数来源' dataIndex='source' key='source' width='15%' render={(text, param) => (
                        <Radio.Group value={param.source} onChange={e=> {this.props.onSetMappingParamValue(param.id, 'source', e.target.value)}} disabled={this.props.mode == 'view'} >
                          <Radio value="outer">外部传入</Radio>
                          <Radio value="inner">内部传入</Radio>
                        </Radio.Group>
                     ) } />
                    <Column title='映射参数名' dataIndex='outerName' key='outerName' width='10%' render={(text, param) => (
                        <Row>
                            <Col md={24}>
                                {
                                    param.source == 'outer' && 
                                    <Select showSearch placeholder="选择参数" style={{width: '100%'}} value={param.outerName} onSelect={val=> {this.props.onSetMappingParamValue(param.id, 'outerName', val, this.props.state)}} disabled={this.props.mode == 'view'} 
                                    filterOption={(input, option) => { return option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 || option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}}>
                                        {
                                            this.props.state.outer.params.map(type => {
                                                return (
                                                    <Option key={type.name} value={type.name}>{type.name}</Option>
                                                )
                                            })
                                        }
                                    </Select>
                                }
                                {
                                    param.source == 'inner' &&
                                    <Select showSearch placeholder="选择参数" style={{width: '100%'}} value={param.outerName} onSelect={val=> {this.props.onSetMappingParamValue(param.id, 'outerName', val, this.props.state)}} disabled={this.props.mode == 'view'} 
                                    filterOption={(input, option) => { return option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 || option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}}>
                                        {
                                            Constant.API_INNER_PARAMS.map(type => {
                                                return (
                                                    <Option key={type.value} value={type.value}>{type.text}</Option>
                                                )
                                            })
                                        }
                                    </Select>
                                }
                            </Col>
                        </Row>
                     ) } />
                    <Column title='映射参数类型' dataIndex='outerType' key='outerType' width='10%' render={(text, param) => (
                        param.outerType && <span className='badge alert-success'>{param.outerType}</span>
                     ) } />
                </Table>
                </Card>
                <br />
                <center>
                    <Button type="primary" htmlType="submit" size="large" onClick={e=>{this.props.handlePrevious(); }} ghost={true}><Icon type="left" /> 上一步</Button>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    {
                        !(this.props.mode && this.props.mode == "view") && 
                        <Button type="primary" htmlType="submit" size="large" onClick={e=>{this.handleSubmit(e)}} loading={this.props.state.app.loading}>保存</Button>
                    }
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <Button type="primary" htmlType="submit" size="large" ghost={true} disabled={!this.props.inner.isCreated} onClick={e=>{e.preventDefault(); this.handleContinue(e)}}>继续 <Icon type="right" /></Button>
                </center>

                <Modal
                  title="添加Java类型"
                  wrapClassName="vertical-center-modal"
                  okText="添加"
                  cancelText="取消"
                  visible={this.state.showTypeAdd}
                  width={1000}
                  onOk={() => this.setState({showTypeAdd: false})}
                  onCancel={() => this.setState({showTypeAdd: false})}
                  footer={
                    <center>
                        <Button type="primary" onClick={e=>{e.preventDefault(); this.onAddType();}} disabled={this.props.mode == 'view'}>添加</Button> 
                        <Button onClick={e=>{e.preventDefault(); this.setState({showTypeAdd: false});}}>取消</Button>
                    </center>}
                >
                  <Form >
                    <Form.Item labelCol={{md: 7}} wrapperCol={{md: 10}} label="名称" >
                      <Input value={this.state.typeName} onChange={e=>{this.setState({typeName: e.target.value})}} placeholder="填全类名，例如：com.youzan.carmen.UserSearchForm" />
                    </Form.Item>
                  </Form>
                  <Table showHeader={true} dataSource={this.state.typeFields} pagination={false} bordered  >
                    <Column title='名称' dataIndex='name' key='name' width='10%' render={(text, field) => (
                        <Input value={field.name} onChange={e=> {this.onSetTypeField(field.id, 'name', e.target.value)}} />
                     ) } />
                        <Column title='类型' dataIndex='type' key='type' width='10%' render={(text, field) => (
                            <Row>
                                <Col md={24}>
                                    <Select showSearch placeholder="选择类型" style={{width: '100%'}} value={field.type} onSelect={val=> {this.onSetTypeField(field.id, 'type', val)}} 
                                    filterOption={(input, option) => { return option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 || option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}}>
                                        {
                                            this.props.inner.types.map(type => {
                                                return (
                                                    <Option key={type.value} value={type.value}>{type.text}</Option>
                                                )
                                            })
                                        }
                                    </Select>
                                </Col>
                            </Row>
                         ) } />
                        <Column title='操作' dataIndex='operation' key='operation' width='10%' render={(text, field) => (
                            <span>
                              <Button onClick={e => {e.preventDefault(); this.onDeleteTypeField(field.id)}} >删除</Button>
                            </span>
                          )} />
                    </Table>
                <br/>
                <Button type="primary" htmlType="submit" size="large" onClick={e=>{e.preventDefault(); this.onAddTypeField()}}>+ 字段</Button>
                </Modal>

                <Modal
                  title="编辑Java类型"
                  wrapClassName="vertical-center-modal"
                  okText="添加"
                  cancelText="取消"
                  visible={this.state.showTypeEdit}
                  width={1000}
                  onOk={() => this.setState({showTypeEdit: false})}
                  onCancel={() => this.setState({showTypeEdit: false})}
                  footer={
                    <center>
                        <Button type="primary" onClick={e=>{e.preventDefault(); this.onUpdateType();}} disabled={this.props.mode == 'view'}>保存</Button> 
                        <Button onClick={e=>{e.preventDefault(); this.setState({showTypeEdit: false});}}>取消</Button>
                    </center>}
                >
                  <Form >
                    <Form.Item labelCol={{md: 7}} wrapperCol={{md: 10}} label="名称" >
                      <Input value={this.state.typeName} onChange={e=>{this.setState({typeName: e.target.value})}} />
                    </Form.Item>
                  </Form>
                  <Table showHeader={true} dataSource={this.state.typeFields} pagination={false} bordered  >
                    <Column title='名称' dataIndex='name' key='name' width='10%' render={(text, field) => (
                        <Input value={field.name} onChange={e=> {this.onSetTypeField(field.id, 'name', e.target.value)}} />
                     ) } />
                        <Column title='类型' dataIndex='type' key='type' width='10%' render={(text, field) => (
                            <Row>
                                <Col md={24}>
                                    <Select showSearch placeholder="选择类型" style={{width: '100%'}} value={field.type} onSelect={val=> {this.onSetTypeField(field.id, 'type', val)}}
                                    filterOption={(input, option) => { return option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 || option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}}>
                                        {
                                            this.props.inner.types.map(type => {
                                                return (
                                                    <Option key={type.value} value={type.value}>{type.text}</Option>
                                                )
                                            })
                                        }
                                    </Select>
                                </Col>
                            </Row>
                         ) } />
                        <Column title='操作' dataIndex='operation' key='operation' width='10%' render={(text, field) => (
                            <span>
                              <Button onClick={e => {e.preventDefault(); this.onDeleteTypeField(field.id)}} disabled={this.props.mode == 'view'}>删除</Button>
                            </span>
                          )} />
                    </Table>
                <br/>
                <Button type="primary" htmlType="submit" size="large" onClick={e=>{e.preventDefault(); this.onAddTypeField()}} disabled={this.props.mode == 'view'}>+ 字段</Button>
                </Modal>

                <Modal
                  title="类型列表"
                  wrapClassName="vertical-center-modal"
                  okText="添加"
                  cancelText="取消"
                  visible={this.state.showTypeList}
                  width={1000}
                  onOk={() => this.setState({showTypeList: false})}
                  onCancel={() => this.setState({showTypeList: false})}
                  footer={<center><Button type="primary" onClick={e=>{e.preventDefault(); this.setState({showTypeList: false});}}>关闭</Button></center>}
                >
                  <Table showHeader={true} dataSource={this.props.inner.types.filter(type=>!type.isBasic)} pagination={false} bordered  >
                    <Column title='名称' dataIndex='name' key='name' width='70%' render={(text, type) => (
                        <label>{type.value}</label>
                     ) } />
                    <Column title='操作' dataIndex='operation' key='operation' width='20%' render={(text, type) => (
                        <span>
                            <Button onClick={e => {e.preventDefault(); this.onEditType(type.id); this.setState({showTypeList: false, showTypeAdd: false, showTypeEdit: true});}} >编辑</Button>
                            &nbsp;&nbsp;
                            <Button onClick={e => {e.preventDefault(); this.props.onDeleteType(type.id)}} disabled={this.props.mode == 'view'}>删除</Button>
                        </span>
                      )} />
                    </Table>
                    <br />
                    <Button type="primary" onClick={e=>{e.preventDefault(); this.setState({showTypeList: false, showTypeEdit: false, showTypeAdd: true})}} disabled={this.props.mode == 'view'}>添加类型</Button>
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
	return {
		inner: state.inner,
		state: state
	}
}

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		onInitParam: (outer) => {
			dispatch({type: 'INNER_INIT_PARAM', outer: outer});
			dispatch({type: 'INNER_REBUILD_MAPPING_PARAM'});
		},
		onAddParam: () => {
			dispatch({type: 'INNER_ADD_PARAM', id: uuidV1()});
		},
		onDeleteParam: (id) => {
			dispatch({type: 'INNER_DELETE_PARAM', 'id': id});
            dispatch({type: 'INNER_REBUILD_MAPPING_PARAM'});
		},
		onSetParamValue: (id, col, val) => {
			dispatch({type: 'INNER_SET_PARAM', 'id': id, col: col, value: val});
			if (col == 'type') {
				dispatch({type: 'INNER_REBUILD_MAPPING_PARAM'});
			}
		},
		onAddMappingParam: () => {
			dispatch({type: 'INNER_ADD_MAPPING_PARAM', id: uuidV1()});
		},
		onDeleteMappingParam: (id) => {
			dispatch({type: 'INNER_DELETE_MAPPING_PARAM', id: id});
		},
		onSetMappingParamValue: (id, col, val, ext) => {
			dispatch({type: 'INNER_SET_MAPPING_PARAM', 'id': id, col: col, value: val, ext: ext});
		},
		onSetFieldValue: (field, val) => {
			dispatch({type: 'INNER_SET_FIELD', field: field, value: val});
            if (field == 'protocol') {
                dispatch({type: 'INNER_CLEAR_PARAM'});
            }
		},
		onAddType: (type) => {
			dispatch({type: 'INNER_ADD_TYPE', newType: type});
		},
        onUpdateType: (id, type) => {
            dispatch({type: 'INNER_UPDATE_TYPE', id: id, newType: type});
        },
        onDeleteType: (id) => {
            dispatch({type: 'INNER_DELETE_TYPE', id: id});
        },
		onRebuildMappingParam: () => {
			dispatch({type: 'INNER_REBUILD_MAPPING_PARAM'});
		}
	}
}

const InnerForm = Form.create()(Inner);

export default connect(mapStateToProps, mapDispatchToProps)(InnerForm);

