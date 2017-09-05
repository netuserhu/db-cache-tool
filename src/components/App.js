require('../styles/App.css');
import 'antd/dist/antd.css';
import 'nprogress/nprogress.css';
require('codemirror/lib/codemirror.css');
import { Menu, Icon, Layout, Breadcrumb, Row, Col, Modal, Button, Dropdown } from 'antd';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

import 'whatwg-fetch';
import NProgress from 'nprogress';
import React, { Component } from 'react'
import { Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
// import { Menu, Dropdown, Segment, Icon } from 'semantic-ui-react';
import Dashboard from './dashboard/Dashboard';
import APIList from './api/list/List';
import fetchIntercept from 'fetch-intercept';
import { notification } from 'antd';
import { getStore } from '../util/globalStore';
var _ = require('lodash');
import {connect} from 'react-redux';
const { Header, Content, Footer } = Layout;

const unregister = fetchIntercept.register({
    request: function (url, config) {
        // Modify the url or config here
        if (typeof config == 'undefined' || typeof config.headers == 'undefined') {
          config = {
            ...config,
            headers: {}
          };
        }
        if (!config.headers['Content-Type']) {
          config.headers['Content-Type'] = 'application/json';
        } else {
          delete config.headers['Content-Type'];
        }
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        config['credentials'] = 'include';
        NProgress.start();
        var store = getStore();
        store.dispatch({type: 'SET_FIELD', col: 'loading', value: true});
        return [url, config];
    },

    requestError: function (error) {
        NProgress.done();
        var store = getStore();
        store.dispatch({type: 'SET_FIELD', col: 'loading', value: false});
        // Called when an error occured during another 'request' interceptor call
        return Promise.reject(error);
    },

    response: function (response) {
        // Modify the response object
        NProgress.done();
        var store = getStore();
        store.dispatch({type: 'SET_FIELD', col: 'loading', value: false});
        if (response.status != 200) {
          notification.error({
            message: '服务器错误',
            description: '错误码: ' + response.status,
          });
          return Promise.reject(response.status);
        }
        return new Promise((resolve, reject) => {
          response.json().then(resp => {
            const data = resp;
            if (data.code == '200000') {
              store.dispatch({type: 'SESSION_TIMEOUT', data: JSON.parse(data.data)});
              window.crosstab.on('sessionReconnect', function(message) {
                  store.dispatch({type: 'SESSION_RECONNECTED'});
                  window.location.reload();
              });
              return reject();
            }
            if (data.code != '000000') {
              notification.error({
                message: data.message,
                description: '错误码: ' + data.code,
              });
              return reject();
            }
            resolve(data);
          })
        });
    },

    responseError: function (error) {
        // Handle an fetch error
        NProgress.done();
        var store = getStore();
        store.dispatch({type: 'SET_FIELD', col: 'loading', value: false});
        return Promise.reject(error);
    }
});

class App extends React.Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }

  constructor(props) {
  	super(props);
  	this.state = { activeItem: '首页', current: '/api/list', user: {aliasName: '', realName: ''}, sidebarMenu: {} };
  }

  componentDidMount() {
  	//var currentRouteName = this.context.router.getCurrentPathname();
  	console.log(this.context.router.location.pathname);
  	var path = this.context.router.location.pathname;
  	if (path.indexOf('dashboard') >= 0) {
  		this.setState({activeItem : '首页'});
  	} else if (path.indexOf('api') >= 0) {
  		this.setState({activeItem : 'API列表'});
  	}
    fetch('/web/user/self').then((resp) => {
      this.setState({'user': resp.data});
      this.props.onSetField('user', resp.data);
    });

  }

  componentWillReceiveProps(nextProps) {
    const path = nextProps.location.pathname;
    this.setState({current: ''});
    this.setState({sidebarMenu: {}});
    if (path.indexOf('admin') >= 0) {
      this.state.sidebarMenu.current = path;

      this.setState({sidebarMenu: this.state.sidebarMenu});
    } else {
      this.setState({current: path});
    }
  }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  onUserMenuClick(e) {
    if (e.key == 'user:profile') {
      window.open('http://cas.qima-inc.com/', '_blank');
    } else if (e.key == 'user:logout') {
      fetch('/web/user/self/logout').then((resp) => {
        window.location.reload();
      });
    }
  }

  handleSessionTimeout() {
    const data = this.props.app.data;
    window.open(data.location + window.location.origin + '/session-callback', '_blank');
  }

  onSidebarMenuClick(e) {
    this.state.sidebarMenu.current = e.key;
    this.context.router.push(e.key)
  }

  onMainMenuClick(e) {

  }

  render() {
    const { activeItem } = this.state;
    const userGroup = this.state.user.userGroup;

    return (
        <Layout className="layout">
          <Header>
            <Row >
              <Col md={2} style={{marginLeft: '22px', marginRight: '10px'}}>
                <Icon type="like" style={{fontSize: '15px', color: '#00c1de', lineHeight: '1.9'}} /> &nbsp;&nbsp;
                <span style={{fontSize: '15px', color: '#fff', lineHeight: '1.5'}}>有赞 · 卡门</span>
              </Col>
              <Col md={20}>
                <Menu
                  theme='dark'
                  onClick={ e=> { this.setState({current: e.key}); } }
                  selectedKeys={[this.state.current]}
                  mode="horizontal"
                  style={{ lineHeight: '64px', backgroundColor: '#373d41' }}
                >

                  <Menu.Item key="/api/list">
                    <a href="/#/api/list" rel="noopener noreferrer"><Icon type="appstore" />API列表</a>
                  </Menu.Item>
                  <Menu.Item key="/publish/list">
                    <a href="/#/publish/list" rel="noopener noreferrer"><Icon type="bars" />发布列表</a>
                  </Menu.Item>
                  {
                    (this.state.user.env == 'pre' || this.state.user.env == 'prod') &&
                    <Menu.Item key="/review/list">
                      <a href="/#/review/list" rel="noopener noreferrer"><Icon type="menu-unfold" />审核列表</a>
                    </Menu.Item>
                  }
                  <Menu.Item key="/doc">
                    <a href="http://gitlab.qima-inc.com/open-platform/carmen-console-ng-doc/wikis/home" target="_blank" rel="noopener noreferrer"><Icon type="question-circle-o" />帮助</a>
                  </Menu.Item>
                  <Menu.Item key='/env'>
                    <Dropdown overlay={
                      <Menu>
                        <Menu.Item>
                          <a href="http://carmen-console-ng-qa.s.qima-inc.com" target="_blank" rel="noopener noreferrer">测试环境(qa)</a>
                        </Menu.Item>
                        <Menu.Item>
                          <a href="http://carmen-console-multi-pre.s.qima-inc.com" target="_blank" rel="noopener noreferrer">预发环境(pre)</a>
                        </Menu.Item>
                        <Menu.Item>
                          <a href="http://carmen-console-ng.s.qima-inc.com" target="_blank" rel="noopener noreferrer">生产环境(prod)</a>
                        </Menu.Item>
                      </Menu>
                    }>
                      <a className="ant-dropdown-link" href="javascript:void(0);">
                          <Icon type="rocket" />环境切换 <Icon type="down" />
                        </a>
                    </Dropdown>
                  </Menu.Item>
                  <Menu.Item key='/tool'>
                    <Dropdown overlay={
                      <Menu>
                        <Menu.Item>
                          <a href="/#/tool/token" rel="noopener noreferrer">token查询</a>
                        </Menu.Item>
                      </Menu>
                    }>
                      <a className="ant-dropdown-link" href="javascript:void(0);">
                          <Icon type="tool" />自查工具 <Icon type="down" />
                        </a>
                    </Dropdown>
                  </Menu.Item>
                  <Menu.Item key="/document/list">
                    <a href="/#/document/list" rel="noopener noreferrer"><Icon type="file" />文档中心</a>
                  </Menu.Item>
                </Menu>
              </Col>
              <Col md={1}>
                <Menu
                  theme='dark'
                  onClick={e=>{this.onUserMenuClick(e)}}
                  mode="horizontal"
                  style={{ lineHeight: '64px', float: 'right', marginRight: '0px', backgroundColor: '#373d41' }}
                >
                  <SubMenu title={<span><Icon type="user" />{this.state.user.aliasName}({this.state.user.realName}) - ({this.state.user.env}环境)</span>} className={'user-info'}>
                    <Menu.Item key="user:profile" >用户信息</Menu.Item>
                    <Menu.Item key="user:logout"  >退出登录</Menu.Item>
                  </SubMenu>
                </Menu>
              </Col>
            </Row>
          </Header>
          <Content style={{ padding: '0 0px' }}>
            {
              this.context.router.location.pathname.indexOf('admin') < 0 &&
              <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
                {this.props.children}
              </div>
            }
            {
              this.context.router.location.pathname.indexOf('admin') >= 0 &&
              <Row>
                <Col md={4} >
                  <Menu
                    theme={'dark'}
                    style={{ width: '100%', backgroundColor: '#373d41', minHeight: '600px' }}
                    defaultOpenKeys={['user', 'cache', 'freq', 'acl', 'resource', 'tool', 'review']}
                    mode="inline"
                    onClick={e=> { this.onSidebarMenuClick(e); }}
                    selectedKeys={[this.state.sidebarMenu.current]}
                  >
                  {
                    (userGroup == 0) &&
                    <Menu.SubMenu key="review" title={<span><Icon type="bars" /><span>API审核</span></span>}>
                      <Menu.Item key="/admin/review/list">审核列表</Menu.Item>
                    </Menu.SubMenu>
                  }
                  {
                    userGroup == 0 &&
                    <Menu.SubMenu key="user" title={<span><Icon type="user" /><span>用户管理</span></span>}>
                      <Menu.Item key="/admin/user/list">用户列表</Menu.Item>
                      <Menu.Item key="/admin/user/add">新增用户</Menu.Item>
                    </Menu.SubMenu>
                  }
                  {
                    (userGroup == 0 || userGroup == 1) &&
                    <Menu.SubMenu key="resource" title={<span><Icon type="appstore" /><span>常用工具</span></span>}>
                      <Menu.Item key="/admin/parentGroup/list">一级group管理</Menu.Item>
                      <Menu.Item key="/admin/group/list">二级group管理</Menu.Item>
                      <Menu.Item key="/admin/app/edit">app管理</Menu.Item>
                      <Menu.Item key="/admin/client/list">client管理</Menu.Item>
                      <Menu.Item key="/admin/token">token管理</Menu.Item>
                      <Menu.Item key="/admin/resource/edit">resource管理</Menu.Item>
                      <Menu.Item key="/admin/sdk/list">sdk管理</Menu.Item>
                    </Menu.SubMenu>
                  }
                  {
                    userGroup == 0 &&
                    <Menu.SubMenu key="tool" title={<span><Icon type="tool" /><span>运维工具</span></span>}>
                      <Menu.Item key="/admin/tool/misc">辅助工具</Menu.Item>
                      <Menu.Item key="/admin/tool/cache">缓存查看</Menu.Item>
                    </Menu.SubMenu>
                  }
                  {
                    userGroup == 0 &&
                    <Menu.SubMenu key="cache" title={<span><Icon type="barcode" /><span>缓存管理</span></span>}>
                      <Menu.Item key="/admin/cache/list">本地缓存列表</Menu.Item>
                      <Menu.Item key="/admin/cache/local">本地缓存管理</Menu.Item>
                      <Menu.Item key="/admin/cache/redis">redis缓存管理</Menu.Item>
                    </Menu.SubMenu>
                  }
                  {
                    userGroup == 0 &&
                    <Menu.SubMenu key="freq" title={<span><Icon type="bars" /><span>频控管理</span></span>}>
                      <Menu.Item key="/admin/freq/list">频控列表</Menu.Item>
                      <Menu.Item key="/admin/freq/add">增加频控</Menu.Item>
                    </Menu.SubMenu>
                  }
                  {
                    userGroup == 0 &&
                    <Menu.SubMenu key="acl" title={<span><Icon type="bell" /><span>访问控制</span></span>}>
                      <Menu.Item key="/admin/acl/list">ACL列表</Menu.Item>
                      <Menu.Item key="/admin/acl/add">增加ACL</Menu.Item>
                    </Menu.SubMenu>
                  }
                  </Menu>
                </Col>
                <Col md={20}>
                    <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
                      {this.props.children}
                    </div>
                </Col>
              </Row>
            }
          </Content>
          <Footer style={{ textAlign: 'center', backgroundColor: '#fff', color: 'rgba(0, 0, 0, 0.67)', fontSize: '13px' }}>
            <p>SaaS Team · ReactJS & antd</p>
            有赞·卡门控制台 carmen Copyright © 2015 - 2017 youzan.com
          </Footer>

          <Modal
              title="登录超时"
              style={{ top: 30 }}
              okText="添加"
              cancelText="取消"
              visible={this.props.app.sessionTimeout}
              width={700}
              onOk={() => this.setState({showType: false})}
              onCancel={() => this.setState({showType: false})}
              footer={<center><Button type="primary" className={'ant-btn ant-btn-primary'} onClick={e=>{e.preventDefault(); this.handleSessionTimeout(); }}>确定</Button> </center>}
            >
            <p>你的登录已超时，请重新登录</p>
          </Modal>
        </Layout>

    )
  }
}

// App.defaultProps = {
// };

App.contextTypes = {
  router: React.PropTypes.object.isRequired
}

const mapStateToProps = (state) => {
  return {
    app: state.app
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSetField: (row, val) => {
      dispatch({type: 'SET_FIELD', col: row, value: val});
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
