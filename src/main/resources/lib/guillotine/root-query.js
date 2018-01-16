var graphQlLib = require('/lib/graphql');

var contentApiLib = require('./content-api');

exports.createRootQueryType = function (context) {
    return graphQlLib.createObjectType({
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