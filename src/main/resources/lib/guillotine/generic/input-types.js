const graphQlLib = require('/lib/guillotine/graphql');

function createInputTypes(context) {
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

exports.createInputTypes = createInputTypes;