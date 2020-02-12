const graphQlLib = require('/lib/guillotine/graphql');

function createEnumTypes(context) {
    context.types.urlTypeType = graphQlLib.createEnumType({
        name: context.uniqueName('UrlTypeType'),
        description: 'URL type type.',
        values: {
            'server': 'server',
            'absolute': 'absolute'
        }
    });
};

exports.createEnumTypes = createEnumTypes;