import { createStore, combineReducers, applyMiddleware } from 'redux';
import 'whatwg-fetch';
const uuidV1 = require('uuid/v1');
import { notification } from 'antd';

import inner from './api/inner';
import outer from './api/outer';
import test from './api/test';
import doc from './api/doc';
import pub from './api/pub';

const api = (state = { isCreated: false }, action) => {
    switch (action.type) {
        case 'ADD_API':
            
            return {
                ...state
            }
        case 'UPDATE_API':
            return state;
        case 'GET_API':
            return state;
        case 'DELETE_API':

            return state;
        case 'SEARCH_API':
            return state;
        default:
            return state;
    }
}

export {
    outer,
    inner,
    api,
    test,
    doc,
    pub
}