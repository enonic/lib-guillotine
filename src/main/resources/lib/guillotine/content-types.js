var graphQlLib = require('/lib/graphql');
var contentLib = require('/lib/xp/content');
var portalLib = require('/lib/xp/portal');

var genericTypesLib = require('./generic-types');
var namingLib = require('./naming');
var securityLib = require('./security');
var utilLib = require('./util');
var validationLib = require('./validation');

var mediaContentTypeRegexp = /^media:/;
var imageContentTypeRegexp = /^media:image$/;

exports.createContentTypeTypes = function (context) {

    //For each content type
    exports.getAllowedContentTypes().
        forEach(function (contentType) {

            //Generates the object type for this content type
            var contentTypeObjectType = generateContentTypeObjectType(context, contentType);
            context.addObjectType(contentTypeObjectType);
        });
};

exports.getAllowedContentTypes = function () {
    var allowedContentTypeRegexp = generateAllowedContentTypeRegexp();
    return contentLib.getTypes().
        filter(function (contentType) {
            return contentType.name.match(allowedContentTypeRegexp);
        });
};

exports.getAllowedContentType = function (name) {
    var allowedContentTypeRegexp = generateAllowedContentTypeRegexp();
    var contentType = contentLib.getType(name);
    return contentType && contentType.name.match(allowedContentTypeRegexp) ? contentType : null;
}

function generateAllowedContentTypeRegexp() {
    var siteConfigs = utilLib.forceArray(portalLib.getSite().data.siteConfig);
    var siteApplicationKeys = siteConfigs.map(function (applicationConfigEntry) {
        return '|' + applicationConfigEntry.applicationKey.replace(/\./g, '\\.');
    }).join('');
    return new RegExp('^(?:base|media|portal' + siteApplicationKeys + '):');
}

function generateContentTypeObjectType(context, contentType) {
    var name = generateContentTypeName(contentType);

    var createContentTypeTypeParams = {
        name: context.uniqueName(name),
        description: contentType.displayName + ' - ' + contentType.name,
        interfaces: [context.types.contentType],
        fields: genericTypesLib.generateGenericContentFields(context)
    };

    if (contentType.name.match(mediaContentTypeRegexp)) {
        addMediaFields(context, createContentTypeTypeParams);
        if (contentType.name.match(imageContentTypeRegexp)) {
            addImageFields(context, createContentTypeTypeParams);
        }
    }

    createContentTypeTypeParams.fields.data = getFormItems(contentType.form).length > 0 ? {
        type: generateContentDataObjectType(context, contentType)
    } : undefined;

    var contentTypeObjectType = graphQlLib.createObjectType(createContentTypeTypeParams);
    context.putContentType(contentType.name, contentTypeObjectType);
    return contentTypeObjectType;
}

function addMediaFields(context, createContentTypeTypeParams) {
    createContentTypeTypeParams.fields.mediaUrl = {
        type: graphQlLib.GraphQLString,
        args: {
            download: graphQlLib.GraphQLBoolean,
            type: context.types.urlTypeType,
            params: graphQlLib.GraphQLString
        },
        resolve: function (env) {
            return portalLib.attachmentUrl({
                id: env.source._id,
                download: env.args.download,
                type: env.args.type,
                params: env.args.params && JSON.parse(env.args.params)
            });
        }
    }
}

function addImageFields(context, createContentTypeTypeParams) {
    createContentTypeTypeParams.fields.imageUrl = {
        type: graphQlLib.GraphQLString,
        args: {
            scale: graphQlLib.nonNull(graphQlLib.GraphQLString),
            quality: graphQlLib.GraphQLInt,
            background: graphQlLib.GraphQLString,
            format: graphQlLib.GraphQLString,
            filter: graphQlLib.GraphQLString,
            type: context.types.urlTypeType,
            params: graphQlLib.GraphQLString
        },
        resolve: function (env) {
            return portalLib.imageUrl({
                id: env.source._id,
                scale: env.args.scale,
                quality: env.args.quality,
                background: env.args.background,
                format: env.args.format,
                filter: env.args.filter,
                type: env.args.type,
                params: env.args.params && JSON.parse(env.args.params)
            });
        }
    }
}

function generateContentDataObjectType(context, contentType) {
    var name = generateContentTypeName(contentType) + '_Data';
    var createContentTypeDataTypeParams = {
        name: context.uniqueName(name),
        description: contentType.displayName + ' data',
        fields: {}
    };

    //For each item of the content type form
    getFormItems(contentType.form).forEach(function (formItem) {

        //Creates a data field corresponding to this form item
        createContentTypeDataTypeParams.fields[namingLib.sanitizeText(formItem.name)] = {
            type: generateFormItemObjectType(context, contentType, formItem),
            args: generateFormItemArguments(context, formItem),
            resolve: generateFormItemResolveFunction(formItem)
        }
    });
    return graphQlLib.createObjectType(createContentTypeDataTypeParams);
}

function getFormItems(form) {
    var formItems = [];
    form.forEach(function (formItem) {
        if ('ItemSet' === formItem.formItemType && getFormItems(formItem.items).length === 0) {
            return;
        }
        if ('Layout' === formItem.formItemType) {
            getFormItems(formItem.items).forEach(function (layoutItem) {
                formItems.push(layoutItem);
            });
            return;
        }
        if ('Input' == formItem.formItemType && 'SiteConfigurator' == formItem.inputType) {
            return;
        }
        formItems.push(formItem);
    });
    return formItems;
}

function generateFormItemObjectType(context, contentType, formItem) {
    var formItemObjectType;
    switch (formItem.formItemType) {
    case 'ItemSet':
        formItemObjectType = generateItemSetObjectType(context, contentType, formItem);
        break;
    case 'Layout':
        //Should already be filtered
        break;
    case 'Input':
        formItemObjectType = generateInputObjectType(context, formItem);
        break;
    case 'OptionSet':
        formItemObjectType = generateOptionSetObjectType(context, contentType, formItem);
        break;
    }

    formItemObjectType = formItemObjectType || graphQlLib.GraphQLString;
    if (formItem.occurrences && formItem.occurrences.maximum == 1) {
        return formItemObjectType;
    } else {
        return graphQlLib.list(formItemObjectType)
    }
}

function generateItemSetObjectType(context, contentType, itemSet) {
    var name = generateContentTypeName(contentType) + '_' + namingLib.generateCamelCase(itemSet.label, true);
    var createItemSetTypeParams = {
        name: context.uniqueName(name),
        description: itemSet.label,
        fields: {}
    };
    getFormItems(itemSet.items).forEach(function (item) {
        createItemSetTypeParams.fields[namingLib.generateCamelCase(item.name)] = {
            type: generateFormItemObjectType(context, contentType, item),
            resolve: generateFormItemResolveFunction(item)
        }
    });
    return graphQlLib.createObjectType(createItemSetTypeParams);
}

function generateInputObjectType(context, input) {
    switch (input.inputType) {
    case 'CheckBox':
        return graphQlLib.GraphQLBoolean;
    case 'ComboBox':
        return graphQlLib.GraphQLString;
    case 'ContentSelector':
        return context.types.contentType;
    case 'CustomSelector':
        return graphQlLib.GraphQLString;
    case 'ContentTypeFilter':
        return graphQlLib.GraphQLString;
    case 'Date':
        return graphQlLib.GraphQLString; //TODO Date custom scalar type
    case 'DateTime':
        return graphQlLib.GraphQLString; //TODO DateTime custom scalar type
    case 'Double':
        return graphQlLib.GraphQLFloat;
    case 'MediaUploader':
        return context.types.contentType;
    case 'AttachmentUploader':
        return context.types.contentType;
    case 'GeoPoint':
        return context.types.geoPointType;
    case 'HtmlArea':
        return graphQlLib.GraphQLString;
    case 'ImageSelector':
        return context.types.contentType;
    case 'ImageUploader':
        return context.types.mediaUploaderType;
    case 'Long':
        return graphQlLib.GraphQLInt;
    case 'RadioButton':
        return graphQlLib.GraphQLString; //TODO Should be enum based on config
    case 'SiteConfigurator':
        return context.types.siteConfiguratorType;
    case 'Tag':
        return graphQlLib.GraphQLString;
    case 'TextArea':
        return graphQlLib.GraphQLString;
    case 'TextLine':
        return graphQlLib.GraphQLString;
    case 'Time':
        return graphQlLib.GraphQLString; //TODO Time custom scalar type
    }
    return graphQlLib.GraphQLString;
}

function generateOptionSetObjectType(context, contentType, optionSet) {
    var name = generateContentTypeName(contentType) + '_' + namingLib.generateCamelCase(optionSet.label, true);
    var optionSetEnum = generateOptionSetEnum(context, optionSet, name);
    var createOptionSetTypeParams = {
        name: context.uniqueName(name),
        description: optionSet.label,
        fields: {
            _selected: {
                type: optionSet.selection.maximum == 1 ? optionSetEnum : graphQlLib.list(optionSetEnum),
                resolve: optionSet.selection.maximum == 1 ? undefined : function (env) { //TODO Fix
                    return utilLib.forceArray(env.source._selected);
                }
            }
        }
    };
    optionSet.options.forEach(function (option) {
        createOptionSetTypeParams.fields[namingLib.generateCamelCase(option.name)] = {
            type: generateOptionObjectType(context, contentType, option),
            resolve: function (env) {
                return env.source[option.name];
            }
        }
    });
    return graphQlLib.createObjectType(createOptionSetTypeParams);
}

function generateOptionSetEnum(context, optionSet, optionSetName) {
    var enumValues = {};
    optionSet.options.forEach(function (option) {
        enumValues[option.name] = option.name;
    });
    return graphQlLib.createEnumType({
        name: context.uniqueName(optionSetName + '_OptionEnum'),
        description: optionSet.label + ' option enum.',
        values: enumValues
    });
}

function generateOptionObjectType(context, contentType, option) {
    if (option.items.length > 0) {
        return generateItemSetObjectType(context, contentType, option);
    } else {
        return graphQlLib.GraphQLString;
    }
}

function generateFormItemArguments(context, formItem) {
    var args = {};
    if (!formItem.occurrences || formItem.occurrences.maximum != 1) {
        args.offset = graphQlLib.GraphQLInt;
        args.first = graphQlLib.GraphQLInt;
    }
    if ('Input' == formItem.formItemType && 'HtmlArea' == formItem.inputType) {
        args.processHtml = context.types.processHtmlType;
    }
    return args;
}

function generateFormItemResolveFunction(formItem) {
    if (formItem.occurrences && formItem.occurrences.maximum == 1) {
        return function (env) {
            var value = env.source[formItem.name];

            if (env.args.processHtml) {
                value = portalLib.processHtml({value: value, type: env.args.processHtml.type});
            }
            if ('Input' == formItem.formItemType &&
                ['ContentSelector', 'MediaUploader', 'AttachmentUploader', 'ImageSelector'].indexOf(formItem.inputType) !== -1) {
                var content = contentLib.get({key: value});
                value = securityLib.filterForbiddenContent(content);
            }
            return value;
        };
    } else {
        return function (env) {
            validationLib.validateArguments(env.args);
            var values = utilLib.forceArray(env.source[formItem.name]);
            if (env.args.offset != null || env.args.offset != null) {
                return values.slice(env.args.offset, env.args.first);
            }
            if (env.args.processHtml) {
                values = values.map(function (value) {
                    return portalLib.processHtml({value: value});
                });
            }
            if ('Input' == formItem.formItemType &&
                ['ContentSelector', 'MediaUploader', 'AttachmentUploader', 'ImageSelector'].indexOf(formItem.inputType) !== -1) {
                values = values.map(function (value) {
                    var content = contentLib.get({key: value});
                    return securityLib.filterForbiddenContent(content);
                }).filter(function (content) {
                    return content != null
                });
            }
            return values;
        };
    }
}


function generateContentTypeName(contentType) {
    var splitContentTypeName = contentType.name.split(':');
    var applicationName = splitContentTypeName[0];
    var contentTypeLabel = splitContentTypeName[1];
    return namingLib.sanitizeText(applicationName) + '_' + namingLib.generateCamelCase(contentTypeLabel, true);
}


