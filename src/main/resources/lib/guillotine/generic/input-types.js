const graphQlLib = require('/lib/guillotine/graphql');

exports.createInputTypes = function (context) {
    context.types.processHtmlType = graphQlLib.createInputObjectType({
        name: context.uniqueName('ProcessHtmlInputType'),
        description: 'Process HTML input type.',
        fields: {
            'type': {
                type: context.types.urlTypeType
            }
        }
    })
};