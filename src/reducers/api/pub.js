import { createStore, combineReducers, applyMiddleware } from 'redux';
import 'whatwg-fetch';
var _ = require('lodash');
const uuidV1 = require('uuid/v1');

const initialState = { showAddressUrl: true, showAddressSelect: true, addressUrl: '' };

const pub = (state = initialState, action) => {
    if (!state) {
        state = initialState;
    }

    switch (action.type) {
        case 'PUBLISH_RESET_STORE':
            return {
                ...initialState
            };
        case 'PUBLISH_SET_FIELD':
            state[action.field] = action.value;
            return {
                ...state
            }
        default:
            return state;
    }
}

export default pub;