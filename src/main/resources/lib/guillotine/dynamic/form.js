const contentLib = require('/lib/xp/content');

const namingLib = require('/lib/guillotine/util/naming');
const utilLib = require('/lib/guillotine/util/util');
const graphQlLib = require('/lib/guillotine/graphql');
const validationLib = require('/lib/guillotine/util/validation');
const macroLib = require('/lib/guillotine/macro');

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
        if ('Input' === formItem.formItemType && 'SiteConfigurator' === formItem.inputType) {
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

    if (!formItemObjectType) {
        log.warning('No type found for input type: ' + JSON.stringify(formItem));
    }

    formItemObjectType = formItemObjectType || graphQlLib.GraphQLString;
    if (formItem.occurrences && formItem.occurrences.maximum === 1) {
        return formItemObjectType;
    } else {
        return graphQlLib.list(formItemObjectType)
    }
}

function generateItemSetObjectType(context, namePrefix, itemSet) {
    const name = namePrefix + '_' + namingLib.generateCamelCase(itemSet.name, true);
    const createItemSetTypeParams = {
        name: context.uniqueName(name),
        description: itemSet.label,
        fields: {}
    };

    const formItems = getFormItems(itemSet.items);

    validationLib.validateUniqueNamesOfTypeFields(name, formItems);

    formItems.forEach(function (item) {
        createItemSetTypeParams.fields[namingLib.sanitizeText(item.name)] = {
            type: generateFormItemObjectType(context, namePrefix, item),
            args: generateFormItemArguments(context, item),
            resolve: generateFormItemResolveFunction(item)
        }
    });
    return graphQlLib.createObjectType(context, createItemSetTypeParams);
}

function generateInputObjectType(context, input) {
    switch (input.inputType) {
    case 'AttachmentUploader':
        return graphQlLib.reference('Attachment');
    case 'CheckBox':
        return graphQlLib.GraphQLBoolean;
    case 'ComboBox':
        return graphQlLib.GraphQLString;
    case 'ContentSelector':
        return graphQlLib.reference('Content');
    case 'CustomSelector':
        return graphQlLib.GraphQLString;
    case 'ContentTypeFilter':
        return graphQlLib.GraphQLString;
    case 'Date':
        return graphQlLib.Date;
    case 'DateTime':
        if (input.config && input.config.timezone && input.config.timezone.length && input.config.timezone[0].value === "true") {
            return graphQlLib.DateTime;
        }
        return graphQlLib.LocalDateTime;
    case 'Double':
        return graphQlLib.GraphQLFloat;
    case 'GeoPoint':
        return context.types.geoPointType;
    case 'HtmlArea':
        return context.types.richTextType;
    case 'ImageSelector':
        return graphQlLib.reference('Content');
    case 'ImageUploader':
        return context.types.mediaUploaderType;
    case 'Long':
        return graphQlLib.GraphQLInt;
    case 'MediaSelector':
        return graphQlLib.reference('Content');
    case 'MediaUploader':
        return graphQlLib.reference('Content');
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
        return graphQlLib.LocalTime;
    }

    log.warning('Unknown input type [' + input.inputType + ']. Using String as GraphQL type');
    return graphQlLib.GraphQLString;
}

function generateOptionSetObjectType(context, namePrefix, optionSet) {
    const name = namePrefix + '_' + namingLib.generateCamelCase(optionSet.name, true);
    const optionSetEnum = generateOptionSetEnum(context, optionSet, name);
    const createOptionSetTypeParams = {
        name: context.uniqueName(name),
        description: optionSet.label,
        fields: {
            _selected: {
                type: optionSet.selection.maximum === 1 ? optionSetEnum : graphQlLib.list(optionSetEnum),
                resolve: optionSet.selection.maximum === 1 ? undefined : function (env) { //TODO Fix
                    return utilLib.forceArray(env.source._selected);
                }
            }
        }
    };

    validationLib.validateUniqueNamesOfTypeFields(name, optionSet.options);

    optionSet.options.forEach(function (option) {
        createOptionSetTypeParams.fields[namingLib.sanitizeText(option.name)] = {
            type: generateOptionObjectType(context, namePrefix, option),
            resolve: function (env) {
                return env.source[option.name];
            }
        }
    });
    return graphQlLib.createObjectType(context, createOptionSetTypeParams);
}

function generateOptionSetEnum(context, optionSet, optionSetName) {
    let enumValues = {};

    let name = optionSetName + '_OptionEnum';

    validationLib.validateUniqueNamesOfTypeFields(name, optionSet.options);

    optionSet.options.forEach(function (option) {
        let optionName = namingLib.sanitizeText(option.name);
        enumValues[optionName] = option.name;
    });

    return context.schemaGenerator.createEnumType({
        name: context.uniqueName(name),
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
    if (!formItem.occurrences || formItem.occurrences.maximum !== 1) {
        args.offset = graphQlLib.GraphQLInt;
        args.first = graphQlLib.GraphQLInt;
    }
    if ('Input' === formItem.formItemType && 'HtmlArea' === formItem.inputType) {
        args.processHtml = context.types.processHtmlType;
    }
    return args;
}

function generateFormItemResolveFunction(formItem) {
    if (formItem.occurrences && formItem.occurrences.maximum === 1) {
        return function (env) {
            let value = env.source[formItem.name];

            if (value && 'HtmlArea' === formItem.inputType) {
                value = macroLib.processHtml(createProcessHtmlParams(value, env));
            }
            if (value && 'Input' === formItem.formItemType) {
                if ('AttachmentUploader' === formItem.inputType) {
                    const attachments = contentLib.getAttachments(env.source['__nodeId']);
                    if (attachments && attachments[value]) {
                        let attachment = attachments[value];
                        attachment['__nodeId'] = env.source['__nodeId'];

                        value = attachment;
                    }
                } else if (['ContentSelector', 'MediaUploader', 'ImageSelector', 'MediaSelector'].indexOf(formItem.inputType) !== -1) {
                    const content = contentLib.get({key: value});
                    if (content && content.hasOwnProperty('attachments') && Object.keys(content.attachments).length > 0) {
                        Object.keys(content.attachments).forEach((key) => {
                            content.attachments[key]['__nodeId'] = content._id;
                        });
                    }
                    value = content;
                }
            }
            return value;
        };
    } else {
        return function (env) {
            validationLib.validateArguments(env.args);
            let values = utilLib.forceArray(env.source[formItem.name]);
            if (env.args.offset != null || env.args.first != null) {
                values = values.slice(env.args.offset, env.args.first);
            }
            if ('HtmlArea' === formItem.inputType) {
                values = values.map(function (value) {
                    return macroLib.processHtml(createProcessHtmlParams(value, env));
                });
            }
            if ('Input' === formItem.formItemType) {
                if ('AttachmentUploader' === formItem.inputType) {
                    let attachments = contentLib.getAttachments(env.source['__nodeId']);
                    values = values.map(function (attachment) {
                        let attach = attachments[attachment];
                        if (attach) {
                            attach['__nodeId'] = env.source['__nodeId'];
                        }
                        return attach
                    }).filter(attachment => {
                        return attachment != null;
                    });
                } else if (['ContentSelector', 'MediaUploader', 'ImageSelector', 'MediaSelector'].indexOf(formItem.inputType) !== -1) {
                    values = values.map(function (value) {
                        let content = contentLib.get({key: value});
                        if (content && content.hasOwnProperty('attachments') && Object.keys(content.attachments).length > 0) {
                            Object.keys(content.attachments).forEach((key) => {
                                content.attachments[key]['__nodeId'] = content._id;
                            });
                        }
                        return content;
                    }).filter(function (content) {
                        return content != null
                    });
                }
            }
            return values;
        };
    }
}

function createProcessHtmlParams(html, env) {
    const params = {
        value: html,
        contentId: env.source.__nodeId,
    };
    if (env.args.processHtml) {
        params['type'] = env.args.processHtml.type;
        params['imageWidths'] = env.args.processHtml.imageWidths;
        params['imageSizes'] = env.args.processHtml.imageSizes;
    }
    return params;
}

exports.getFormItems = getFormItems;
exports.generateFormItemObjectType = generateFormItemObjectType;
exports.generateFormItemArguments = generateFormItemArguments;
exports.generateFormItemResolveFunction = generateFormItemResolveFunction;
