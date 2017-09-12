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
		  ...props.model
		};
	},
	onValuesChange(_, values) {
      console.log(values);
    },
})((props) => {
    const { visible, onCancel, onCreate, form , title, okButtonText} = props;
    const { getFieldDecorator } = form;
    return (
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

    );
  });

class ConnectionForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {visible: false, model: {connectionName:'',host:'', port:'', user:'', password:'', schema:''}}
  }

  setModel = (data) =>{
    let model = {};
    model.ID = {value:data.id};
    model.HOST = {value:data.host};
    model.PORT = {value:data.port};
    model.USER_NAME = {value:data.user};
    model.PASSWORD = {value:data.password};
    model.SCHEMA = {value:data.schema};
    model.CONNECTION_NAME = {value:data.connectionName};
  	this.setState({model: model});
  }

  showModal = () => {
    this.setState({ visible: true });
  }

  handleCancel = () => {
    this.setState({ visible: false });
  }

  handleFormChange = (changedFields) => {
    this.setState({
      model: { ...this.state.model, ...changedFields },
    });
  }

  handleCreate = () => {
    this.form.validateFields((err, values) => {
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
		  this.form.resetFields();
		  this.setState({ visible: false });
		  this.props.afterConnectionNew();
	  });
      
    });
  }

  handleUpdate = () => {
    const form = this.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      debugger;
  	  fetch("/db/editConnection/"+this.state.model.ID.value, {
  	    method: "POST",
  	    headers: {
  	       'accept': 'application/json',
  	       'Content-Type': 'application/json'
  	    },
  	    body: JSON.stringify(values)
  	  }).then(response=>response.json()).then(resp=>{
  		  this.form.resetFields();
  		  this.setState({ visible: false });
  		  this.props.afterConnectionUpdate();
  	  });
    });
  }


  saveFormRef = (form) => {
    this.form = form;
  }

  render() {
  	let model = this.state.model;
    let onCreate;
    let title = "";
    let buttonText = "";
  	if('add'==this.props.type){
  		onCreate = this.handleCreate;
      title = "创建连接";
      buttonText = "创建";
  	}else if('edit'==this.props.type){
		  onCreate = this.handleUpdate;
      title = "编辑连接";
      buttonText = "更新";
  	}
    return (
        <Modal
        visible={this.state.visible}
        title={title}
        okText={buttonText}
        onCancel={this.handleCancel}
        onOk={onCreate}>
         <CollectionCreateForm ref={this.saveFormRef} model={model} onChange={this.handleFormChange}/>
        </Modal>
    );
  }
}

export default ConnectionForm;
