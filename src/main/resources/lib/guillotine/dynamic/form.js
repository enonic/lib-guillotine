const contentLib = require('/lib/xp/content');

const namingLib = require('/lib/guillotine/util/naming');
const utilLib = require('/lib/guillotine/util/util');
const graphQlLib = require('/lib/guillotine/graphql');
const validationLib = require('/lib/guillotine/util/validation');

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


function generateFormItemObjectType(context, namePrefix, formItem) {
    var formItemObjectType;
    switch (formItem.formItemType) {
    case 'ItemSet':
        formItemObjectType = generateItemSetObjectType(context, namePrefix, formItem);
        break;
    case 'Layout':
        //Should already be filtered
        break;
    case 'Input':
        formItemObjectType = generateInputObjectType(context, formItem);
        break;
    case 'OptionSet':
        formItemObjectType = generateOptionSetObjectType(context, namePrefix, formItem);
        break;
    }

    formItemObjectType = formItemObjectType || graphQlLib.GraphQLString;
    if (formItem.occurrences && formItem.occurrences.maximum == 1) {
        return formItemObjectType;
    } else {
        return graphQlLib.list(formItemObjectType)
    }
}

function generateItemSetObjectType(context, namePrefix, itemSet) {
    var name = namePrefix + '_' + namingLib.generateCamelCase(itemSet.label, true);
    var createItemSetTypeParams = {
        name: context.uniqueName(name),
        description: itemSet.label,
        fields: {}
    };
    getFormItems(itemSet.items).forEach(function (item) {
        createItemSetTypeParams.fields[namingLib.generateCamelCase(item.name)] = {
            type: generateFormItemObjectType(context, namePrefix, item),
            resolve: generateFormItemResolveFunction(item)
        }
    });
    return graphQlLib.createObjectType(context, createItemSetTypeParams);
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

function generateOptionSetObjectType(context, namePrefix, optionSet) {
    var name = namePrefix + '_' + namingLib.generateCamelCase(optionSet.label, true);
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
            type: generateOptionObjectType(context, namePrefix, option),
            resolve: function (env) {
                return env.source[option.name];
            }
        }
    });
    return graphQlLib.createObjectType(context, createOptionSetTypeParams);
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

function generateOptionObjectType(context, namePrefix, option) {
    if (option.items.length > 0) {
        return generateItemSetObjectType(context, namePrefix, option);
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

            if (value && env.args.processHtml) {
                value = portalLib.processHtml({value: value, type: env.args.processHtml.type});
            }
            if (value && 'Input' == formItem.formItemType &&
                ['ContentSelector', 'MediaUploader', 'AttachmentUploader', 'ImageSelector'].indexOf(formItem.inputType) !== -1) {
                value = contentLib.get({key: value});
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
                    return contentLib.get({key: value});
                }).filter(function (content) {
                    return content != null
                });
            }
            return values;
        };
    }
}


exports.getFormItems = getFormItems;
exports.generateFormItemObjectType = generateFormItemObjectType;
exports.generateFormItemArguments = generateFormItemArguments;
exports.generateFormItemResolveFunction = generateFormItemResolveFunction;