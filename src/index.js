window.crosstab = require("crosstab");
import 'core-js/fn/object/assign';
import React from 'react';
import ReactDOM from 'react-dom';
import {combineReducers, applyMiddleware} from 'redux';
import {Provider, connect} from 'react-redux';
import App from './components/App';
//import Dashboard from './components/dashboard/Dashboard';
import { Router, Route, Link, hashHistory, IndexRoute, Redirect, IndexRedirect } from 'react-router';
import reducers from './reducers';
import {createStore} from './util/globalStore';

import MysqlManager from './components/db/MysqlManager';


// Render the main component into the dom
ReactDOM.render(
  	<Provider store={createStore(reducers)}>
  		<Router history={hashHistory}  >
  			<Route path="/" component={App}>
			    <Route path="db">
			    	<Route path="manager" component={MysqlManager}>
				    </Route>
				    <IndexRedirect to="/db/manager" />
			    </Route>
			    <IndexRedirect to="/db/manager" />
		    </Route>
		</Router>
  	</Provider>
	, document.getElementById('app'));
