import { createStore, combineReducers, applyMiddleware } from 'redux';
import 'whatwg-fetch';
var _ = require('lodash');
const uuidV1 = require('uuid/v1');

const initialState = { method: '0', auth: 'token', params: [] };

const test = (state = initialState, action) => {
    switch (action.type) {
        case 'TEST_RESET_STORE':
            return {
                method: '0', auth: 'token', params: [], url: ''
            }
        case 'TEST_SET_FIELD':
            state[action.field] = action.value;
            // 重新生成参数
            newParams = state.params;
            if (action.field == 'auth') {

                var paramName = 'access_token';
                var paramId = 'test_param';
                var paramValue = '';

                if (action.value != 'token') {
                    paramName = 'app_id';
                } else {
                    paramName = 'access_token';
                    paramValue = action.token;
                }

                newParams = [];
                for (var i=0; i<state.params.length; i++) {
                    const param = state.params[i];
                    if (param.name == 'access_token' || param.name == 'app_id') {
                        continue;
                    }
                    newParams.push(param);
                }

                newParams = [{id: 'test_param', 'name': paramName, 'value': ''}, ...newParams];
            }
            return {
                ...state,
                params: newParams
            }
        case 'TEST_ADD_PARAM':
            state.params.push({
                id: action.id,
                type: 'text'
            });
            return {
                ...state,
                ... {
                    params: [...state.params]
                }
            }
        case 'TEST_SET_PARAM':
            var newParams = state.params.map((item) => {
                if (item.id != action.id) {
                    return item;
                }
                item[action.col] = action.value;
                return item;
            });
            return {
                ...state,
                ... {
                    params: newParams
                }
            }
        case 'TEST_DELETE_PARAM':
            var newParams = state.params.filter((item) => item.id != action.id);
            return {
                ...state,
                ... {
                    params: [...newParams]
                }
            }
        case 'TEST_INIT_URL':
            const api = action.api;
            var newParams = api.params;
            if (typeof api.name != 'undefined') {
                const service = api.name.substring(0, api.name.lastIndexOf('.'));
                const action = api.name.substring(api.name.lastIndexOf('.') + 1, api.name.length);
                var auth = 'oauthentry';
                var paramName = 'access_token';
                var paramId = 'test_param';
                var paramValue = '';

                if (state.auth != 'token') {
                    auth = 'entry';
                    paramName = 'app_id';
                } else {
                    paramValue = action.token;
                }
                var found = false;
                for (var i=0; i<newParams.length; i++) {
                    if (newParams[i].name == paramName) {
                        found = true;
                        newParams[i].id = 'test_param';
                    } else {
                        newParams[i].id = uuidV1();
                    }
                    if (!newParams[i].type) {
                        newParams[i].type = newParams[i].name.indexOf('[]') >= 0 ? 'file' : 'text'
                    }
                }
                // 自动生成的参数不计入参数列表
                if (!found) {
                    newParams = [{id: 'test_param', 'name': paramName, 'value': '', type: 'text'}, ...newParams];
                }

                if (paramName == 'access_token') {
                    _.remove(newParams, p => {
                        return p.name == 'app_id';
                    });
                } else if (paramName == 'app_id') {
                    _.remove(newParams, p => {
                        return p.name == 'access_token';
                    });
                }

                state['url'] = 'http://carmen.youzan.com/api/' + auth + '/' + service + '/' + api.version + '/' + action;
            }
            return {
                ...state,
                params: [...newParams]
            }
        case 'TEST_SET_RESULT':
            state['isSuccess'] = action.isSuccess;
            state['result'] = action.result;
            return {
                ...state
            }
        default:
            return state;
    }
}

export default test;
