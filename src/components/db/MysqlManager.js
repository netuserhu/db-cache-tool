require('../../styles/ConnectionManager.css');
require('../../styles/MysqlManager.css');
import React, { Component } from 'react'
import {Layout, Menu, Icon, Button, Tabs, Input} from 'antd';
import 'whatwg-fetch';
const {Header, Content, Footer, Sider} = Layout;
const {TabPane} = Tabs;
const { TextArea } = Input;


class MysqlManager extends Component {
   
  constructor(props) {
    super(props);
    var {id ,db, host, port, user, password, schema} = JSON.parse(this.props.params.data)
    this.state = {dbConnections:[],tables:[],id:id,db:db,host:host,port:port,user:user,password:password,schema:schema};
  }

  componentWillMount(){
    
    /**
     TODO 
     1. 读取数据库有的所有schema
     2. 读取schema对应的表数据
    */
    fetch('/db/schema/list/'+this.state.id).then(resp=>resp.json()).then(resp=>{
        
    });
    fetch('/db/table/list/'+this.state.id+'/'+this.state.schema).then(resp=>resp.json()).then(resp=>{
        let tables = resp.data;
        this.setState({tables:tables});
    });
  }

  executeCommand = (e)=>{
    let commands = this.state.commandText;
    fetch('/db/command',{
      method:"post",
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body:JSON.stringify({
        id: this.state.id,
        schema: this.state.schema,
        commands: commands
      })
    }).then(resp=>resp.json()).then(resp=>{
       
    });
  };

  clear = (e)=>{
    this.setState({commandText:''});
  }

  render() {
    let tableContent = this.state.tables.map(p=>{
       return <Menu.Item key={p}>{p}</Menu.Item>;
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
             {tableContent}
          </Menu>
        </Sider>
        <Layout>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Command 1" key="1">
               <TextArea value={this.state.commandText} placeholder="Please input your command" rows={20} onChange={e=>{this.setState({commandText:e.target.value})}}>
               </TextArea>
               <Button type="primary" onClick={this.executeCommand}>执行</Button>
               <Button type="primary" onClick={this.clear}>清空</Button>
            </TabPane>
          </Tabs>
          <div className="tab-container">
            
          </div>
        </Layout>
     </Layout> 
    );
  };
}
export default MysqlManager;


