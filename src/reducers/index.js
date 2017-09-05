import { createStore, combineReducers, applyMiddleware } from 'redux';
import 'whatwg-fetch';
import {outer, inner, api, test, doc, pub} from './api'
import {app} from './app'

const reducer = combineReducers({ app, outer, inner, api, test, doc, pub });

export default reducer;