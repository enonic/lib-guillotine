const contentLib = require('/lib/xp/content');
const urlResolverLib = require('/lib/guillotine/util/url-helper');

const graphQlLib = require('/lib/guillotine/graphql');
const genericTypesLib = require('/lib/guillotine/generic/generic-types');
const formLib = require('/lib/guillotine/dynamic/form');
const namingLib = require('/lib/guillotine/util/naming');

const mediaContentTypeRegexp = /^media:/;
const imageContentTypeRegexp = /^media:image$/;

exports.createContentTypeTypes = function (context) {

    //For each content type
    exports.getAllowedContentTypes(context).forEach(function (contentType) {

        //Generates the object type for this content type
        var contentTypeObjectType = generateContentTypeObjectType(context, contentType);
        context.addDictionaryType(contentTypeObjectType);
    });
};

exports.getAllowedContentTypes = function (context) {
    var allowedContentTypeRegexp = generateAllowedContentTypeRegexp(context);
    return contentLib.getTypes().filter(function (contentType) {
        return contentType.name.match(allowedContentTypeRegexp);
    });
};

exports.getAllowedContentType = function (context, name) {
    var allowedContentTypeRegexp = generateAllowedContentTypeRegexp(context);
    var contentType = contentLib.getType(name);
    return contentType && contentType.name.match(allowedContentTypeRegexp) ? contentType : null;
};

function generateAllowedContentTypeRegexp(context) {
    var applicationKeys = context.options.applications.map(function (applicationKey) {
        return '|' + applicationKey.replace(/\./g, '\\.');
    }).join('');
    return new RegExp('^(?:base|media|portal' + applicationKeys + '):');
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

    createContentTypeTypeParams.fields.data = formLib.getFormItems(contentType.form).length > 0 ? {
        type: generateContentDataObjectType(context, contentType)
    } : undefined;

    var contentTypeObjectType = graphQlLib.createContentObjectType(context, createContentTypeTypeParams);
    context.putContentTypeType(contentType.name, contentTypeObjectType);
    return contentTypeObjectType;
}

function addMediaFields(context, createContentTypeTypeParams) {
    createContentTypeTypeParams.fields.mediaUrl = {
        type: graphQlLib.GraphQLString,
        args: {
            download: graphQlLib.GraphQLBoolean,
            type: context.types.urlType,
            params: graphQlLib.GraphQLString
        },
        resolve: function (env) {
            return urlResolverLib.resolveAttachmentUrlById(env);
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
            type: context.types.urlType,
            params: graphQlLib.GraphQLString
        },
        resolve: function (env) {
            return urlResolverLib.resolveImageUrl(env);
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
    formLib.getFormItems(contentType.form).forEach(function (formItem) {

        //Creates a data field corresponding to this form item
        createContentTypeDataTypeParams.fields[namingLib.sanitizeText(formItem.name)] = {
            type: formLib.generateFormItemObjectType(context, generateContentTypeName(contentType), formItem),
            args: formLib.generateFormItemArguments(context, formItem),
            resolve: formLib.generateFormItemResolveFunction(formItem)
        }
    });
    return graphQlLib.createObjectType(context, createContentTypeDataTypeParams);
}


function generateContentTypeName(contentType) {
    var splitContentTypeName = contentType.name.split(':');
    var applicationName = splitContentTypeName[0];
    var contentTypeLabel = splitContentTypeName[1];
    return namingLib.sanitizeText(applicationName) + '_' + namingLib.generateCamelCase(contentTypeLabel, true);
}


