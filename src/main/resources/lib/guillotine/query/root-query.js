const graphQlLib = require('/lib/guillotine/graphql');
const contentApiLib = require('/lib/guillotine/query/content-api');

function createRootQueryType(context) {
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
}

exports.createRootQueryType = createRootQueryType;
