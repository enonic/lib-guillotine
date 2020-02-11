var contentLib = require('/lib/xp/content');
var contextLib = require('/lib/xp/context');
var nodeLib = require('/lib/xp/node');
var portalLib = require('/lib/xp/portal');

var graphQlLib = require('../graphql');
var namingLib = require('/lib/guillotine/util/naming');
var utilLib = require('/lib/guillotine/util/util');
var formLib = require('/lib/guillotine/dynamic/form');

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

    createPageComponentDataConfigType(context);

    context.types.pageComponentDataType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('PageComponentData'),
        description: 'Page component data.',
        fields: {
            descriptor: {
                type: graphQlLib.GraphQLString
            },
            customized: {
                type: graphQlLib.GraphQLBoolean
            },
            config: context.types.pageComponentDataConfigType && {
                type: context.types.pageComponentDataConfigType
            },
            configAsJson: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return JSON.stringify(env.source.config);
                }
            },
            template: {
                type: graphQlLib.reference('Content'),
                resolve: function (env) {
                    return env.source.template ? contentLib.get({key: env.source.template}) : null;
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
};

function createPageComponentDataConfigType(context) {
    const pageConfigFields = {};


    context.options.applications.forEach(applicationKey => {
        const bean = __.newBean('com.enonic.lib.guillotine.PageDescriptorServiceBean');
        const pageDescriptors = __.toNativeObject(bean.getByApplication(applicationKey));
        if (pageDescriptors.length > 0) {

            const pageApplicationConfigFields = {};
            pageDescriptors.forEach(pageDescriptor => {

                const pageDescriptorConfigName = context.uniqueName('PageComponentDataDescriptorConfig')
                const pageDescriptorConfigFields = {};

                formLib.getFormItems(pageDescriptor.form).forEach(function (formItem) {
                    //Creates a data field corresponding to this form item
                    pageDescriptorConfigFields[namingLib.sanitizeText(formItem.name)] = {
                        type: formLib.generateFormItemObjectType(context, pageDescriptorConfigName, formItem),
                        args: formLib.generateFormItemArguments(context, formItem),
                        resolve: formLib.generateFormItemResolveFunction(formItem)
                    }
                });


                if (Object.keys(pageDescriptorConfigFields).length > 0) {
                    const pageDescriptorConfigType = graphQlLib.createObjectType(context, {
                        name: pageDescriptorConfigName,
                        description: 'Page component application config for application [' + applicationKey + '] and descriptor [' +
                                     pageDescriptor.name + ']',
                        fields: pageDescriptorConfigFields
                    });
                    pageApplicationConfigFields[naminglLib.sanitizeText(pageDescriptor.name)] = {
                        type: pageDescriptorConfigType
                    }
                }
            });

            if (Object.keys(pageApplicationConfigFields).length > 0) {
                const applicationConfigType = graphQlLib.createObjectType(context, {
                    name: context.uniqueName('PageComponentDataApplicationConfig'),
                    description: 'Page component application config for application [' + applicationKey + ']',
                    fields: pageApplicationConfigFields
                });
                pageConfigFields[naminglLib.sanitizeText(applicationKey)] = {
                    type: applicationConfigType,
                    resolve: (env) => env.source[naminglLib.applicationConfigKey(applicationKey)]
                }

            }
        }
    });


    if (Object.keys(pageConfigFields).length > 0) {
        context.types.pageComponentDataConfigType = graphQlLib.createObjectType(context, {
            name: context.uniqueName('PageComponentDataConfig'),
            description: 'Page component config.',
            fields: pageConfigFields
        });
    }
}

function resolvePageTemplate(content) {
    if ('portal:page-template' === content.type) {
        return content;
    }

    if (!content.page || Object.keys(content.page).length == 0) {
        return getDefaultPageTemplate(content);
    }

    if (content.page && content.page.template) {
        return contentLib.get({key: content.page.template});
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

function inlineFragmentComponents(components) {
    const inlinedComponents = [];
    components.forEach(component => {
        if ('fragment' == component.type) {
            const fragmentId = component.fragment.id;

            var context = contextLib.get();
            var fragment = nodeLib.connect({
                repoId: context.repository,
                branch: context.branch
            }).get(fragmentId);
            utilLib.forceArray(fragment.components).forEach((fragmentComponent) => {
                fragmentComponent.path = component.path + (fragmentComponent.path === '/' ? '' : fragmentComponent.path);
                inlinedComponents.push(fragmentComponent);
            });
        } else {
            inlinedComponents.push(component);
        }
    });
    return inlinedComponents;
}

function inlineFragmentContentComponents(container) {
    if (container && container.regions) {
        Object.keys(container.regions).forEach(regionName => {
            const region = container.regions[regionName];
            utilLib.forceArray(region.components).forEach((component, componentIndex) => {
                if ('fragment' == component.type) {
                    const fragmentContent = contentLib.get({key: component.fragment});
                    if (fragmentContent) {
                        region.components[componentIndex] = fragmentContent.fragment;

                        fragmentContent.fragment.path = component.path;
                        prefixContentComponentPaths(fragmentContent.fragment, component.path);

                        //No need to call recursively as a fragment cannot contain a fragment

                    }
                } else if ('layout' == component.type) {
                    inlineFragmentContentComponents(component);
                }
            });

        });
    }
}

function prefixContentComponentPaths(container, prefix) {
    if (container && container.regions) {
        Object.keys(container.regions).forEach(regionName => {
            const region = container.regions[regionName];
            utilLib.forceArray(region.components).forEach((component) => {
                component.path = prefix + component.path;

                if ('layout' == component.type) {
                    prefixContentComponentPaths(component, prefix);
                }
            });
        });
    }
}

exports.resolvePageTemplate = resolvePageTemplate;
exports.resolvePageTemplateId = resolvePageTemplateId;
exports.inlineFragmentComponents = inlineFragmentComponents;
exports.inlineFragmentContentComponents = inlineFragmentContentComponents;