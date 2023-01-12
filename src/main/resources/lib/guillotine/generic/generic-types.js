const graphQlConnectionLib = require('/lib/graphql-connection');
const contentLib = require('/lib/xp/content');
const contextLib = require('/lib/xp/context');
const nodeLib = require('/lib/xp/node');
const portalLib = require('/lib/xp/portal');

const aclTypesLib = require('/lib/guillotine/generic/acl-types');
const pageTypesLib = require('/lib/guillotine/generic/page-types');
const formTypesLib = require('/lib/guillotine/generic/form-types');
const genericContentTypesLib = require('/lib/guillotine/generic/generic-content-types');

const graphQlLib = require('/lib/guillotine/graphql');
const securityLib = require('/lib/guillotine/util/security');
const validationLib = require('/lib/guillotine/util/validation');
const utilLib = require('/lib/guillotine/util/util');
const urlResolverLib = require('/lib/guillotine/util/url-helper');
const xDataTypesLib = require('/lib/guillotine/dynamic/x-data-types');
const getSiteLib = require('/lib/guillotine/util/site-helper');
const nodeTransformer = require('/lib/guillotine/util/node-transformer');

function generateGenericContentFields(context) {
    return {
        _id: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID)
        },
        _name: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLString)
        },
        _path: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLString),
            args: {
                type: context.types.contentPathType
            },
            resolve: function (env) {
                if (env.args.type === 'siteRelative') {
                    const sitePath = contextLib.run({
                        principals: ["role:system.admin"]
                    }, function () {
                        if (context.isGlobalMode()) {
                            if (env.context && env.context['__siteKey']) {
                                return getSiteLib.getSiteFromQueryContext(env.context)._path;
                            }
                            return env.source._path;
                        }
                        return portalLib.getSite()._path;
                    });
                    const normalizedPath = env.source._path.replace(sitePath, '');
                    return normalizedPath.startsWith("/") ? normalizedPath.substring(1) : normalizedPath;
                } else {
                    return env.source._path;
                }
            }
        },
        _references: {
            type: graphQlLib.list(graphQlLib.reference('Content')),
            resolve: (env) => contentLib.getOutboundDependencies({key: env.source._id})
                .map(id => contentLib.get({key: id}))
        },
        creator: {
            type: context.types.principalKeyType,
            resolve: function (env) {
                if (!securityLib.canAccessCmsData()) {
                    throw 'Unauthorized'
                }
                return env.source.creator;
            }
        },
        modifier: {
            type: context.types.principalKeyType,
            resolve: function (env) {
                if (!securityLib.canAccessCmsData()) {
                    throw 'Unauthorized'
                }
                return env.source.modifier;
            }
        },
        createdTime: {
            type: graphQlLib.DateTime
        },
        modifiedTime: {
            type: graphQlLib.DateTime
        },
        owner: {
            type: context.types.principalKeyType,
            resolve: function (env) {
                if (!securityLib.canAccessCmsData()) {
                    throw 'Unauthorized'
                }
                return env.source.owner;
            }
        },
        type: {
            type: graphQlLib.GraphQLString
        },
        contentType: {
            type: graphQlLib.reference('ContentType'),
            resolve: (env) => contentLib.getType(env.source.type)
        },
        displayName: {
            type: graphQlLib.GraphQLString
        },
        hasChildren: {
            type: graphQlLib.GraphQLBoolean
        },
        language: {
            type: graphQlLib.GraphQLString
        },
        valid: {
            type: graphQlLib.GraphQLBoolean
        },
        dataAsJson: {
            type: graphQlLib.Json,
            resolve: function (env) {
                return transformNodeIfAttachmentsExist(env.source).data;
            }
        },
        x: {
            type: context.types.extraDataType,
            resolve: function (env) {
                return env.source.x;
            }
        },
        xAsJson: {
            type: graphQlLib.Json,
            resolve: function (env) {
                return env.source.x;
            }
        },
        pageAsJson: {
            type: graphQlLib.Json,
            args: {
                resolveTemplate: graphQlLib.GraphQLBoolean,
                resolveFragment: graphQlLib.GraphQLBoolean,
            },
            resolve: function (env) {
                const pageTemplate = env.args.resolveTemplate === true ? pageTypesLib.resolvePageTemplate(env.source) : null;
                let page = pageTemplate == null ? env.source.page : pageTemplate.page;
                if (env.args.resolveFragment !== false && page && page.regions) {
                    pageTypesLib.inlineFragmentContentComponents(page);
                }
                return page;
            }
        },
        pageTemplate: {
            type: graphQlLib.reference('Content'),
            resolve: (env) => {
                return pageTypesLib.resolvePageTemplate(env.source);
            }
        },
        components: {
            type: graphQlLib.list(context.types.componentType),
            args: {
                resolveTemplate: graphQlLib.GraphQLBoolean,
                resolveFragment: graphQlLib.GraphQLBoolean,
            },
            resolve: function (env) {
                const pageTemplate = env.args.resolveTemplate === true ? pageTypesLib.resolvePageTemplate(env.source) : null;
                const nodeId = pageTemplate == null ? env.source._id : pageTemplate._id;
                const context = contextLib.get();
                const node = nodeLib.connect({
                    repoId: context.repository,
                    branch: context.branch
                }).get(nodeId);

                let components = utilLib.forceArray(node && node.components);
                if (env.args.resolveFragment !== false) {
                    components = pageTypesLib.inlineFragmentComponents(components);
                }

                if (node.hasOwnProperty('attachment') && node.attachment.length) {
                    components.forEach(component => {
                        nodeTransformer.addRecursiveNodeId(component, nodeId);
                        component['__nodeId'] = nodeId;
                    });
                }

                return components;
            }
        },
        attachments: {
            type: graphQlLib.list(context.types.attachmentType),
            resolve: function (env) {
                return Object.keys(env.source.attachments).map(function (key) {
                    env.source.attachments[key]['__nodeId'] = env.source._id;
                    return env.source.attachments[key];
                });
            }
        },
        publish: {
            type: context.types.publishInfoType
        },
        pageUrl: {
            type: graphQlLib.GraphQLString,
            args: {
                type: context.types.urlType,
                params: graphQlLib.GraphQLString
            },
            resolve: function (env) {
                return urlResolverLib.resolvePageUrl(env);
            }
        },
        site: {
            type: graphQlLib.reference('portal_Site'),
            resolve: function (env) {
                return contentLib.getSite({key: env.source._id});
            }
        },
        parent: {
            type: graphQlLib.reference('Content'),
            resolve: function (env) {
                var lastSlashIndex = env.source._path.lastIndexOf('/');
                if (lastSlashIndex === 0) {
                    return null;
                } else {
                    var parentPath = env.source._path.substr(0, lastSlashIndex);
                    var parent = contentLib.get({key: parentPath});
                    return securityLib.filterForbiddenContent(parent, context);
                }
            }
        },
        children: {
            type: graphQlLib.list(graphQlLib.reference('Content')),
            args: {
                offset: graphQlLib.GraphQLInt,
                first: graphQlLib.GraphQLInt,
                sort: graphQlLib.GraphQLString
            },
            resolve: function (env) {
                validationLib.validateArguments(env.args);
                return contentLib.getChildren({
                    key: env.source._id,
                    start: env.args.offset,
                    count: env.args.first,
                    sort: env.args.sort
                }).hits;
            }
        },
        childrenConnection: {
            type: graphQlLib.reference('ContentConnection'),
            args: {
                after: graphQlLib.GraphQLString,
                first: graphQlLib.GraphQLInt,
                sort: graphQlLib.GraphQLString
            },
            resolve: function (env) {
                validationLib.validateArguments(env.args);
                var start = env.args.after ? parseInt(graphQlConnectionLib.decodeCursor(env.args.after)) + 1 : 0;
                var getChildrenResult = contentLib.getChildren({
                    key: env.source._id,
                    start: start,
                    count: env.args.first,
                    sort: env.args.sort
                });
                return {
                    total: getChildrenResult.total,
                    start: start,
                    hits: getChildrenResult.hits
                };
            }
        },
        permissions: {
            type: context.types.permissionsType,
            resolve: function (env) {
                if (!securityLib.canAccessCmsData()) {
                    throw 'Unauthorized'
                }
                return contentLib.getPermissions({
                    key: env.source._id
                });
            }
        }
    };
}

function createGenericTypes(context) {

    aclTypesLib.generateTypes(context);
    genericContentTypesLib.generateTypes(context);
    formTypesLib.generateTypes(context);
    pageTypesLib.generateTypes(context);
    xDataTypesLib.createXDataConfigType(context);

    context.types.publishInfoType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('PublishInfo'),
        description: 'Publish information.',
        fields: {
            from: {
                type: graphQlLib.GraphQLString
            },
            to: {
                type: graphQlLib.GraphQLString
            },
            first: {
                type: graphQlLib.GraphQLString
            }
        }
    });

    context.types.attachmentType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('Attachment'),
        description: 'Attachment.',
        fields: {
            name: {
                type: graphQlLib.GraphQLString
            },
            label: {
                type: graphQlLib.GraphQLString
            },
            size: {
                type: graphQlLib.GraphQLInt
            },
            mimeType: {
                type: graphQlLib.GraphQLString
            },
            attachmentUrl: {
                type: graphQlLib.GraphQLString,
                args: {
                    download: graphQlLib.GraphQLBoolean,
                    type: context.types.urlType,
                    params: graphQlLib.GraphQLString
                },
                resolve: function (env) {
                    return urlResolverLib.resolveAttachmentUrlByName(env);
                }
            }
        }
    });

    context.types.iconType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('Icon'),
        description: 'Icon.',
        fields: {
            mimeType: {
                type: graphQlLib.GraphQLString
            },
            modifiedTime: {
                type: graphQlLib.GraphQLString
            }
        }
    });

    context.types.contentTypeType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('ContentType'),
        description: 'Content type.',
        fields: {
            name: {
                type: graphQlLib.GraphQLString
            },
            displayName: {
                type: graphQlLib.GraphQLString
            },
            description: {
                type: graphQlLib.GraphQLString
            },
            superType: {
                type: graphQlLib.GraphQLString
            },
            abstract: {
                type: graphQlLib.GraphQLBoolean
            },
            final: {
                type: graphQlLib.GraphQLBoolean
            },
            allowChildContent: {
                type: graphQlLib.GraphQLBoolean
            },
            contentDisplayNameScript: {
                type: graphQlLib.GraphQLString
            },
            icon: {
                type: context.types.iconType
            },
            form: {
                type: graphQlLib.list(context.types.formItemType)
            },
            formAsJson: {
                type: graphQlLib.Json,
                resolve: (env) => env.source.form
            },
            getInstances: {
                type: graphQlLib.list(graphQlLib.reference('Content')),
                args: {
                    offset: graphQlLib.GraphQLInt,
                    first: graphQlLib.GraphQLInt,
                    query: graphQlLib.GraphQLString,
                    sort: graphQlLib.GraphQLString
                },
                resolve: function (env) {
                    validationLib.validateArguments(env.args);
                    var contents = contentLib.query({
                        start: env.args.offset,
                        count: env.args.first,
                        query: securityLib.adaptQuery(env.args.query, context),
                        sort: env.args.sort,
                        contentTypes: [env.source.name]
                    }).hits;
                    return contents;
                }
            },
            getInstanceConnection: {
                type: graphQlLib.reference('ContentConnection'),
                args: {
                    after: graphQlLib.GraphQLString,
                    first: graphQlLib.GraphQLInt,
                    query: graphQlLib.GraphQLString,
                    sort: graphQlLib.GraphQLString
                },
                resolve: function (env) {
                    validationLib.validateArguments(env.args);
                    var start = env.args.after ? parseInt(graphQlConnectionLib.decodeCursor(env.args.after)) + 1 : 0;
                    var queryResult = contentLib.query({
                        start: start,
                        count: env.args.first,
                        query: securityLib.adaptQuery(env.args.query, context),
                        sort: env.args.sort,
                        contentTypes: [env.source.name]

                    });
                    return {
                        total: queryResult.total,
                        start: start,
                        hits: queryResult.hits
                    };
                }
            }
        }
    });

    context.types.contentType = graphQlLib.createInterfaceType(context, {
        name: context.uniqueName('Content'),
        typeResolver: function (content) {
            return context.contentTypeMap[content.type] || context.types.untypedContentType;
        },
        description: 'Content.',
        fields: exports.generateGenericContentFields(context)
    });
    context.types.contentConnectionType = graphQlConnectionLib.createConnectionType(context.schemaGenerator, context.types.contentType);

    context.types.untypedContentType = graphQlLib.createContentObjectType(context, {
        name: context.uniqueName('UntypedContent'),
        description: 'Untyped content.',
        interfaces: [context.types.contentType],
        fields: exports.generateGenericContentFields(context)
    });

    context.addDictionaryType(context.types.untypedContentType);

    context.types.queryContentConnectionType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('QueryContentConnection'),
        description: 'QueryContentConnection',
        fields: {
            totalCount: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLInt),
                resolve: function (env) {
                    return env.source.total;
                }
            },
            edges: {
                type: graphQlLib.list(graphQlLib.reference('ContentEdge')),
                resolve: function (env) {
                    let hits = env.source.hits;
                    let edges = [];
                    for (let i = 0; i < hits.length; i++) {
                        edges.push({
                            node: hits[i],
                            cursor: env.source.start + i
                        });
                    }
                    return edges;
                }
            },
            pageInfo: {
                type: graphQlLib.reference('PageInfo'),
                resolve: function (env) {
                    let count = env.source.hits.length;
                    return {
                        startCursor: env.source.start,
                        endCursor: env.source.start + (count === 0 ? 0 : (count - 1)),
                        hasNext: (env.source.start + count) < env.source.total
                    }
                }
            },
            aggregationsAsJson: {
                type: graphQlLib.Json
            }
        }
    });

    context.types.queryDslContentConnectionType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('QueryDSLContentConnection'),
        description: 'QueryDSLContentConnection',
        fields: {
            totalCount: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLInt),
                resolve: function (env) {
                    return env.source.total;
                }
            },
            edges: {
                type: graphQlLib.list(graphQlLib.reference('ContentEdge')),
                resolve: function (env) {
                    let hits = env.source.hits;
                    let edges = [];
                    for (let i = 0; i < hits.length; i++) {
                        edges.push({
                            node: hits[i],
                            cursor: env.source.start + i,
                        });
                    }
                    return edges;
                }
            },
            pageInfo: {
                type: graphQlLib.reference('PageInfo'),
                resolve: function (env) {
                    let count = env.source.hits.length;
                    return {
                        startCursor: env.source.start,
                        endCursor: env.source.start + (count === 0 ? 0 : (count - 1)),
                        hasNext: (env.source.start + count) < env.source.total,
                    }
                }
            },
            aggregationsAsJson: {
                type: graphQlLib.Json,
            },
            highlightAsJson: {
                type: graphQlLib.Json,
            },
        }
    });
}

function transformNodeIfAttachmentsExist(source) {
    if (source && source.hasOwnProperty('attachments') && Object.keys(source.attachments).length > 0) {
        const node = JSON.parse(JSON.stringify(source));
        if (node.data && node.data['__nodeId']) {
            nodeTransformer.removeNodeIdPropIfNeeded(node.data);
        }
        return node;
    }
    return source;
}

exports.generateGenericContentFields = generateGenericContentFields;
exports.createGenericTypes = createGenericTypes;




