require('../../styles/ConnectionManager.css');
import React, { Component } from 'react'
import {Layout, Menu, Icon, Button} from 'antd';
const {Header, Content, Footer, Sider} = Layout;


class ConnectionManager extends Component {
   
  constructor(props) {
    super(props);
    this.state = {dbConnections:[]}
  }

  componentWillMount(){
    fetch('/db/getConnection').then((resp) => {
      debugger;
       alert(resp)
       alert(JSON.stringify(resp))
       //this.setState({dbConnections:JSON.parse(resp)});
    });
  }

  render() {
    let menuContent = this.state.dbConnections.map(p=>{
       return <Menu.Item key={p.connectionName}>
              <Icon type="user" />
              <span className="nav-text">p.connectionName</span>
            </Menu.Item>;
    });
    return (
     <Layout>
        <Sider
          width="300" >
          <div className="logo" />
          <div style={{width:"50px",height:"31px",float:"left","margin":"16px 0px 0px 10px"}}>
             <Button type="primary"><Icon type="plus" style={{fontSize:18,color:'#fff'}}/></Button>
          </div>
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['4']}>
            {menuContent}
          </Menu>
        </Sider>
        <Layout>
          <Header style={{
            background: '#fff',
            padding: 0
          }} />
          <Content style={{
            margin: '24px 16px 0'
          }}>
          <div style={{
            padding: 24,
            background: '#fff',
            minHeight: 360
          }}>
              content
          </div>
          </Content>
          <Footer style={{
            textAlign: 'center'
          }}>
            Ant Design ©2016 Created by Ant UED
          </Footer>
        </Layout>
     </Layout> 
    );
  };
}
export default ConnectionManager;


