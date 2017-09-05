import { createStore, combineReducers, applyMiddleware } from 'redux';
import 'whatwg-fetch';
import Constant from '../../constant/global';
const uuidV1 = require('uuid/v1');
var _ = require('lodash');

const findParamByTypeId = (state, typeId) => {
    const types = state.types;
    var type = null;
    for (var i = 0; i < types.length; i++) {
        if (types[i].value == typeId) {
            type = types[i];
            return type;
        }
    }
    return type;
}

const initialState = () => {
    const outerTypes = Constant.API_OUTER_JAVA_TYPE;
    var state = {
            protocol: 'dubbo',
            timeout: 5000,
            httpMethod: '0', 
            httpMethodName: 'GET',
            params: [],
            mappingParams: [],
            types: []
        }
        // 基础类型放进类型池
    for (var i = 0; i < outerTypes.length; i++) {
        state.types.push({
            ...outerTypes[i],
            isBasic: true
        });
    }
    return state;
}

const inner = (state, action) => {
    if (typeof state == 'undefined') {
        return initialState();
    }
    switch (action.type) {
        case 'INNER_CLEAR_PARAM':
            // 重建参数
            var outerTypes = Constant.API_OUTER_JAVA_TYPE;
            if (state.protocol != 'dubbo' && state.protocol != 'nova_java') {
                outerTypes = Constant.API_OUTER_TYPE;
            }
            var types = [];
            for (var i = 0; i < outerTypes.length; i++) {
                types.push({
                    ...outerTypes[i],
                    isBasic: true
                });
            }
            return {
                ...state,
                types: types,
                params: [],
                mappingParams: []
            }
        case 'INNER_RESET_STORE':
            return initialState();
        case 'INNER_INIT_PARAM':
            return state;
        case 'INNER_SET_FIELD':
            state[action.field] = action.value;
            return {
                ...state
            }
        case 'INNER_ADD_PARAM':
            state.params.push({
                id: action.id,
                isBasic: true,
                isExpand: true
            });
            for (var i = 0; i < state.params.length; i++) {
                state.params[i].order = i;
            }
            return {
                ...state,
                ... {
                    params: [...state.params]
                }
            }
        case 'INNER_ADD_MAPPING_PARAM':
            state.mappingParams.push({
                id: action.id,
                source: 'outer'
            })
            return {
                ...state,
                ... {
                    mappingParams: [...state.mappingParams]
                }
            }
        case 'INNER_SET_PARAM':
            var newParams = state.params.map((item) => {
                if (item.id != action.id) {
                    return item;
                }
                item[action.col] = action.value;
                // dubbo和nova_java才需要判断参数类型是否为复杂类型
                if (state.protocol == 'dubbo' || state.protocol == 'nova_java') {
                    if (action.col == 'type') {
                        const type = findParamByTypeId(state, action.value);
                        item.isBasic = type.isBasic;
                    }
                }
                return item;
            });
            return {
                ...state,
                ... {
                    params: newParams
                }
            }
        case 'INNER_SET_MAPPING_PARAM':
            var newParams = state.mappingParams.map((item) => {
                if (item.id != action.id) {
                    return item;
                }
                if (action.col == 'outerName' && typeof action.ext != 'undefined') {
                    const parent = action.ext;
                    const outerParams = parent.outer.params;
                    for (var i = 0; i < outerParams.length; i++) {
                        if (outerParams[i].name == action.value) {
                            item['outerType'] = outerParams[i].type;
                            break;
                        }
                    }
                }
                item[action.col] = action.value;
                return item;
            });
            return {
                ...state,
                ... {
                    mappingParams: [...newParams]
                }
            }
        case 'INNER_DELETE_PARAM':
            var newParams = state.params.filter((item) => item.id != action.id);
            return {
                ...state,
                ... {
                    params: [...newParams]
                }
            }
        case 'INNER_DELETE_MAPPING_PARAM':
            var newParams = state.mappingParams.filter((item) => item.id != action.id);
            return {
                ...state,
                ... {
                    mappingParams: [...newParams]
                }
            }
        case 'INNER_ADD_TYPE':
            state.types.push(action.newType);
            return {
                ...state,
                types: [...state.types]
            }
        case 'INNER_UPDATE_TYPE':
            for (var i=0; i<state.types.length; i++) {
                if (state.types[i].id == action.id) {
                    state.types[i] = action.newType;
                    break;
                }
            }
            return {
                ...state,
                types: [...state.types]
            }
        case 'INNER_DELETE_TYPE':
            var newTypes = state.types.filter((item) => item.id != action.id);
            return {
                ...state,
                ... {
                    types: [...newTypes]
                }
            }
        case 'INNER_REBUILD_MAPPING_PARAM':
            var params = state.params;

            const buildCascade = (param) => {
                // php不需要递归构建，直接返回数据
                if (state.protocol == 'php' || state.protocol == 'nova_php') {
                    return {
                        value: param.name,
                        label: param.name,
                        isBasic: true
                    }
                } else if (!param.type) {
                    return null;
                }
                var data = {
                    value: param.name,
                    label: param.name
                }
                var type = findParamByTypeId(state, param.type);
                if (state.protocol == 'php' || state.protocol == 'nova_php') {
                    type = {isBasic: true};
                } else {
                    data.type = type.value;
                }
                
                if (type.isBasic) {
                    data.isBasic = true;
                } else {
                    var children = [];
                    for (var i = 0; i < type.fields.length; i++) {
                        children.push(buildCascade(type.fields[i]));
                    }
                    data.children = children;
                    data.isBasic = false;
                }
                return data;
            }

            var dataSource = [];
            for (var i = 0; i < params.length; i++) {
                let param = params[i];
                if (!params[i].isExpand) {
                    dataSource.push({
                        value: param.name,
                        label: param.name,
                        type: param.type,
                        isBasic: true
                    });
                } else {
                    const cascade = buildCascade(param);
                    if (cascade != null) {
                        dataSource.push(cascade);
                    }
                }
            }

            const traceSource = (node, context, routes) => {
                context.push(node);
                if (node.isBasic) {
                    var paths = [];
                    context.map(ctx => {
                        paths.push(ctx.value);
                    });
                    routes.push({
                        'paths': paths,
                        type: node.type
                    });
                } else {
                    var children = node.children;
                    for (var i = 0; i < children.length; i++) {
                        const child = children[i];
                        traceSource(child, context, routes);
                    }
                }
                context.pop();
            }

            var routes = [];
            for (var i = 0; i < dataSource.length; i++) {
                var context = [];
                traceSource(dataSource[i], context, routes);
            }

            var resultParams = [];
            var mappingParams = state.mappingParams;
            for (var i = 0; i < routes.length; i++) {
                var type = findParamByTypeId(state, routes[i].type);
                if (!type) {
                    type = {text: routes[i].type};
                }
                var data = {
                    id: uuidV1(),
                    options: dataSource,
                    paths: routes[i].paths,
                    source: 'outer'
                };
                if (state.protocol == 'php' || state.protocol == 'nova_php') {
                } else {
                    data.type = type.text;
                }
                for (var j = 0; j < mappingParams.length; j++) {
                    if (_.join(mappingParams[j].paths) == _.join(routes[i].paths)) {
                        data.outerName = mappingParams[j].outerName;
                        data.outerType = mappingParams[j].outerType;
                        data.source = mappingParams[j].source;
                        break;
                    }
                }
                resultParams.push(data);
            }

            return {
                ...state,
                mappingParams: [...resultParams]
            }
        case 'INNER_RESTORE':
            const api = action.api.carmenApi;
            const serviceMethod = action.api.carmenServiceMethod;
            const serviceMethodParams = action.api.carmenServiceMethodParams;
            const structs = action.api.carmenStructs;
            const paramMappings = action.api.carmenParamMappings;
            var newState = {
                apiId: api.id,
                serviceMethodId: serviceMethod.id,
                methodMappingId: action.api.methodMappingId,
                url: api.addressUrl,
                timeout: api.timeout,
                httpMethod: api.requestType,
                appName: api.appName,
                types: [],
                isCreated: true,
                params: [],
                mappingParams: []
            }
            if (api.apiType == 1) {
                newState.protocol = 'dubbo';
                newState.service = serviceMethod.name;
                newState.method = serviceMethod.method;
            } else if (api.apiType == 2) {
                newState.protocol = 'php';
                newState.path = serviceMethod.name.replace(/\./g, '/') + '/' + serviceMethod.method.replace(/\./g, '/');
            } else if (api.apiType == 3) {
                newState.protocol = 'nova_java';
                newState.service = serviceMethod.name;
                newState.method = serviceMethod.method;
            } else if (api.apiType == 4) {
                newState.protocol = 'nova_php';
                newState.service = serviceMethod.name;
                newState.method = serviceMethod.method;
            }

            if (api.requestType == 1) {
                newState.httpMethodName = 'POST';
            } else {
                newState.httpMethodName = 'GET';
            }

            var outerTypes = Constant.API_OUTER_JAVA_TYPE;
            if (newState.protocol != 'dubbo' && newState.protocol != 'nova_java') {
                outerTypes = Constant.API_OUTER_TYPE;
            }
            for (var i = 0; i < outerTypes.length; i++) {
                newState.types.push({
                    ...outerTypes[i],
                    isBasic: true
                });
            }

            if (structs) {
                structs.map(s => {
                    var type = {
                        id: uuidV1(),
                        name: s.className,
                        value: s.className,
                        text: s.className,
                        fields: []
                    };
                    if (s.fields) {
                        s.fields.map(f => {
                            type.fields.push({
                                id: uuidV1(),
                                name: f.fieldName,
                                type: f.fieldType,
                                isBasic: f.isStructure == 1
                            })
                        })
                    }
                    newState.types.push(type);
                });
            }
            if (serviceMethodParams) {
                serviceMethodParams.map(serviceMethodParam => {
                    newState.params.push({
                        id: uuidV1(),
                        name: serviceMethodParam.paramName,
                        type: serviceMethodParam.paramType,
                        order: serviceMethodParam.sequence,
                        isBasic: serviceMethodParam.isStructure == 0,
                        isExpand: serviceMethodParam.isExpand == 0 ? false : true
                    })
                });
            }
            if (paramMappings) {
                const outerParams = action.api.carmenApiParams;
                const findOuterType = (paramName) => {
                    for (var i=0; i<outerParams.length; i++) {
                        if (outerParams[i].paramName == paramName) {
                            return outerParams[i].paramType;
                        }
                    }
                }

                const findInnerType = (paramName) => {
                    for (var i=0; i<newState.params.length; i++) {
                        if (newState.params[i].paramName == paramName) {
                            return newState.params[i].paramType;
                        }
                    }
                }

                paramMappings.map(paramMapping => {
                    if (newState.protocol == 'dubbo' || newState.protocol == 'nova_java') {
                        newState.mappingParams.push({
                            id: uuidV1(),
                            source: paramMapping.dataFrom == 1 ? 'outer' : 'inner',
                            type: paramMapping.fieldType,
                            paths: paramMapping.paths,
                            name: paramMapping.fieldName,
                            outerName: paramMapping.apiParamName,
                            outerType: findOuterType(paramMapping.apiParamName)
                        })
                    } else {
                        var paths = paramMapping.paths;
                        if (!paths) {
                            paths = [paramMapping.methodParamRef];
                        }
                        var name = paramMapping.fieldName;
                        var type = paramMapping.fieldType;
                        if (!name) {
                            name = paramMapping.methodParamRef;
                            type = findInnerType(name);
                        }

                        newState.mappingParams.push({
                            id: uuidV1(),
                            source: paramMapping.dataFrom == 1 ? 'outer' : 'inner',
                            type: type,
                            paths: paths,
                            name: name,
                            outerName: paramMapping.apiParamName,
                            outerType: findOuterType(paramMapping.apiParamName)
                        })
                    }
                })
            }

            return newState;
        default:
            return state;
    }
}

export default inner;