import React, { Component } from 'react';
import Collapse from 'react-collapse';
import {presets} from 'react-motion';
import Constant from '../../../constant/global';
import SyntaxHighlighter, { registerLanguage } from "react-syntax-highlighter/dist/light"
import { xcode } from 'react-syntax-highlighter/dist/styles';
import js from 'react-syntax-highlighter/dist/languages/javascript';
import python from 'react-syntax-highlighter/dist/languages/python';
import csharp from 'react-syntax-highlighter/dist/languages/cs';
import java from 'react-syntax-highlighter/dist/languages/java';
import php from 'react-syntax-highlighter/dist/languages/php';
import json from 'react-syntax-highlighter/dist/languages/json';

registerLanguage('javascript', js);
registerLanguage('python', python);
registerLanguage('csharp', csharp);
registerLanguage('java', java);
registerLanguage('php', php);
registerLanguage('json', json);

import {Tabs, Table, Column, Button, Row, Col, Select, Input, Card, notification, Icon, Checkbox, Modal, Form, AutoComplete, Popconfirm, Alert, Tree} from 'antd';
const uuidV1 = require('uuid/v1');
import 'whatwg-fetch';
var _ = require('lodash');

const {Panel, PanelHeader, PanelBody} = require('../../thirdpart/Panel');

export default class Preview extends React.Component {

	constructor(props) {
		super(props);
		this.state = { params: [], results: [], activeLang: 'Java', docData: {}, apiData: {}, apiParams: [] };
	}

	componentDidMount() {
		var apiId = this.props.apiId;
		this.setState({apiId: apiId});

		fetch('/web/api/' + apiId).then(resp => {
			this.setState({apiData: resp.data.carmenApi});
            this.setState({apiParams: resp.data.carmenApiParams});
		});

		fetch('/web/api/' + apiId + '/doc').then(resp => {
            if (!resp.data || resp.data == null) {
                return;
            }
            this.setState({docData: resp.data});
        });
        fetch('/web/user/self').then(resp => {
            this.setState({currentUser: resp.data});
            this.onRefresh();
        })
	}

	componentWillUnmount() {
		//this.props.onReset();
	}

	onRefresh(pageNum) {
		var newPageNum = 1;
		if (pageNum) {
			newPageNum = pageNum;
		}
		var qs = 'pageNum=' + newPageNum + '&';
		if (this.state.metaName) {
			qs += 'name=' + this.state.metaName; 
		}

		fetch('/web/meta?' + qs).then(resp => {
			this.setState({metaData: resp.data});
		});
	}

    getTree(struct) {
		if (!struct) {
			return;
		}
		return (
			<Tree showLine={true} defaultExpandedKeys={['0']}>
				{
					this.traceTree(struct, ['0'])
				}
			</Tree>
		)
	}

	traceTree(struct, route) {
		var childrenNodes = [];
		var keyPrefix = '';
		for (var i=0; i<route.length; i++) {
			keyPrefix += route[i];
		}
		if (struct.children && struct.children.length > 0) {
			for (var i=0; i<struct.children.length; i++) {
				route.push('-' + i);
				const node = this.traceTree(struct.children[i], route);
				childrenNodes.push(node);
				route.pop();
			}
		}

		return (
			<Tree.TreeNode title={struct.name + '[' + struct.type + ']'} key={keyPrefix}>
				{childrenNodes}
			</Tree.TreeNode>
		)
	}

	render() {

		const apiNamespace = this.state.apiData.namespace;
		const apiMethod = this.state.apiData.name;
		const apiVersion = this.state.apiData.version;
		const outerUrl = "https://open.youzan.com/api";
		const innerUrl = "https://carmen.youzan.com/gw";
		const oauthUrl = 'oauthentry';
		const signUrl = 'entry';
		const apiFullName = apiNamespace + '/' + apiVersion + '/' + apiMethod ;


        let javaDemo = '';
        let pythonDemo = '';
        let csharpDemo = '';
        let nodejsDemo = '';
        let phpDemo = '';

        if (this.state.docData.demos) {
            let demos = this.state.docData.demos;
            for (var i=0; i<demos.length; i++) {
                if (demos[i].lang == 'java') {
                    javaDemo = demos[i].code;
                } else if (demos[i].lang == 'python') {
                    pythonDemo = demos[i].code;
                } else if (demos[i].lang == 'csharp') {
                    csharpDemo = demos[i].code;
                } else if (demos[i].lang == 'nodejs') {
                    nodejsDemo = demos[i].code;
                } else if (demos[i].lang == 'php') {
                    phpDemo = demos[i].code;
                }
            }
        }

		return (
			<div>
                <Panel>
                    <PanelHeader>
                        URL调用示例
                    </PanelHeader>
                    <PanelBody>
                        <Tabs size="small">
                            <Tabs.TabPane tab="对内" key="1" >
                                <Row gutter={16}>
                                    <Col span={3}>
                                        <span style={{ color: '#28b5d6', fontSize: '12px' }}>
                                            服务商接入: 
                                        </span>
                                    </Col>
                                    <Col span={21}>
                                        <span style={{ color: '#28b5d6', fontSize: '12px' }}>
                                            <p>
                                                curl -X POST -d "key1=value1&key2=value2" { innerUrl + '/' + oauthUrl + '/' + apiFullName }
                                            </p>
                                        </span>
                                    </Col>
                                </Row>
                                <br/>
                                <Row gutter={16}>
                                    <Col span={3}>
                                        <span style={{ color: '#28b5d6', fontSize: '12px' }}>
                                            商家自有接入: 
                                        </span>
                                    </Col>
                                    <Col span={21}>
                                        <span style={{ color: '#28b5d6', fontSize: '12px' }}>
                                            <p>
                                                curl -X POST -d "key1=value1&key2=value2" { innerUrl + '/' + signUrl + '/' + apiFullName }
                                            </p>
                                        </span>
                                    </Col>
                                </Row>
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="对外" key="2">
                                <Row gutter={16}>
                                    <Col span={3}>
                                        <span style={{ color: '#28b5d6', fontSize: '12px' }}>
                                            服务商接入: 
                                        </span>
                                    </Col>
                                    <Col span={21}>
                                        <span style={{ color: '#28b5d6', fontSize: '12px' }}>
                                            <p>
                                                curl -X POST -d "key1=value1&key2=value2" { outerUrl + '/' + oauthUrl + '/' + apiFullName }
                                            </p>
                                        </span>
                                    </Col>
                                </Row>
                                <br/>
                                <Row gutter={16}>
                                    <Col span={3}>
                                        <span style={{ color: '#28b5d6', fontSize: '12px' }}>
                                            商家自有接入: 
                                        </span>
                                    </Col>
                                    <Col span={21}>
                                        <span style={{ color: '#28b5d6', fontSize: '12px' }}>
                                            <p>
                                                curl -X POST -d "key1=value1&key2=value2" { outerUrl + '/' + signUrl + '/' + apiFullName }
                                            </p>
                                        </span>
                                    </Col>
                                </Row>
                            </Tabs.TabPane>
                        </Tabs>
                    </PanelBody>
                </Panel>
                <Panel>
                    <PanelHeader>SDK调用示例</PanelHeader>
                    <PanelBody>
                        <Tabs size="small">
                            <Tabs.TabPane tab="Java示例" key="1">
                                <SyntaxHighlighter language='java' style={xcode}>{javaDemo}</SyntaxHighlighter>
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="C#示例" key="2">
                                <SyntaxHighlighter language='csharp' style={xcode}>{csharpDemo}</SyntaxHighlighter>
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="PHP示例" key="3">
                                <SyntaxHighlighter language='php' style={xcode}>{phpDemo}</SyntaxHighlighter>
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="Python示例" key="4">
                                <SyntaxHighlighter language='python' style={xcode}>{pythonDemo}</SyntaxHighlighter>
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="NodeJS示例" key="5">
                                <SyntaxHighlighter language='javascript' style={xcode}>{nodejsDemo}</SyntaxHighlighter>
                            </Tabs.TabPane>
                        </Tabs>
                    </PanelBody>
                </Panel>
                <Panel >
                    <PanelHeader>请求参数</PanelHeader>
                    <PanelBody>
                        <Table showHeader={true} dataSource={this.state.apiParams} pagination={false} bordered >
                            <Column title='名称' dataIndex='paramName' key='paramName' width='10%' render={(text, param) => (
                                <span>{param.paramName}</span>
                            ) } />
                            <Column title='类型' dataIndex='paramType' key='paramType' width='20%' render={(text, param) => (
                                <span>
                                    {
                                        param.struct &&
                                        this.getTree(param.struct)
                                    }
                                    {
                                        !param.struct &&
                                        <span>{param.paramType}</span>
                                    }
                                </span>
                            ) } />
                            <Column title='默认值' dataIndex='defaultValue' key='defaultValue' width='10%' render={(text, param) => (
                                <span>{param.defaultValue}</span>
                            ) } />
                            <Column title='示例' dataIndex='example' key='example' width='10%' render={(text, param) => (
                                <span>{param.example}</span>
                            ) } />
                            <Column title='描述' dataIndex='desc' key='desc' width='10%' render={(text, param) => (
                                <span>{param.describle}</span>
                            ) } />
                            <Column title='是否必须' dataIndex='isNeed' key='isNeed' width='8%' render={(text, param) => (
                                <span>{param.isRequired ? '是' : '否'}</span>
                            ) } />
                        </Table>
                    </PanelBody>
				</Panel>
				<Panel >
                    <PanelHeader>返回值</PanelHeader>
                    <PanelBody>
                        <Table showHeader={true} dataSource={this.state.docData.resultDTOs} pagination={false} bordered >
                            <Column title='名称' dataIndex='name' key='name' width='10%' render={(text, result) => (
                                <span>{result.name}</span>
                            ) } />
                            <Column title='类型' dataIndex='type' key='type' width='20%' render={(text, result) => (
                                <span>
                                    {
                                        result.isStruct &&
                                        this.getTree(result)
                                    }
                                    {
                                        !result.isStruct &&
                                        <span>{result.type}</span>
                                    }
                                </span>
                            ) } />
                            <Column title='默认值' dataIndex='defaultValue' key='defaultValue' width='10%' render={(text, result) => (
                                <span>{result.defaultValue}</span>
                            ) } />
                            <Column title='示例' dataIndex='example' key='example' width='10%' render={(text, result) => (
                                <span>{result.example}</span>
                            ) } />
                            <Column title='描述' dataIndex='desc' key='desc' width='10%' render={(text, result) => (
                                <span>{result.desc}</span>
                            ) } />
                            <Column title='是否必须' dataIndex='isNeed' key='isNeed' width='8%' render={(text, result) => (
                                <span>{result.isNeed ? '是' : '否'}</span>
                            ) } />
                        </Table>
                    </PanelBody>
				</Panel>
			    <Panel >
                    <PanelHeader>正确响应</PanelHeader>
                    <PanelBody>
                        <SyntaxHighlighter language='json' style={xcode}>{this.state.docData.successResponse ? this.state.docData.successResponse : ''}</SyntaxHighlighter>
                    </PanelBody>
                </Panel>
                <Panel >
                    <PanelHeader>错误响应</PanelHeader>
                    <PanelBody>
                        <SyntaxHighlighter language='json' style={xcode}>{this.state.docData.errorResponse ? this.state.docData.errorResponse : ''}</SyntaxHighlighter>
                    </PanelBody>
                </Panel>
			    <Panel>
                    <PanelHeader>错误码</PanelHeader>
                    <PanelBody>
                        <Table showHeader={true} dataSource={this.state.docData.errorCodes} pagination={false} bordered >
                            <Column title='错误码' dataIndex='errorCode' key='errorCode' width='10%' render={(text, errorCode) => (
                                <span>{errorCode.errorCode}</span>
                            ) } />
                            <Column title='描述' dataIndex='errorDesc' key='errorDesc' width='10%' render={(text, errorCode) => (
                                <span>{errorCode.errorDesc}</span>
                            ) } />
                            <Column title='解决方法' dataIndex='solution' key='solution' width='10%' render={(text, errorCode) => (
                                <span>{errorCode.solution}</span>
                            ) } />
                        </Table>
                        <br />
                        <a href="http://doc.qima-inc.com/pages/viewpage.action?pageId=4857493" target="_blank" >卡门错误码列表</a>
                    </PanelBody>
			    </Panel>
			</div>
		);
	}

}
