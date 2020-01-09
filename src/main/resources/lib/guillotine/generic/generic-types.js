var graphQlConnectionLib = require('/lib/graphql-connection');
var contentLib = require('/lib/xp/content');
var contextLib = require('/lib/xp/context');
var nodeLib = require('/lib/xp/node');
var portalLib = require('/lib/xp/portal');

var aclTypesLib = require('./acl-types');
var pageTypesLib = require('./page-types');
var formTypesLib = require('./form-types');
var genericContentTypesLib = require('./generic-content-types');

var graphQlLib = require('../graphql');
var securityLib = require('../security');
var validationLib = require('../validation');
var utilLib = require('../util');


exports.generateGenericContentFields = function (context) {
    return {
        _id: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID)
        },
        _name: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLString)
        },
        _path: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLString)
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
            type: graphQlLib.GraphQLString
        },
        modifiedTime: {
            type: graphQlLib.GraphQLString
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
            type: graphQlLib.GraphQLString,
            resolve: function (env) {
                return JSON.stringify(env.source.data);
            }
        },
        x: {
            type: graphQlLib.list(context.types.extraDataType),
            resolve: function (env) {
                var extraDatas = [];
                Object.keys(env.source.x).forEach(function (applicationKey) {
                    var applicationExtraData = env.source.x[applicationKey];
                    Object.keys(applicationExtraData).forEach(function (mixinLocalName) {
                        var mixin = applicationExtraData[mixinLocalName];
                        extraDatas.push({name: applicationKey + ':' + mixinLocalName, data: mixin});
                    });
                });
                return extraDatas;
            }
        },
        pageAsJson: {
            type: graphQlLib.GraphQLString,
            resolve: function (env) {
                return JSON.stringify(env.source.page);
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
                const pageTemplate = env.args.resolveTemplate === false ? null : pageTypesLib.resolvePageTemplate(env.source);
                const nodeId = pageTemplate == null ? env.source._id : pageTemplate._id;
                var context = contextLib.get();
                var node = nodeLib.connect({
                    repoId: context.repository,
                    branch: context.branch
                }).get(nodeId);

                let components = utilLib.forceArray(node && node.components);
                if (env.args.resolveFragment !== false) {
                    components = pageTypesLib.inlineFragmentComponents(components);
                }
                return components;
            }
        },
        attachments: {
            type: graphQlLib.list(context.types.attachmentType),
            resolve: function (env) {
                return Object.keys(env.source.attachments).map(function (key) {
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
                type: context.types.urlTypeType,
                params: graphQlLib.GraphQLString
            },
            resolve: function (env) {
                return portalLib.pageUrl({
                    id: env.source._id,
                    type: env.args.type,
                    params: env.args.params && JSON.parse(env.args.params)
                });
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
                    return securityLib.filterForbiddenContent(parent);
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
};

exports.createGenericTypes = function (context) {

    aclTypesLib.generateTypes(context);
    pageTypesLib.generateTypes(context);
    formTypesLib.generateTypes(context);
    genericContentTypesLib.generateTypes(context);

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
            }
        }
    });

    context.types.extraDataType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('ExtraData'),
        description: 'Extra data.',
        fields: {
            name: {
                type: graphQlLib.GraphQLString
            },
            data: {
                type: graphQlLib.GraphQLString
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
                        query: securityLib.adaptQuery(env.args.query),
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
                        query: securityLib.adaptQuery(env.args.query),
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

    context.types.contentType = graphQlLib.createInterfaceType({
        name: context.uniqueName('Content'),
        typeResolver: function (content) {
            return context.contentTypeMap[content.type] || context.types.untypedContentType;
        },
        description: 'Content.',
        fields: exports.generateGenericContentFields(context)
    });
    context.types.contentConnectionType = graphQlConnectionLib.createConnectionType(context.types.contentType);

    context.types.untypedContentType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('UntypedContent'),
        description: 'Untyped content.',
        interfaces: [context.types.contentType],
        fields: exports.generateGenericContentFields(context)
    });
};




