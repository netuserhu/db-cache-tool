require('../../styles/ConnectionManager.css');
import React, { Component } from 'react'
import {Layout, Menu, Icon, Button} from 'antd';
import 'whatwg-fetch';
const {Header, Content, Footer, Sider} = Layout;


class MysqlManager extends Component {
   
  constructor(props) {
    super(props);
    this.state = {dbConnections:[]}
  }

  componentWillMount(){
    var {id ,db, host, port, user, password, schema} = JSON.parse(this.props.params.data)
    /**
     TODO 
     1. 读取数据库有的所有schema
     2. 读取schema对应的表数据
    */
    fetch('/db/schema/list/'+id).then(resp=>resp.json()).then(resp=>{
        
    });
    fetch('/db/table/list/'+id+'/'+schema).then(resp=>resp.json()).then(resp=>{
        
    });
  }

  render() {
    return (
     <Layout>
        <Sider
          width="300" >
          <div className="logo" />
          <div style={{width:"50px",height:"31px",float:"left","margin":"16px 0px 0px 10px"}}>
             <Button type="primary"><Icon type="plus" style={{fontSize:18,color:'#fff'}}/></Button>
          </div>
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['4']}>
            
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
export default MysqlManager;


