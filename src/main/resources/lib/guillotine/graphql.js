const graphQlLib = require('/lib/graphql');

for (var exportKey in graphQlLib) {
    exports[exportKey] = graphQlLib[exportKey];
}

exports.createObjectType = function (context, params) {
    const creationCallback = context.options && context.options.creationCallbacks && context.options.creationCallbacks[params.name];
    if (creationCallback) {
        creationCallback(context, params);
    }

    return context.schemaGenerator.createObjectType(params);
};
