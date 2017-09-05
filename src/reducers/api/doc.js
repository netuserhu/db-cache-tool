import { createStore, combineReducers, applyMiddleware } from 'redux';
import 'whatwg-fetch';
const uuidV1 = require('uuid/v1');

const initialState = { resultParams: [], errorCodes: [] };

const doc = (state = initialState, action) => {
    switch (action.type) {
        case 'DOC_RESET_STORE':
            return {
                ...initialState
            }
        case 'DOC_ADD_RESULT':
            state.resultParams.push({
                id: action.id,
                isNeed: true
            });
            return {
                ...state,
                ... {
                    resultParams: [...state.resultParams]
                }
            }
            return state;
        case 'DOC_DELETE_RESULT':
            var newParams = state.resultParams.filter((item) => item.id != action.id);
            return {
                ...state,
                ... {
                    resultParams: [...newParams]
                }
            }
            return state;
        case 'DOC_SET_RESULT':
            var newParams = state.resultParams.map((item) => {
                if (item.id != action.id) {
                    return item;
                }
                item[action.col] = action.value;
                return item;
            });
            return {
                ...state,
                ... {
                    resultParams: newParams
                }
            }
            return state;
        case 'DOC_ADD_ERROR':
            state.errorCodes.push({
                id: action.id
            });
            return {
                ...state,
                ... {
                    errorCodes: [...state.errorCodes]
                }
            }
            return state;
        case 'DOC_DELETE_ERROR':
            var newParams = state.errorCodes.filter((item) => item.id != action.id);
            return {
                ...state,
                ... {
                    errorCodes: [...newParams]
                }
            }
            return state;
        case 'DOC_SET_ERROR':
            var newParams = state.errorCodes.map((item) => {
                if (item.id != action.id) {
                    return item;
                }
                item[action.col] = action.value;
                return item;
            });
            return {
                ...state,
                ... {
                    errorCodes: newParams
                }
            }
            return state;
        case 'DOC_SET_FIELD':
            state[action.field] = action.value;
            return {
                ...state
            }
            return state;
        case 'DOC_RESTORE':
            const doc = action.doc;

            var newState = {
                id: doc.id,
                successResponse: doc.successResponse,
                errorResponse: doc.errorResponse,
                resultParams: [],
                errorCodes: []
            }

            if (doc.demos) {
                doc.demos.map(requestDemo => {
                    if (requestDemo.lang == 'java') {
                        newState.javaDemo = requestDemo.code;
                    } else if (requestDemo.lang == 'php') {
                        newState.phpDemo = requestDemo.code;
                    } else if (requestDemo.lang == 'csharp') {
                        newState.csharpDemo = requestDemo.code;
                    } else if (requestDemo.lang == 'nodejs') {
                        newState.nodejsDemo = requestDemo.code;
                    } else if (requestDemo.lang == 'python') {
                        newState.pythonDemo = requestDemo.code;
                    }
                });
            }
            if (doc.results) {
                var resultParams = [];
                doc.results.map(result => {
                    resultParams.push({
                        id: uuidV1(),
                        name: result.name,
                        type: result.type,
                        desc: result.desc,
                        defaultValue: result.defaultValue,
                        example: result.example,
                        isNeed: result.isNeed == 'true'
                    });
                });
                newState.resultParams = resultParams;
            }
            if (doc.errorCodes) {
                var errorCodes = [];
                doc.errorCodes.map(error => {
                    errorCodes.push({
                        id: uuidV1(),
                        name: error.errorCode,
                        desc: error.errorDesc,
                        solution: error.solution
                    });
                });
                newState.errorCodes = errorCodes;
            }
            
            return newState;
        default:
            return state;
    }
}

export default doc;