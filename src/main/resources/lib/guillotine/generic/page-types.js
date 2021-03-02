const contentLib = require('/lib/xp/content');
const contextLib = require('/lib/xp/context');
const nodeLib = require('/lib/xp/node');
const portalLib = require('/lib/xp/portal');

const graphQlLib = require('/lib/guillotine/graphql');
const componentTypesLib = require('/lib/guillotine/dynamic/component-types');
const utilLib = require('/lib/guillotine/util/util');
const macroTypesLib = require('/lib/guillotine/dynamic/macro-types');

function generateTypes(schemaGenerator, context) {
    componentTypesLib.createComponentDataConfigType(schemaGenerator, context);
    macroTypesLib.createMacroDataConfigType(schemaGenerator, context);

    context.types.imageStyleType = graphQlLib.createOutputObjectType(schemaGenerator, context, {
        name: context.uniqueName('ImageStyleType'),
        description: 'ImageStyleType.',
        fields: {
            name: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return env.source.name;
                }
            },
            aspectRatio: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return env.source.aspectRatio;
                }
            },
            filter: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return env.source.filter;
                }
            }
        }
    });

    context.types.imageType = graphQlLib.createOutputObjectType(schemaGenerator, context, {
        name: context.uniqueName('ImageType'),
        description: 'ImageType.',
        fields: {
            imageId: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return env.source.imageId;
                }
            },
            imageRef: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return env.source.imageRef;
                }
            },
            style: {
                type: context.types.imageStyleType,
                resolve: function (env) {
                    return env.source.style;
                }
            }
        }
    });

    context.types.htmlAreaResultType = graphQlLib.createOutputObjectType(schemaGenerator, context, {
        name: context.uniqueName('HtmlAreaResult'),
        description: 'HtmlAreaResult type.',
        fields: {
            raw: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return env.source.raw;
                }
            },
            markup: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return env.source.markup;
                }
            },
            macrosAsJson: {
                type: graphQlLib.Json,
                resolve: function (env) {
                    return env.source.macrosAsJson;
                }
            },
            macros: context.types.MacroDataConfigType && {
                type: context.types.MacroDataConfigType,
                resolve: function (env) {
                    return env.source.macros;
                }
            },
            images: {
                type: graphQlLib.list(context.types.imageType),
                resolve: function (env) {
                    return env.source.images;
                }
            }
        }
    });

    context.types.componentTypeType = schemaGenerator.createEnumType({
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

    context.types.pageComponentDataType = graphQlLib.createOutputObjectType(schemaGenerator, context, {
        name: context.uniqueName('PageComponentData'),
        description: 'Page component data.',
        fields: {
            descriptor: {
                type: graphQlLib.GraphQLString
            },
            customized: {
                type: graphQlLib.GraphQLBoolean
            },
            config: context.types.PageComponentDataConfigType && {
                type: context.types.PageComponentDataConfigType
            },
            configAsJson: {
                type: graphQlLib.Json,
                resolve: function (env) {
                    return env.source.config;
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

    context.types.layoutComponentDataType = graphQlLib.createOutputObjectType(schemaGenerator, context, {
        name: context.uniqueName('LayoutComponentData'),
        description: 'Layout component data.',
        fields: {
            descriptor: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            },
            config: context.types.LayoutComponentDataConfigType && {
                type: context.types.LayoutComponentDataConfigType
            },
            configAsJson: {
                type: graphQlLib.Json,
                resolve: function (env) {
                    return env.source.config;
                }
            }

        }
    });

    context.types.partComponentDataType = graphQlLib.createOutputObjectType(schemaGenerator, context, {
        name: context.uniqueName('PartComponentData'),
        description: 'Part component data.',
        fields: {
            descriptor: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            },
            config: context.types.PartComponentDataConfigType && {
                type: context.types.PartComponentDataConfigType
            },
            configAsJson: {
                type: graphQlLib.Json,
                resolve: function (env) {
                    return env.source.config;
                }
            }

        }
    });

    context.types.imageComponentDataType = graphQlLib.createOutputObjectType(schemaGenerator, context, {
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

    context.types.textComponentDataType = graphQlLib.createOutputObjectType(schemaGenerator, context, {
        name: context.uniqueName('TextComponentData'),
        description: 'Text component data.',
        fields: {
            value: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            }
        }
    });

    context.types.fragmentComponentDataType = graphQlLib.createOutputObjectType(schemaGenerator, context, {
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

    context.types.componentType = graphQlLib.createOutputObjectType(schemaGenerator, context, {
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
}

function resolvePageTemplate(content) {
    if ('portal:page-template' === content.type) {
        return content;
    }

    if (!content.page || Object.keys(content.page).length === 0) {
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

    if (!content.page || Object.keys(content.page).length === 0) {
        const template = getDefaultPageTemplate(content);
        return template == null ? null : template._id;
    }

    if (content.page && content.page.template) {
        return content.page.template;
    }
}

function getDefaultPageTemplate(content) {
    const bean = __.newBean('com.enonic.lib.guillotine.handler.GetDefaultPageTemplateBean');
    bean.siteId = portalLib.getSite()._id;
    bean.contentType = content.type;
    const template = bean.execute();
    return template == null ? null : __.toNativeObject(template);
}

function inlineFragmentComponents(components) {
    const inlinedComponents = [];
    components.forEach(component => {
        if ('fragment' === component.type && component.fragment.id) {
            const fragmentId = component.fragment.id;

            let context = contextLib.get();
            let fragment = nodeLib.connect({
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
                if ('fragment' === component.type && component.fragment) {
                    const fragmentContent = contentLib.get({key: component.fragment});
                    if (fragmentContent) {
                        region.components[componentIndex] = fragmentContent.fragment;

                        fragmentContent.fragment.path = component.path;
                        prefixContentComponentPaths(fragmentContent.fragment, component.path);

                        //No need to call recursively as a fragment cannot contain a fragment

                    }
                } else if ('layout' === component.type) {
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

                if ('layout' === component.type) {
                    prefixContentComponentPaths(component, prefix);
                }
            });
        });
    }
}

exports.generateTypes = generateTypes;
exports.resolvePageTemplate = resolvePageTemplate;
exports.resolvePageTemplateId = resolvePageTemplateId;
exports.inlineFragmentComponents = inlineFragmentComponents;
exports.inlineFragmentContentComponents = inlineFragmentContentComponents;
