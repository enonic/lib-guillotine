var graphQlLib = require('/lib/graphql');

for (var exportKey in graphQlLib) {
    exports[exportKey] = graphQlLib[exportKey];
}

exports.createObjectType = function (context, params) {
    var creationCallback = context.options.creationCallbacks && context.options.creationCallbacks[params.name];
    if (creationCallback) {
        creationCallback(context, params);
    }
    if (context.options.creationCallback) {
        context.options.creationCallback(context, params);
    }
    return graphQlLib.createObjectType(params);
};

