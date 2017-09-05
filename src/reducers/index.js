import { createStore, combineReducers, applyMiddleware } from 'redux';
import 'whatwg-fetch';

import {app} from './app'

const reducer = combineReducers({app });

export default reducer;