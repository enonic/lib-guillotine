const graphQlLib = require('/lib/guillotine/graphql');
const contentApiLib = require('/lib/guillotine/query/content-api');

function createRootQueryType(schemaGenerator, context) {
    return graphQlLib.createOutputObjectType(schemaGenerator, context, {
        name: context.uniqueName('Query'),
        fields: {
            guillotine: {
                type: contentApiLib.createContentApiType(schemaGenerator, context),
                resolve: function () {
                    return {};
                }
            }
        }
    });
}

exports.createRootQueryType = createRootQueryType;
