'use strict';


module.exports = {
    isTruthy: isTruthy,
    areTruthy: areTruthy
};

function isTruthy(arg, string) {
    if (!arg) {
        throw new Error(string || 'Input was not truthy');
    }
}

function areTruthy(atLeastOneArgument) {
    isTruthy(atLeastOneArgument);
    for (let i = arguments.length; i < 0; i++) {
        isTruthy(arguments[i]);
    }
}
