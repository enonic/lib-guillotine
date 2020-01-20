var graphQlLib = require('./graphql');
var rootQueryLib = require('./root-query');
var rootSubscriptionLib = require('./root-subscription');
var contentApiLib = require('./content-api');
var contentTypesLib = require('./content-types');
var enumTypesLib = require('./enum-types');
var genericTypesLib = require('./generic/generic-types');
var inputTypesLib = require('./input-types');

exports.createSchema = createSchema;
exports.createHeadlessCmsType = createContentApi;
exports.createContext = createContext;

function createSchema(options) {
    var context = createContext(options);
    createTypes(context);
    return graphQlLib.createSchema({
        query: rootQueryLib.createRootQueryType(context),
        subscription: rootSubscriptionLib.createRootSubscriptionType(context),
        dictionary: context.dictionary
    });
}

function createContentApi(context) {
    createTypes(context);
    return contentApiLib.createContentApiType(context || createContext());
}

function createTypes(context) {
    enumTypesLib.createEnumTypes(context);
    inputTypesLib.createInputTypes(context);
    genericTypesLib.createGenericTypes(context);
    contentTypesLib.createContentTypeTypes(context);
}

function createContext(options) {
    const context = {
        types: {},
        dictionary: [],
        nameCountMap: {},
        contentTypeMap: {},
        options: {},
        addDictionaryType: function (objectType) {
            this.dictionary.push(objectType);
        },
        putContentTypeType: function (name, objectType) {
            this.contentTypeMap[name] = objectType;
        },
        uniqueName: function (name) {
            var uniqueName = name;
            if (this.nameCountMap[name]) {
                this.nameCountMap[uniqueName]++;
                uniqueName = name + '_' + this.nameCountMap[uniqueName];
            } else {
                this.nameCountMap[uniqueName] = 1;
            }
            return uniqueName;
        },
        getOption: function (name) {
            return this.options[name];
        },
        putOption: function (name, value) {
            this.options[name] = value;
        }
    };

    if (options) {
        for (var optionKey in options) {
            context.options[optionKey] = options[optionKey];
        }
    }
    context.options.applications = context.options.applications || [app.name];
    context.options.allowPaths = context.options.allowPaths || [];

    return context;
}