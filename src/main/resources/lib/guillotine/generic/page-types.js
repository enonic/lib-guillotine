var contentLib = require('/lib/xp/content');
var portalLib = require('/lib/xp/portal');

var graphQlLib = require('../graphql');

exports.generateTypes = function (context) {

    context.types.componentTypeType = graphQlLib.createEnumType({
        name: context.uniqueName('ComponentType'),
        description: 'Component type.',
        values: {
            'page': 'page',
            'layout': 'layout',
            'image': 'image',
            'part': 'part',
            'text': 'text',
            'fragment': 'fragment'
        }
    });

    context.types.pageComponentDataType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('PageComponentData'),
        description: 'Page component data.',
        fields: {
            descriptor: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            },
            customized: {
                type: graphQlLib.GraphQLBoolean
            },
            configAsJson: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return JSON.stringify(env.source.config);
                }
            }

        }
    });

    context.types.layoutComponentDataType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('LayoutComponentData'),
        description: 'Layout component data.',
        fields: {
            descriptor: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            },
            configAsJson: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return JSON.stringify(env.source.config);
                }
            }

        }
    });

    context.types.partComponentDataType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('PartComponentData'),
        description: 'Part component data.',
        fields: {
            descriptor: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            },
            configAsJson: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return JSON.stringify(env.source.config);
                }
            }

        }
    });

    context.types.imageComponentDataType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('ImageComponentData'),
        description: 'Image component data.',
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

    context.types.textComponentDataType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('TextComponentData'),
        description: 'Text component data.',
        fields: {
            value: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            }
        }
    });

    context.types.fragmentComponentDataType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('FragmentComponentData'),
        description: 'Fragment component data.',
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

    context.types.componentType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('Component'),
        description: 'Component.',
        fields: {
            type: {
                type: graphQlLib.nonNull(context.types.componentTypeType)
            },
            path: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            },
            page: {
                type: context.types.pageComponentDataType
            },
            layout: {
                type: context.types.layoutComponentDataType
            },
            image: {
                type: context.types.imageComponentDataType
            },
            part: {
                type: context.types.partComponentDataType
            },
            text: {
                type: context.types.textComponentDataType
            },
            fragment: {
                type: context.types.fragmentComponentDataType
            }
        }
    });


    context.types.pageTemplateType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('PageTemplate'),
        description: 'Component.',
        fields: {
            automatic: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLBoolean)
            },
            template: {
                type: graphQlLib.reference('Content')
            }
        }
    });
};

function resolvePageTemplate(content) {
    if ('portal:page-template' === content.type) {
        return {
            automatic: false,
            template: content
        };
    }

    if (!content.page || Object.keys(content.page).length == 0) {
        const defaultPageTemplate = getDefaultPageTemplate(content)
        return defaultPageTemplate == null ? null : {
            automatic: true,
            template: defaultPageTemplate
        };
    }

    if (content.page && content.page.template) {
        const template = contentLib.get({key: content.page.template});
        return template == null ? null : {
            automatic: false,
            template: template
        };
    }

    return null;
}

function resolvePageTemplateId(content) {
    if ('portal:page-template' === content.type) {
        return content._id;
    }

    if (!content.page || Object.keys(content.page).length == 0) {
        const template = getDefaultPageTemplate(content);
        return template == null ? null : template._id;
    }

    if (content.page && content.page.template) {
        return content.page.template;
    }
}

function getDefaultPageTemplate(content) {
    const bean = __.newBean('com.enonic.lib.guillotine.GetDefaultPageTemplateBean');
    bean.siteId = portalLib.getSite()._id;
    bean.contentType = content.type;
    const template = bean.execute();
    return template == null ? null : __.toNativeObject(template);
}

exports.resolvePageTemplate = resolvePageTemplate;
exports.resolvePageTemplateId = resolvePageTemplateId;