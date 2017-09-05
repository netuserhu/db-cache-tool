import React, { Component } from 'react';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox, Button, Radio, Table, Card, Collapse, Modal, AutoComplete, Popconfirm, notification} from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

import APIParsePreview from './Preview';

class APIParseGuide extends React.Component {
    constructor(props) {
        super(props);
        this.state = {branch: '', branches: [], interfaces: [], selectedRowKeys: [], showPreview: false};
    }

    onLoadBranch() {
        if (!this.state.url || !this.state.url.trim()) {
            notification.error({message: '请输入git地址'});
            return;
        }
        fetch('/web/gitlab/branches?url=' + this.state.url).then(resp => {
            this.setState({branches: resp.data});
        });
    }

    onLoad() {
        if (!this.state.branch) {
            notification.error({message: '请选择分支'});
            return;
        }
        fetch('/web/gitlab/clone?url=' + this.state.url + '&branch=' + this.state.branch).then(resp => {
            fetch('/web/apidoc/interface?url=' + this.state.url).then(response => {
                this.setState({interfaces: response.data});
            });
        });
    }

    onLoadMethod(interfaceName) {
        this.setState({interfaceName, selectedRowKeys: []});
        fetch('/web/apidoc/' + interfaceName + '/method').then(resp => {
            this.setState({methods: resp.data});
        });
    }

    onBatchCreateAPI() {
        if (!this.state.selectedRowKeys || this.state.selectedRowKeys.length <= 0) {
            return;
        }
        const interfaceName = this.state.interfaceName;
        for (var i=0; i<this.state.selectedRowKeys.length; i++) {
            var idx = this.state.selectedRowKeys[i];
            const method = this.state.methods[idx];
            const methodName = method.name;
            fetch('/web/apidoc/api?interfaceName=' + interfaceName + '&methodName=' + methodName, {
                method: 'POST'
            }).then(resp => {
                notification.info({
                    message: '创建成功 "' + interfaceName + '.' + methodName + '" ，请到列表查看'
                });
            });
        }
    }

    onCreateAPI(methodName) {
        const interfaceName = this.state.interfaceName;
        fetch('/web/apidoc/api?interfaceName=' + interfaceName + '&methodName=' + methodName, {
            method: 'POST'
        }).then(resp => {
            notification.info({
                message: '创建成功，请到列表查看'
            });
        });
    }

    onSelectChange = (selectedRowKeys) => {
	    this.setState({ selectedRowKeys });
	}

    render() {
        const { selectedRowKeys } = this.state;
	    const rowSelection = {
	      selectedRowKeys,
	      onChange: this.onSelectChange
	    };
	    const hasSelected = selectedRowKeys.length > 0;

        return (
            <div>
                <Row>
					<Col md={8}>
                        <FormItem labelCol={{md: 4}} wrapperCol={{md: 19}} label="git地址"  >
                            <Input style={{ width: '98%' }} size={'large'} 
                                onChange={e => { e.preventDefault(); this.setState({url: e.target.value}) }} placeholder="请输入git地址" onBlur={ e => {e.preventDefault(); this.onLoadBranch();} } />
                        </FormItem>
						&nbsp;&nbsp;
					</Col>
                    <Col md={8}>
                        <FormItem labelCol={{md: 3}} wrapperCol={{md: 19}} label="分支"  >
                            <Select
                                showSearch
                                size={'large'}
                                style={{ width: '99%' }}
                                placeholder="选择分支"
                                optionFilterProp="children"
                                onSelect={val => this.setState({branch: val})}
                                value={this.state.branch}
                                filterOption={(input, option) => { return option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 || option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}}
                            >
                                {
                                    this.state.branches.map(protocol => {
                                        return (
                                            <Option key={protocol.name} value={protocol.name}>{protocol.name}</Option>
                                        )
                                    })
                                }
                                </Select>
                        </FormItem>
					</Col>
					<Col md={3}>
						<Button type="primary" size={'large'} onClick={e=> {e.preventDefault(); this.onLoad(); }}><Icon type='setting' />解析</Button>
					</Col>
				</Row>

                <Button type="primary" size={'large'} onClick={e=> {e.preventDefault(); this.onBatchCreateAPI(); }} ><Icon type='setting' />批量创建API</Button>
                <br /><br />

                <Row>
                    <Col md={10}>
                        <Table showHeader={true} dataSource={this.state.interfaces} pagination={false} bordered >
                            <Table.Column title='接口名称' dataIndex='name' key='name' width='40%' render={(text, param) => (
                                <span>
                                    <a href="javascript:void(0);" onClick={e => { this.onLoadMethod(param) }} >
                                        {param}
                                    </a>
                                </span>
                            ) } />
                        </Table>
                    </Col>
                    <Col md={14}>
                        <Table showHeader={true} dataSource={this.state.methods} pagination={false} bordered style={{width: '98%', marginLeft: '10px'}} rowSelection={rowSelection} >
                            <Table.Column title='方法名称' dataIndex='name' key='name' width='40%' render={(text, method) => (
                                <span>
                                    {method.name}
                                </span>
                            ) } />
                            <Table.Column title='操作' dataIndex='op' key='op' width='40%' render={(text, method) => (
                                <span>
                                    <a href='javascript:void(0);' onClick={e => { e.preventDefault(); this.setState({showPreview: true, methodName: method.name}) }} ><Icon type="search" /> 预览</a> &nbsp;&nbsp;&nbsp;
                                    <a href='javascript:void(0);' onClick={e => { e.preventDefault(); this.setState({methodName: method.name}); this.onCreateAPI(method.name); }} ><Icon type="plus-circle-o" /> 创建</a>
                                </span>
                            ) } />
                        </Table>
                    </Col>
                </Row>
                <br />
                <Modal
                    title="预览API"
                    wrapClassName="vertical-center-modal"
                    okText="添加"
                    cancelText="取消"
                    visible={this.state.showPreview}
                    width={1000}
                    onOk={() => this.setState({showPreview: false})}
                    onCancel={() => this.setState({showPreview: false})}
                    footer={<center><Button type="primary" onClick={e=>{e.preventDefault(); this.setState({showPreview: false});}}>关闭</Button></center>}
                >
                    {this.state.showPreview ? <APIParsePreview interfaceName={this.state.interfaceName} methodName={this.state.methodName} /> : '' }
                    <br />
                    <Button type="primary" onClick={e=>{e.preventDefault(); this.setState({showTypeList: false, showTypeEdit: false, showTypeAdd: true})}} disabled={this.props.mode == 'view'}>添加类型</Button>
                </Modal>
            </div>
        )
    }
}

export default APIParseGuide;