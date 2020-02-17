const graphQlLib = require('/lib/graphql');

function createObjectType(context, params) {
    const creationCallback = context.options.creationCallbacks && context.options.creationCallbacks[params.name];
    if (creationCallback) {
        creationCallback(context, params);
    }
    if (context.options.creationCallback) {
        context.options.creationCallback(context, params);
    }
    return graphQlLib.createObjectType(params);
}

for (var exportKey in graphQlLib) {
    exports[exportKey] = graphQlLib[exportKey];
}

exports.createObjectType = createObjectType;

