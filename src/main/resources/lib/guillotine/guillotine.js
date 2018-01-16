var graphQlLib = require('./graphql');
var rootQueryLib = require('./root-query');
var contentApiLib = require('./content-api');
var contentTypesLib = require('./content-types');
var enumTypesLib = require('./enum-types');
var genericTypesLib = require('./generic-types');
var inputTypesLib = require('./input-types');

exports.createSchema = createSchema;
exports.createContentApi = createContentApi;
exports.createContext = createContext;

function createSchema(options) {
    var context = createContext();
    for (var optionKey in options) {
        context.options[optionKey] = options[optionKey];
    }

    createTypes(context);
    return graphQlLib.createSchema({
        query: rootQueryLib.createRootQueryType(context),
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

function createContext() {
    return {
        types: {},
        dictionary: [],
        nameCountMap: {},
        contentTypeMap: {},
        options: {
            applicationFilter: [app.name]
        },
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
}