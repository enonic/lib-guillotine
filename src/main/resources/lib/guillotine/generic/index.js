const enumTypesLib = require('/lib/guillotine/generic/enum-types');
const inputTypesLib = require('/lib/guillotine/generic/input-types');
const genericTypesLib = require('/lib/guillotine/generic/generic-types');

function createTypes(schemaGenerator, context) {
    enumTypesLib.createEnumTypes(schemaGenerator, context);
    inputTypesLib.createInputTypes(schemaGenerator, context);
    genericTypesLib.createGenericTypes(schemaGenerator, context);
}

exports.createTypes = createTypes;
