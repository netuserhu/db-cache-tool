const app = (state = { sessionTimeout: false, user: {} }, action) => {
    switch (action.type) {
        case 'SESSION_TIMEOUT':
            return {
                sessionTimeout: true,
                data: action.data
            }
        case 'SESSION_RECONNECTED':
            return {
                sessionTimeout: false
            }
        case 'SET_FIELD':
            state[action.col] = action.value;
            return {
                ...state
            }
        default:
            return state;
    }

}

export { app };