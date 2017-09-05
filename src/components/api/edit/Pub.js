import React, { Component } from 'react';

import {Steps, Button, Card, Icon, notification, Popconfirm, Modal, Form, Input, Checkbox, AutoComplete, Select} from 'antd';
import {connect} from 'react-redux';
import { getStore } from '../../../util/globalStore';
import { getEnv } from '../../../util/globalEnv';

class Publish extends React.Component {

	constructor(props) {
		super(props);
		this.state = { step: 0, api: {}, registryData: [] };
		const env = this.props.state.app.user.env;
		if (env == 'qa' || env == 'dev') {
			this.state.step = 0;
		} else if (env == 'test') {
			this.state.step = 1;
		} else if (env == 'prod' || env == 'pre') {
			this.state.step = 2;
		}
	}

	componentDidMount() {
		this.props.onReset();

		var apiId = this.props.state.inner.apiId;
		if (!apiId) {
			apiId = this.props.apiId;
		}
		fetch('/web/api/' + apiId).then(resp => {
			if (!resp.data || resp.data == null) {
				return;
			}
			this.setState({api: resp.data.carmenApi});
			this.props.onSetFieldValue('showAddressSelect', resp.data.carmenApi.apiType != 2);
			if (resp.data.carmenApi.apiType == 2) {
				this.props.onSetFieldValue('showAddressUrl', false);
			}
			const env = this.props.state.app.user.env;
			if (env != 'prod' && this.state.api.apiStatus > 2) {
				this.state.step++;
				this.setState({step: this.state.step});
			}
		});

		fetch('/web/registry').then(resp => {
			var registrys = resp.data;
			var registryData = [];
			for (var i=0; i<registrys.length; i++) {
				var reg = registrys[i];
				registryData.push({
					key: i,
					name: reg.name,
					text: reg.url,
					value: reg.url
				});
			}
			this.setState({registryData: registryData});
		});

	}

	componentWillUnmount() {
		this.props.onReset();
	}

	onPublish() {
		const apiId = this.props.state.inner.apiId;
		this.props.onPublish(apiId, this.state.api);
	}

	render() {
		var address = '注册中心地址';
		if (this.state.api.apiType == 2 ) {
			address = 'http地址';
		}
		const env = this.props.state.app.user.env;

		return (
			<div>
			  <Card title="发布API">
			  	<Steps current={this.state.step}>
				    <Steps.Step title="qa环境" description="测试联调环境，地址: http://carmen-console-ng-qa.s.qima-inc.com" />
				    <Steps.Step title="multi-pre环境" description="多人预发环境，地址: http://carmen-console-multi-pre.s.qima-inc.com" />
				    <Steps.Step title="prod环境" description="生产环境，地址: http://carmen-console-ng.s.qima-inc.com" />
				</Steps>
			    <br/>
			    <br/>
			    <Form.Item labelCol={{md: 6}} wrapperCol={{md: 7}} label={"需要覆盖" + address} >
					<Checkbox checked={this.props.pub.showAddressUrl} onChange={e=> { this.props.onSetFieldValue('showAddressUrl', !this.props.pub.showAddressUrl);  }} disabled={this.props.mode == 'view'} >是</Checkbox>
				</Form.Item>
			    {
			    	this.props.pub.showAddressUrl && this.props.pub.showAddressSelect &&
			    	<Form.Item labelCol={{md: 6}} wrapperCol={{md: 10}} label={address} >
					      <Select placeholder="选择地址" style={{width: '100%'}} value={this.props.pub.addressUrl} onSelect={val=> { this.props.onSetFieldValue('addressUrl', val); }} disabled={this.props.mode == 'view'} 
				      		filterOption={(input, option) => { return option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 || option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}}>
			      				{
			      					this.state.registryData.map(reg => {
							    		return (
							    			<Option key={reg.value} value={reg.value}>{reg.name + ' - (' + reg.value + ')'}</Option>
							    		)
							    	})
			      				}
			      			</Select>
					      <Checkbox checked={!this.props.pub.showAddressSelect} onChange={e=> { this.props.onSetFieldValue('showAddressSelect', !this.props.pub.showAddressSelect); this.props.onSetFieldValue('addressUrl', ''); }} disabled={this.props.mode == 'view'} >手动输入</Checkbox>
					</Form.Item>
			    }
			    {
			    	this.props.pub.showAddressUrl && !this.props.pub.showAddressSelect &&
			    	<Form.Item labelCol={{md: 6}} wrapperCol={{md: 10}} label={address} >
						<Input placeholder="填入地址" value={this.props.pub.addressUrl} onChange={ e=> { this.props.onSetFieldValue('addressUrl', e.target.value); }} disabled={this.props.mode == 'view'}  />
						{
							this.state.api.apiType != 2 &&
							<Checkbox checked={!this.props.pub.showAddressSelect} onChange={e=> { this.props.onSetFieldValue('showAddressSelect', !this.props.pub.showAddressSelect); this.props.onSetFieldValue('addressUrl', '');  }} disabled={this.props.mode == 'view'} >从列表选择</Checkbox>
						}
					</Form.Item>
			    }
			    <Form.Item labelCol={{md: 6}} wrapperCol={{md: 7}} label={"需要覆盖文档"} >
					<Checkbox onChange={e=> { this.props.onSetFieldValue('overrideDoc', !this.props.pub.overrideDoc);  }} disabled={this.props.mode == 'view'} >是</Checkbox>
				</Form.Item>
			    </Card>
			    {
			    	!this.props.isListTrigger && 
				    <center>
				    	<br/>
				    	<Button type="primary" htmlType="submit" size="large" onClick={e=>{ this.props.handlePrevious(); }} ghost={true}><Icon type="left" /> 上一步</Button>
                    	&nbsp;&nbsp;&nbsp;&nbsp;
                    	{
                    		!(this.props.mode && this.props.mode == "view") && env != 'pre' && env != 'prod' &&
                    		<Button type="primary" onClick={e=>{e.preventDefault(); this.onPublish(); }} loading={this.props.state.app.loading} >发布</Button>	
                    	}
				    </center>
				}
			</div>
		);
	}

}

const mapStateToProps = (state) => {
	return {
		state: state,
		pub: state.pub
	}
}

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		onReset: () => {
			dispatch({type: 'PUBLISH_RESET_STORE'});
		},
		onSetFieldValue: (name, val) => {
			dispatch({type: 'PUBLISH_SET_FIELD', field: name, value: val});
		},
		onPublish: (apiId, api, fn) => {
			const doPublish = (apiId) => {
				const store = getStore();
				const pub = store.getState().pub;
				var form = {
	            	ids: [apiId]
	            }
				if (pub.showAddressUrl && pub.addressUrl) {
					form.addressUrl = pub.addressUrl;
				}
				if (pub.overrideDoc) {
					form.isRewriteDoc = 1;
				} else {
					form.isRewriteDoc = 0;
				}

				fetch('/web/api/publish', {
		            method: 'POST',
		            body: JSON.stringify(form)
		        }).then((resp) => {
		        	fetch('/web/user/self').then(resp => {
		        		var msg = '';
						var env = resp.data.env;
						if (env == 'dev' || env == 'qa') {
			        		msg += 'API发布成功，请到预发环境(multi-pre环境)查看该API';
			        	} else if (env == 'test') {
							if (api.enableInnerOuter == 1) {
			        			msg += 'API已发布，但该API需要卡门管理员审核，审核通过才能完成发布，请到生产环境(prod环境)->审核列表查看进度';
							} else {
								msg += 'API发布成功，请到生产环境(prod环境)查看该API，并进行冒烟测试';
							}
			        	}
			            notification.info({
			                message: msg,
			                duration: 7
			            });
			            if (fn) {
			            	fn();
			            }
					});
		        });
			}

			doPublish(apiId);
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Publish);