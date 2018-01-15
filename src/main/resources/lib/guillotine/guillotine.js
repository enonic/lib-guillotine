var contentApiLib = require('./content-api');

exports.createContentApi = function (context) {
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