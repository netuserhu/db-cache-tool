import { createStore, combineReducers, applyMiddleware } from 'redux';
import 'whatwg-fetch';
const uuidV1 = require('uuid/v1');

const initialState = () => {
    return { auth: 'all', version: '1.0.0', owners: [], isOuter: false, isLogin: false, params: [], transResult: '1', resultFormat: '1', enableLog: '0', httpMethod: '0', httpMethodName: 'GET'};
}

const outer = (state = initialState(), action) => {
    switch (action.type) {
        case 'OUTER_RESET_STORE':
            return initialState();
        case 'OUTER_SET_FIELD':
            state[action.field] = action.value;
            return {
                ...state
            }
        case 'OUTER_ADD_PARAM':
            state.params.push({
                id: action.id
            });
            return {
                ...state,
                ... {
                    params: [...state.params]
                }
            }
        case 'OUTER_SET_PARAM':
            var newParams = state.params.map((item) => {
                if (item.id != action.id) {
                    return item;
                }
                if (action.col == 'type' && action.value == 'file') {
                    var name = item['name'];
                    if (!name) {
                        name = '';
                    }
                    item['name'] = name + '[]';
                    item[action.col] = action.value;
                } else if (action.col == 'name' && item['type'] == 'file') {
                    var name = action.value;
                    if (!name) {
                        name = '';
                    }
                    name = name.replace(/\[/g, '');
                    name = name.replace(/\]/g, '');
                    if (name) {
                        item['name'] = name + '[]';
                    } else {
                        item['name'] = name;
                    }
                } else {
                    item[action.col] = action.value;
                }
                
                return item;
            });
            return {
                ...state,
                ... {
                    params: newParams
                }
            }
        case 'OUTER_DELETE_PARAM':
            var newParams = state.params.filter((item) => item.id != action.id);
            return {
                ...state,
                ... {
                    params: [...newParams]
                }
            }
        case 'OUTER_RESTORE':
            const api = action.api.carmenApi;
            const params = action.api.carmenApiParams;
            var newState = {
                name: api.namespace + '.' + api.name,
                version: api.version,
                group: api.apiGroup,
                isOuter: api.enableInnerOuter == 1,
                isLogin: api.sessionFlag == 1,
                desc: api.apiDesc,
                scenarios: api.apiScenarios,
                httpMethod: api.requestType,
                transResult: api.transResult.toString(),
                resultFormat: api.resultFormat.toString(),
                enableLog: api.enableLog.toString(),
                owners: [],
                params: []
            }
            if (api.authType == 1) {
                newState.auth = 'all';
            } else if (api.authType == 2) {
                newState.auth = 'token';
            } else if (api.authType == 3) {
                newState.auth = 'sign';
            }

            if (newState.httpMethod == '0') {
                newState.httpMethodName = 'GET';
            } else {
                newState.httpMethodName = 'POST';
            }

            if (action.api.ownerUsers) {
                action.api.ownerUsers.map(user => {
                    newState.owners.push({
                        key: user.userName,
                        label: user.realName
                    });
                })
            }

            if (params) {
                for (var i=0; i<params.length; i++) {
                    const param = params[i];
                    newState.params.push({
                        id: uuidV1(),
                        name: param.paramName,
                        type: param.paramType,
                        isRequired: param.isRequired == 1,
                        defaultValue: param.defaultValue,
                        desc: param.describle,
                        struct: param.struct,
                        example: param.example
                    })
                }
            }

            return newState;
        default:
            return state;
    }
}

export default outer;