require('../../styles/ConnectionManager.css');
import React, { Component} from 'react';
import {Link} from 'react-router';
import {Layout, Menu, Icon, Button, Row, Col, Modal} from 'antd';
const {Header, Content, Footer, Sider} = Layout;
import ConnectionForm from './ConnectionForm';

class ConnectionManager extends Component {
   
  constructor(props) {
    super(props);
    this.state = {dbConnections:[],access:[]}
  }

  componentWillMount(){
    fetch('/db/getConnection').then(response => response.json()).then(resp => { 
       this.setState({dbConnections:resp.data});
    });
    fetch('/db/getUserAccess').then(response=>response.json()).then(resp=>{
       this.setState({access:resp.data});
    });
  }
  
  /**
    es6中新加入了箭头函数=>，箭头函数除了方便之外还有而一个特征就是将函数的this绑定到其定义时所在的上下文。
  */ 
  showNewConnectionWin = ()=>{
     this.refs.AddConnectionForm.showModal();
  };

  showEditConnection = (data)=>{
    this.refs.EditConnectionForm.setModel(data);
    this.refs.EditConnectionForm.showModal();
  };

  deleteConnection = (id)=>{
    fetch('/db/deleteConnection/'+id).then(response=>response.json()).then(resp=>{
       this.reloadData();
    });
  };
  
  addNewConnection = ()=>{
    this.reloadData();
  };

  updateConnection = ()=>{
    this.reloadData();
  };

  reloadData = ()=>{
    fetch('/db/getConnection').then(response => response.json()).then(resp => { 
       this.setState({dbConnections:resp.data});
    });
  };
  

  render() {
    let menuContent = this.state.dbConnections.map(p=>{
       let datainfo = {id:p.ID, host:p.HOST, port:p.PORT, user:p.USER_NAME, password:p.PASSWORD, schema: p.SCHEMA, connectionName: p.CONNECTION_NAME};
       let _datainfo = JSON.stringify(datainfo);
       let path = `/db/manager/${_datainfo}`;
       return <Menu.Item key={p.CONNECTION_NAME}>
                 <Icon type="database" />
                 <span className="nav-text">
                    <Link to={path}>{p.CONNECTION_NAME}</Link>
                 </span>
                 <Button shape="circle" style={{"margin-left":"10px"}} onClick={()=>{this.showEditConnection(datainfo)}}><Icon type="edit" /></Button>
                 <Button shape="circle" style={{"margin-left":"2px"}} onClick={()=>{this.deleteConnection(p.ID)}}><Icon type="delete" /></Button>
              </Menu.Item>;
    });
    
    let firstAccess,secondAccess;
    let firstContent,secondContent='';
    if(this.state.access.length>0){
      firstAccess = this.state.access.slice(0,3);
      firstContent = firstAccess.map(p=>{
       return <Col className="gutter-row" span={6}>
          <div className="gutter-box">
             <p>连接名:</p>
             <p>连接地址:</p>
             <p>端口:</p>
             <p>用户名:</p>
             <p>密码:</p>
             <p>上一次访问时间:</p>
          </div>
       </Col>;
      });
      firstContent = <Row gutter={16}>{firstContent}</Row>;
    }
    if(this.state.access.length>3){
      secondAccess = this.state.access.slice(3,6);
      secondContent = secondAccess.map(p=>{
       return <Col className="gutter-row" span={6}>
          <div className="gutter-box">
             <p>连接名:</p>
             <p>连接地址:</p>
             <p>端口:</p>
             <p>用户名:</p>
             <p>密码:</p>
             <p>上一次访问时间:</p>
          </div>
       </Col>;
      });
      secondContent = <Row gutter={16}>{secondContent}</Row>;
    }


    let accessContent = <div className="gutter-example">{firstContent}{secondContent}</div>;
    return (
     <Layout>
        <Sider
          width="300" >
          <div className="logo" />
          <div style={{width:"50px",height:"31px",float:"left","margin":"16px 0px 0px 10px"}}>
             <Button type="primary" onClick={this.showNewConnectionWin}><Icon type="plus" style={{fontSize:18,color:'#fff'}}/></Button>
          </div>
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['4']} style={{"min-height":800}}>
            {menuContent}
          </Menu>
        </Sider>
        <Layout>
          <Content>
              {accessContent}
          </Content>
          <ConnectionForm ref="AddConnectionForm" afterConnectionNew={this.addNewConnection} type="add" />
          <ConnectionForm ref="EditConnectionForm" afterConnectionUpdate={this.updateConnection} type="edit" />
        </Layout>
     </Layout> 
    );
  };
}
export default ConnectionManager;


