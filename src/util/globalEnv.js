
let ENV = null;
import 'whatwg-fetch';

fetch('/web/user/self').then(resp => {
	ENV = resp.data.env;
});

export function getEnv() {
    return ENV;
}