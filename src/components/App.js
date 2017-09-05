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



  render() {
    const { activeItem } = this.state;
    const userGroup = this.state.user.userGroup;

    return (
        <Layout className="layout">
          <Header>
            <Row >
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
                  <Menu.Item key="/api/list">
                    <a href="/#/api/list" rel="noopener noreferrer"><Icon type="appstore" />DB管理</a>
                  </Menu.Item>
                  <Menu.Item key="/publish/list">
                    <a href="/#/publish/list" rel="noopener noreferrer"><Icon type="bars" />Redis列表</a>
                  </Menu.Item>
                  <Menu.Item key="/document/list">
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
