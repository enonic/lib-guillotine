const graphQlLib = require('/lib/guillotine/graphql');

exports.createEnumTypes = function (context) {
    context.types.urlTypeType = graphQlLib.createEnumType({
        name: context.uniqueName('UrlTypeType'),
        description: 'URL type type.',
        values: {
            'server': 'server',
            'absolute': 'absolute'
        }
    });
};