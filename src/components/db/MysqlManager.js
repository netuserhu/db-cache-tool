require('../../styles/ConnectionManager.css');
require('../../styles/MysqlManager.css');
import React, { Component } from 'react'
import {Layout, Menu, Icon, Button, Tabs, Input, Table} from 'antd';
import 'whatwg-fetch';
const {Header, Content, Footer, Sider} = Layout;
const {TabPane} = Tabs;
const { TextArea } = Input;


class MysqlManager extends Component {
   
  constructor(props) {
    super(props);
    var {id ,db, host, port, user, password, schema} = JSON.parse(this.props.params.data)
    this.state = {dbConnections:[],tables:[],result:[],id:id,db:db,host:host,port:port,user:user,password:password,schema:schema};
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
       this.setState({result:resp.data});
    });
  };

  clear = (e)=>{
    this.setState({commandText:''});
  }

  render() {
    let tableContent = this.state.tables.map(p=>{
       return <Menu.Item key={p}>{p}</Menu.Item>;
    });
    let resultContent = this.state.result.map((p,index)=>{
       let resultView;
       if(p.type=='query'){
           let columns = [];
           let items = p.data[0];
           for(let item in items){
              let tmp = {};
              tmp.title = item;
              tmp.dataIndex = item;
              tmp.key = item;
              tmp.width = 200;
              tmp.fixed='left';
              columns.push(tmp);
           }
           resultView = <Table scroll={{x:3000,y:1000}} dataSource={p.data} columns={columns} />;
       }else if(p.type=='execute'){
           resultView = <span>{p.data}</span>;
       }else{
           resultView = <span>{p.data}</span>;
       }
       let title = 'Command'+index;
       return <TabPane tab={title} key={title} >{resultView}</TabPane>;
    });
    let tabsContent = <Tabs defaultActiveKey="0">{resultContent}</Tabs>;
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
          
             {tabsContent}
          
        </Layout>
     </Layout> 
    );
  };
}
export default MysqlManager;


