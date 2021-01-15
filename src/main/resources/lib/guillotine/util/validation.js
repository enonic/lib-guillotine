const namingLib = require('/lib/guillotine/util/naming');

const guillotineConstants = require('/lib/guillotine/util/constants');

const firstArgumentMaxValue = 1000;

function validateArguments(args) {
    if (args) {
        if (args.first && (args.first < 0 || args.first > firstArgumentMaxValue)) {
            throw "Invalid field argument first: The value must be between 0 and " + firstArgumentMaxValue;
        }
    }
}

function validateArgumentsForQueryField(env) {
    validateArguments(env.args);

    if (env.args.aggregations) {
        env.args.aggregations.forEach(aggregation => validateAggregation(aggregation));
    }
}

function validateAggregation(aggregation) {
    if (!aggregation.name) {
        throw "The 'name' field of Aggregation type is mandatory";
    }

    let numberOfAggregations = 0;

    guillotineConstants.getSupportedAggregations().forEach(aggregationName => {
        if (aggregation.hasOwnProperty(aggregationName)) {
            numberOfAggregations++;
        }
    });

    if (numberOfAggregations === 0 || numberOfAggregations > 1) {
        throw "Aggregation must have only one type of aggregations from (" + supportedAggregations.join(", ") + ")";
    }

    if (aggregation.hasOwnProperty("subAggregations")) {
        aggregation.subAggregations.forEach(subAggregation => validateAggregation(subAggregation));
    }
}

function validateUniqueNamesOfTypeFields(typeName, items) {
    let obj = {};

    items.forEach(function (item) {
        obj[namingLib.sanitizeText(item.name)] = item.name;
    });

    if (items.length !== Object.keys(obj).length) {
        throw new Error(`Type ${typeName} has fields with not unique names`);
    }
}

exports.validateArguments = validateArguments;
exports.validateArgumentsForQueryField = validateArgumentsForQueryField;
exports.validateUniqueNamesOfTypeFields = validateUniqueNamesOfTypeFields;
