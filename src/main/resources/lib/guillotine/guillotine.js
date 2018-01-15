var contentApiLib = require('./content-api');
var contentTypesLib = require('./content-types');
var enumTypesLib = require('./enum-types');
var genericTypesLib = require('./generic-types');
var inputTypesLib = require('./input-types');

exports.createContentApi = function (context) {
    enumTypesLib.createEnumTypes(context);
    inputTypesLib.createInputTypes(context);
    genericTypesLib.createGenericTypes(context);
    contentTypesLib.createContentTypeTypes(context);
    return contentApiLib.createContentApiType(context || createContext());
};

exports.createContext = createContext;

function createContext() {
    return {
        types: {},
        dictionary: [],
        nameCountMap: {},
        contentTypeMap: {},
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
        }
    };
}