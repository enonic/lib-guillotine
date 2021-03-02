const enumTypesLib = require('/lib/guillotine/generic/enum-types');
const inputTypesLib = require('/lib/guillotine/generic/input-types');
const genericTypesLib = require('/lib/guillotine/generic/generic-types');

function createTypes(context) {
    enumTypesLib.createEnumTypes(context);
    inputTypesLib.createInputTypes(context);
    genericTypesLib.createGenericTypes(context);
}

exports.createTypes = createTypes;
