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
        nameSet: {},
        contentTypeMap: {},
        addObjectType: function (objectType) {
            this.dictionary.push(objectType);
        },
        putContentType: function (name, objectType) {
            this.contentTypeMap[name] = objectType;
        },
        uniqueName: function (name) {
            var uniqueName = name;
            if (this.nameSet[name]) {
                this.nameSet[uniqueName]++;
                uniqueName = name + '_' + this.nameSet[uniqueName];
            } else {
                this.nameSet[uniqueName] = 1;
            }
            return uniqueName;
        }
    };
}