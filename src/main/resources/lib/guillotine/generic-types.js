var graphQlLib = require('/lib/graphql');
var graphQlConnectionLib = require('/lib/graphql-connection');
var contentLib = require('/lib/xp/content');
var portalLib = require('/lib/xp/portal');

var securityLib = require('./security');
var validationLib = require('./validation');

var principalKeyRegexp = /^(?:role:([^:]+)|(?:(?:user|group):([^:]+):([^:]+)))$/;

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
            type: context.types.principalKeyType
        },
        modifier: {
            type: context.types.principalKeyType
        },
        createdTime: {
            type: graphQlLib.GraphQLString
        },
        modifiedTime: {
            type: graphQlLib.GraphQLString
        },
        owner: {
            type: context.types.principalKeyType
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
        page: {
            type: context.types.pageType
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
                return contentLib.getPermissions({
                    key: env.source._id
                });
            }
        }
    };
};

exports.createGenericTypes = function (context) {
    context.types.principalKeyType = graphQlLib.createObjectType({
        name: context.uniqueName('PrincipalKey'),
        description: 'Principal key.',
        fields: {
            value: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return env.source;
                }
            },
            type: {
                type: graphQlLib.createEnumType({
                    name: context.uniqueName('PrincipalType'),
                    description: 'Principal type.',
                    values: {
                        'user': 'user',
                        'group': 'group',
                        'role': 'role'
                    }
                }),
                resolve: function (env) {
                    return env.source.split(':', 2)[0];
                }
            },
            userStore: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return getUserStoreName(env.source);
                }
            },
            principalId: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return getPrincipalId(env.source);
                }
            }
        }
    });

    context.types.permissionType = graphQlLib.createEnumType({
        name: context.uniqueName('Permission'),
        description: 'Permission.',
        values: {
            'READ': 'READ',
            'CREATE': 'CREATE',
            'MODIFY': 'MODIFY',
            'DELETE': 'DELETE',
            'PUBLISH': 'PUBLISH',
            'READ_PERMISSIONS': 'READ_PERMISSIONS',
            'WRITE_PERMISSIONS': 'WRITE_PERMISSIONS'
        }
    });

    context.types.accessControlEntryType = graphQlLib.createObjectType({
        name: context.uniqueName('AccessControlEntry'),
        description: 'Access control entry.',
        fields: {
            principal: {
                type: context.types.principalKeyType
            },
            allow: {
                type: graphQlLib.list(context.types.permissionType)
            },
            deny: {
                type: graphQlLib.list(context.types.permissionType)
            }
        }
    });

    context.types.permissionsType = graphQlLib.createObjectType({
        name: context.uniqueName('Permissions'),
        description: 'Permissions.',
        fields: {
            inheritsPermissions: {
                type: graphQlLib.GraphQLBoolean
            },
            permissions: {
                type: graphQlLib.list(context.types.accessControlEntryType)
            }
        }
    });

    context.types.geoPointType = graphQlLib.createObjectType({
        name: context.uniqueName('GeoPoint'),
        description: 'GeoPoint.',
        fields: {
            value: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return env.source;
                }
            },
            latitude: {
                type: graphQlLib.GraphQLFloat,
                resolve: function (env) {
                    return env.source.split(',', 2)[0];
                }
            },
            longitude: {
                type: graphQlLib.GraphQLFloat,
                resolve: function (env) {
                    return env.source.split(',', 2)[1];
                }
            }
        }
    });

    context.types.mediaFocalPointType = graphQlLib.createObjectType({
        name: context.uniqueName('MediaFocalPoint'),
        description: 'Media focal point.',
        fields: {
            x: {
                type: graphQlLib.GraphQLFloat
            },
            y: {
                type: graphQlLib.GraphQLFloat
            }
        }
    });

    context.types.mediaUploaderType = graphQlLib.createObjectType({
        name: context.uniqueName('MediaUploader'),
        description: 'Media uploader.',
        fields: {
            attachment: {
                type: graphQlLib.GraphQLString
            },
            focalPoint: {
                type: context.types.mediaFocalPointType
            }
        }
    });

    context.types.siteConfiguratorType = graphQlLib.createObjectType({
        name: context.uniqueName('SiteConfigurator'),
        description: 'Site configurator.',
        fields: {
            applicationKey: {
                type: graphQlLib.GraphQLString
            },
            config: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return JSON.stringify(env.source.config);
                }
            }
        }
    });

    context.types.publishInfoType = graphQlLib.createObjectType({
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

    context.types.attachmentType = graphQlLib.createObjectType({
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

    context.types.extraDataType = graphQlLib.createObjectType({
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

    context.types.componentType = graphQlLib.createObjectType({
        name: context.uniqueName('Component'),
        description: 'Component.',
        fields: {
            name: {
                type: graphQlLib.GraphQLString
            },
            path: {
                type: graphQlLib.GraphQLString
            },
            type: {
                type: graphQlLib.GraphQLString
            },
            descriptor: {
                type: graphQlLib.GraphQLString
            },
            text: {
                type: graphQlLib.GraphQLString
            },
            fragment: {
                type: graphQlLib.GraphQLString
            },
            config: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return JSON.stringify(env.source.config);
                }
            },
            regions: {
                type: graphQlLib.list(graphQlLib.reference('Region')),
                resolve: function (env) {
                    return env.source.regions && Object.keys(env.source.regions).map(function (key) {
                            return env.source.regions[key];
                        });
                }
            }
        }
    });

    context.types.pageRegionType = graphQlLib.createObjectType({
        name: context.uniqueName('Region'),
        description: 'Page region.',
        fields: {
            name: {
                type: graphQlLib.GraphQLString
            },
            components: {
                type: graphQlLib.list(context.types.componentType)
            }
        }
    });

    context.types.pageType = graphQlLib.createObjectType({
        name: context.uniqueName('Page'),
        description: 'Page.',
        fields: {
            template: {
                type: graphQlLib.GraphQLString
            },
            controller: {
                type: graphQlLib.GraphQLString
            },
            config: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return JSON.stringify(env.source.config);
                }
            },
            regions: {
                type: graphQlLib.list(context.types.pageRegionType),
                resolve: function (env) {
                    return env.source.regions && Object.keys(env.source.regions).map(function (key) {
                            return env.source.regions[key];
                        });
                }
            },
            fragment: {
                type: context.types.componentType
            }
        }
    });

    context.types.iconType = graphQlLib.createObjectType({
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

    context.types.formItemTypeType = graphQlLib.createEnumType({
        name: context.uniqueName('FormItemType'),
        description: 'Form item type',
        values: {
            'ItemSet': 'ItemSet',
            'Layout': 'Layout',
            'Input': 'Input',
            'OptionSet': 'OptionSet'
        }
    });

    context.types.formItemType = graphQlLib.createInterfaceType({
        name: context.uniqueName('FormItem'),
        typeResolver: function (contentType) {
            switch (contentType.formItemType) {
            case 'ItemSet':
                return context.types.formItemSetType;
            case 'Layout':
                return context.types.formLayoutType;
            case 'Input':
                return context.types.formInputType;
            case 'OptionSet':
                return context.types.formOptionSetType;
            }
        },
        description: 'Form item.',
        fields: {
            formItemType: {
                type: context.types.formItemTypeType
            },
            name: {
                type: graphQlLib.GraphQLString
            },
            label: {
                type: graphQlLib.GraphQLString
            }
        }
    });

    context.types.occurrencesType = graphQlLib.createObjectType({
        name: context.uniqueName('Occurrences'),
        description: 'Occurrences.',
        fields: {
            maximum: {
                type: graphQlLib.GraphQLInt
            },
            minimum: {
                type: graphQlLib.GraphQLInt
            }
        }
    });

    context.types.defaultValueType = graphQlLib.createObjectType({
        name: context.uniqueName('DefaultValue'),
        description: 'Default value.',
        fields: {
            value: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return JSON.stringify(env.source.value);
                }
            },
            type: {
                type: graphQlLib.GraphQLString
            }
        }
    });

    context.types.formItemSetType = graphQlLib.createObjectType({
        name: context.uniqueName('FormItemSet'),
        description: 'Form item set.',
        interfaces: [context.types.formItemType],
        fields: {
            formItemType: {
                type: context.types.formItemTypeType
            },
            name: {
                type: graphQlLib.GraphQLString
            },
            label: {
                type: graphQlLib.GraphQLString
            },
            customText: {
                type: graphQlLib.GraphQLString
            },
            helpText: {
                type: graphQlLib.GraphQLString
            },
            occurrences: {
                type: context.types.occurrencesType
            },
            items: {
                type: graphQlLib.list(context.types.formItemType)
            }
        }
    });
    context.addObjectType(context.types.formItemSetType);

    context.types.formLayoutType = graphQlLib.createObjectType({
        name: context.uniqueName('FormLayout'),
        description: 'Form layout.',
        interfaces: [context.types.formItemType],
        fields: {
            formItemType: {
                type: context.types.formItemTypeType
            },
            name: {
                type: graphQlLib.GraphQLString
            },
            label: {
                type: graphQlLib.GraphQLString
            },
            items: {
                type: graphQlLib.list(context.types.formItemType)
            }
        }
    });
    context.addObjectType(context.types.formLayoutType);

    context.types.formOptionSetOptionType = graphQlLib.createObjectType({
        name: context.uniqueName('FormOptionSetOption'),
        description: 'Form option set option.',
        fields: {
            name: {
                type: graphQlLib.GraphQLString
            },
            label: {
                type: graphQlLib.GraphQLString
            },
            helpText: {
                type: graphQlLib.GraphQLString
            },
            default: {
                type: graphQlLib.GraphQLBoolean
            },
            items: {
                type: graphQlLib.list(context.types.formItemType)
            }
        }
    });

    context.types.formOptionSetType = graphQlLib.createObjectType({
        name: context.uniqueName('FormOptionSet'),
        description: 'Form option set.',
        interfaces: [context.types.formItemType],
        fields: {
            formItemType: {
                type: context.types.formItemTypeType
            },
            name: {
                type: graphQlLib.GraphQLString
            },
            label: {
                type: graphQlLib.GraphQLString
            },
            expanded: {
                type: graphQlLib.GraphQLBoolean
            },
            helpText: {
                type: graphQlLib.GraphQLString
            },
            occurrences: {
                type: context.types.occurrencesType
            },
            selection: {
                type: context.types.occurrencesType
            },
            options: {
                type: graphQlLib.list(context.types.formOptionSetOptionType)
            }
        }
    });
    context.addObjectType(context.types.formOptionSetType);

    context.types.formInputType = graphQlLib.createObjectType({
        name: context.uniqueName('FormInput'),
        description: 'Form input.',
        interfaces: [context.types.formItemType],
        fields: {
            formItemType: {
                type: context.types.formItemTypeType
            },
            name: {
                type: graphQlLib.GraphQLString
            },
            label: {
                type: graphQlLib.GraphQLString
            },
            customText: {
                type: graphQlLib.GraphQLString
            },
            helpText: {
                type: graphQlLib.GraphQLString
            },
            validationRegexp: {
                type: graphQlLib.GraphQLString
            },
            maximize: {
                type: graphQlLib.GraphQLBoolean
            },
            inputType: {
                type: graphQlLib.GraphQLString
            },
            occurrences: {
                type: context.types.occurrencesType
            },
            defaultValue: {
                type: context.types.defaultValueType
            },
            config: {
                type: graphQlLib.GraphQLString, //TODO
                resolve: function (env) {
                    return JSON.stringify(env.source.config);
                }
            }
        }
    });
    context.addObjectType(context.types.formInputType);

    context.types.contentTypeType = graphQlLib.createObjectType({
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
            return context.contentTypeMap[content.type];
        },
        description: 'Content.',
        fields: exports.generateGenericContentFields(context)
    });
    context.types.contentConnectionType = graphQlConnectionLib.createConnectionType(context.types.contentType);
};

function getUserStoreName(principalKey) {
    var groups = principalKeyRegexp.exec(principalKey);
    return groups[2] || null;
}

function getPrincipalId(principalKey) {
    var groups = principalKeyRegexp.exec(principalKey);
    return groups[1] || groups[3];
}




