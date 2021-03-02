const contentTypesLib = require('/lib/guillotine/dynamic/content-types');

function createTypes(context) {
    contentTypesLib.createContentTypeTypes(context);
}

exports.createTypes = createTypes;
