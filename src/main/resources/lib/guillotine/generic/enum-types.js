const graphQlLib = require('/lib/guillotine/graphql');

function createEnumTypes(context) {
    context.types.urlType = graphQlLib.createEnumType({
        name: context.uniqueName('UrlType'),
        description: 'URL type.',
        values: {
            'server': 'server',
            'absolute': 'absolute'
        }
    });
};

exports.createEnumTypes = createEnumTypes;
