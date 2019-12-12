var contentLib = require('/lib/xp/content');

var graphQlLib = require('../graphql');

exports.generateTypes = function (context) {

    context.types.flatComponentTypeType = graphQlLib.createEnumType({
        name: context.uniqueName('FlatComponentType'),
        description: 'Flattened component type.',
        values: {
            'page': 'page',
            'layout': 'layout',
            'image': 'image',
            'part': 'part',
            'text': 'text',
            'fragment': 'fragment'
        }
    });

    context.types.flatPageComponentDataType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('FlatPageComponentData'),
        description: 'Flattened page component data.',
        fields: {
            descriptor: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            },
            customized: {
                type: graphQlLib.GraphQLBoolean
            },
            config: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return JSON.stringify(env.source.config);
                }
            }

        }
    });

    context.types.flatDescriptorBasedComponentDataType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('FlatDescriptorBasedComponentData'),
        description: 'Flattened descriptor-based component data.',
        fields: {
            descriptor: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            },
            config: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return JSON.stringify(env.source.config);
                }
            }

        }
    });

    context.types.flatImageComponentDataType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('FlatImageComponentData'),
        description: 'Flattened image component data.',
        fields: {
            id: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLID)
            },
            caption: {
                type: graphQlLib.GraphQLString
            },
            image: {
                type: graphQlLib.reference('media_Image'),
                resolve: function (env) {
                    return contentLib.get({key: env.source.id});
                }
            }

        }
    });

    context.types.flatTextComponentDataType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('FlatTextComponentData'),
        description: 'Flattened text component data.',
        fields: {
            value: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            }
        }
    });

    context.types.flatFragmentComponentDataType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('FlatFragmentComponentData'),
        description: 'Flattened fragment component data.',
        fields: {
            id: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLID)
            },
            fragment: {
                type: graphQlLib.reference('Content'),
                resolve: function (env) {
                    return contentLib.get({key: env.source.id});
                }
            }

        }
    });


    context.types.flatComponentType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('FlatComponent'),
        description: 'Flattened component.',
        fields: {
            type: {
                type: graphQlLib.nonNull(context.types.flatComponentTypeType)
            },
            path: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            },
            page: {
                type: context.types.flatPageComponentDataType
            },
            layout: {
                type: context.types.flatDescriptorBasedComponentDataType
            },
            image: {
                type: context.types.flatImageComponentDataType
            },
            part: {
                type: context.types.flatDescriptorBasedComponentDataType
            },
            text: {
                type: context.types.flatTextComponentDataType
            },
            fragment: {
                type: context.types.flatFragmentComponentDataType
            }

        }
    });
};