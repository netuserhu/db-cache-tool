require('../../styles/ConnectionManager.css');
import React, { Component} from 'react';
import {Button, Modal, Form, Input, Radio} from 'antd';
const FormItem = Form.Item;


const CollectionCreateForm = Form.create({
	onFieldsChange(props, changedFields) {
		props.onChange(changedFields);
	},
	mapPropsToFields(props) {
		return {
		  CONNECTION_NAME:{
		  	value: props.model.connectionName
		  },
		  HOST:{
		  	value: props.model.host
		  },
		  PORT:{
		  	value: props.model.port
		  },
		  USER_NAME:{
		  	value: props.model.user
		  },
		  PASSWORD:{
		  	value: props.model.password
		  },
		  SCHEMA:{
		  	value: props.model.schema
		  }
		};
	},
	onValuesChange(_, values) {
      console.log(values);
    },
})((props) => {
    const { visible, onCancel, onCreate, form , title, okButtonText} = props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        visible={visible}
        title={title}
        okText={okButtonText}
        onCancel={onCancel}
        onOk={onCreate}
      >
        <Form layout="vertical">
          <FormItem label="连接名">
            {getFieldDecorator('CONNECTION_NAME', {
              rules: [{ required: true, message: 'Please input the title of collection!' }],
            })(
              <Input  />
            )}
          </FormItem>
          <FormItem label="主机">
            {getFieldDecorator('HOST', {
              rules: [{ required: true, message: 'Please input the host of collection!' }],
            })(
              <Input  />
            )}
          </FormItem>
          <FormItem label="端口">
            {getFieldDecorator('PORT', {
              rules: [{ required: true, message: 'Please input the port of collection!' }],
            })(
              <Input   />
            )}
          </FormItem>
          <FormItem label="用户名">
            {getFieldDecorator('USER_NAME', {
              rules: [{ required: true, message: 'Please input the username of collection!' }],
            })(
              <Input   />
            )}
          </FormItem>
          <FormItem label="密码">
            {getFieldDecorator('PASSWORD', {
              rules: [{ required: true, message: 'Please input the password of collection!' }],
            })(
              <Input   />
            )}
          </FormItem>
          <FormItem label="数据库">
            {getFieldDecorator('SCHEMA', {
              rules: [{ required: true, message: 'Please input the schema of collection!' }],
            })(
              <Input   />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  });

class ConnectionForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {visible: false, model: {connectionName:'',host:'', port:'', user:'', password:'', schema:''}}
  }

  setModel = (data) =>{
  	this.setState({model: data});
  }

  showModal = () => {
    this.setState({ visible: true });
  }

  handleCancel = () => {
    this.setState({ visible: false });
  }

  handleFormChange = (changedFields) => {
    this.setState({
      fields: { ...this.state.fields, ...changedFields },
    });
  }

  handleCreate = () => {
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
	  fetch("/db/createConnection", {
	    method: "POST",
	    headers: {
	       'accept': 'application/json',
	       'Content-Type': 'application/json'
	    },
	    body: JSON.stringify(values)
	  }).then(response=>response.json()).then(resp=>{
		  //form.resetFields();
		  this.setState({ visible: false });
		  //this.props.afterConnectionNew();
	  });
      
    });
  }

  handleUpdate = () => {
    const form = this.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
	  fetch("/db/editConnection", {
	    method: "POST",
	    headers: {
	       'accept': 'application/json',
	       'Content-Type': 'application/json'
	    },
	    body: JSON.stringify(values)
	  }).then(response=>response.json()).then(resp=>{
		  //form.resetFields();
		  this.setState({ visible: false });
		  //this.props.afterConnectionNew();
	  });
      
    });
  }


  saveFormRef = (form) => {
    this.form = form;
  }

  render() {
  	debugger;
  	let content;
  	let model = this.state.model;
  	if('add'==this.props.type){
  		content =  <CollectionCreateForm ref={this.saveFormRef}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          title="创建连接"
          okButtonText="创建" />;
  	}else if('edit'==this.props.type){
		  content =  <CollectionCreateForm ref={this.saveFormRef}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleUpdate}
          title="编辑连接"
          okButtonText="更新"
          model={model} />;
  	}
  	
    return (
        {content}
    );
  }
}

export default ConnectionForm;
