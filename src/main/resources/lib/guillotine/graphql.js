const graphQlLib = require('/lib/graphql');

for (var exportKey in graphQlLib) {
    exports[exportKey] = graphQlLib[exportKey];
}

function executeCreationCallbackIfExists(context, objectTypeName, params) {
    const creationCallback = context.options && context.options.creationCallbacks &&
                             context.options.creationCallbacks[objectTypeName];
    if (creationCallback) {
        creationCallback(context, params);
    }
}

exports.createContentObjectType = function (context, params) {
    executeCreationCallbackIfExists(context, context.types.contentType.name, params);
    executeCreationCallbackIfExists(context, params.name, params);

    return context.schemaGenerator.createObjectType(params);
};

exports.createObjectType = function (context, params) {
    executeCreationCallbackIfExists(context, params.name, params);

    return context.schemaGenerator.createObjectType(params);
};

exports.createInterfaceType = function (context, params) {
    executeCreationCallbackIfExists(context, params.name, params);

    return context.schemaGenerator.createInterfaceType(params);
};
