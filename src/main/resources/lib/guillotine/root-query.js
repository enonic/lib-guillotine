var graphQlLib = require('./graphql');
var contentApiLib = require('./content-api');

exports.createRootQueryType = function (context) {
    return graphQlLib.createObjectType(context, {
        name: context.uniqueName('Query'),
        fields: {
            guillotine: {
                type: contentApiLib.createContentApiType(context),
                resolve: function () {
                    return {};
                }
            }
        }
    });
};