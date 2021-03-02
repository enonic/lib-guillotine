const contentTypesLib = require('/lib/guillotine/dynamic/content-types');

function createTypes(schemaGenerator, context) {
    contentTypesLib.createContentTypeTypes(schemaGenerator, context);
}

exports.createTypes = createTypes;
