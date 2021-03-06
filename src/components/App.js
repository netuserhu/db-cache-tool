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
import { notification } from 'antd';
import { getStore } from '../util/globalStore';
var _ = require('lodash');
import {connect} from 'react-redux';
const { Header, Content, Footer } = Layout;
import ConnectionManager from './db/ConnectionManager'
import fetchIntercept from 'fetch-intercept';
var URL = require('url');
const unregister = fetchIntercept.register({
    request: function(url, config){
      if (typeof config == 'undefined' || typeof config.headers == 'undefined') {
          config = {
            ...config,
            headers: {}
          };
      }
      let location = window.location.href;
      let params = URL.parse(location,true).query;
      config['credentials'] = 'include';
      let code = params.code;
      if(code){
        config.headers["x-auth-code"] = code;
      }
      return [url , config];
    },
    response: function (response) {
       let status = response.status;
       if(401 == status){
         response.json().then(res=>{
             let callback =  window.location.href;
             window.location.href=res.location;
         });
       }
       if(500 == status){
         response.json().then(res=>{
            let error = res.msg;
            alert(error);
         })
       }
       return response;
    }
});

class App extends React.Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }

  constructor(props) {
  	super(props);
  	this.state = { activeItem: '首页', current: '/db/list', user: {aliasName: '', realName: ''}, sidebarMenu: {} };
  }

  componentDidMount() {
  	//var currentRouteName = this.context.router.getCurrentPathname();
  	console.log(this.context.router.location.pathname);
  	var path = this.context.router.location.pathname;
  	if (path.indexOf('dashboard') >= 0) {
  		
  	} else if (path.indexOf('api') >= 0) {
  		this.setState({activeItem : 'DB管理'});
  	}
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


  render() {
    const { activeItem } = this.state;
    const userGroup = this.state.user.userGroup;

    return (
        <Layout className="layout">
          <Header>
            <Row>
              <Col md={2} style={{marginLeft: '22px', marginRight: '10px'}}>
                <Icon type="like" style={{fontSize: '15px', color: '#00c1de', lineHeight: '1.9'}} /> &nbsp;&nbsp;
                <span style={{fontSize: '15px', color: '#fff', lineHeight: '1.5'}}>数据库缓存工具</span>
              </Col>
              <Col md={20}>
                <Menu
                  theme='dark'
                  onClick={ e=> { this.setState({current: e.key}); } }
                  selectedKeys={[this.state.current]}
                  mode="horizontal"
                  style={{ lineHeight: '64px', backgroundColor: '#373d41' }}
                >
                  <Menu.Item key="/db/list">
                    <a href="/#/db/list" rel="noopener noreferrer"><Icon type="appstore" />DB管理</a>
                  </Menu.Item>
                  <Menu.Item key="/redis/list">
                    <a href="/#/redis/list" rel="noopener noreferrer"><Icon type="bars" />Redis列表</a>
                  </Menu.Item>
                  <Menu.Item key="/tool/compare">
                    <a href="/#/document/list" rel="noopener noreferrer"><Icon type="file" />对比工具</a>
                  </Menu.Item>
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
          </Content>
          <Footer style={{ textAlign: 'center', backgroundColor: '#fff', color: 'rgba(0, 0, 0, 0.67)', fontSize: '13px' }}>
            <p>SaaS Team · ReactJS & antd</p>
            有赞·数据库缓存工具
          </Footer>

        </Layout>

    )
  }
}


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
