
let Store = null;

export function createStore(reducers) {
    Store = require('redux').createStore(reducers);
    return Store;
}

export function getStore() {
    return Store;
}