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

    const highlight = env.args.highlight;
    if (highlight) {
        if (highlight.properties.length < 1) {
            throw 'Highlight properties must be not empty';
        }
        highlight.properties.some(prop => {
            if (prop.propertyName == null || prop.propertyName === '') {
                throw 'Highlight propertyName is required and can not be empty';
            }
        });
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

function validateDslQuery(env) {
    validateArgumentsForQueryField(env);
    if (env.args.query) {
        validateOnlyOneFieldMustBeNotNull(env.args.query, 'DSLQuery');
        validateGraphQlDSLFields(env.args.query)
    }
}

function validateGraphQlDSLFields(dslQueryObject) {
    validateGraphQlDslBooleanExpression(dslQueryObject);
    validateDslRangeExpression(dslQueryObject);
    validateDslInExpression(dslQueryObject);
    validateDslTermExpression(dslQueryObject);
}

function validateGraphQlDslBooleanExpression(dslQueryObject) {
    if (dslQueryObject['boolean'] != null) {
        const booleanField = dslQueryObject['boolean'];
        validateOnlyOneFieldMustBeNotNull(booleanField, 'Boolean');
        Object.keys(booleanField).filter(fieldName => fieldName !== 'boost').forEach(fieldName => {
            if (booleanField[fieldName] != null) {
                booleanField[fieldName].forEach(dslQuery => validateGraphQlDSLFields(dslQuery));
            }
        });
    }
}

function validateDslTermExpression(dslQueryObject) {
    if (dslQueryObject['term'] != null) {
        const termDslExpr = dslQueryObject['term'];
        validateOnlyOneFieldMustBeNotNull(termDslExpr.value, 'Term.value');
    }
}

function validateDslRangeExpression(dslQueryObject) {
    if (dslQueryObject['range'] != null) {
        let rangeField = dslQueryObject['range'];
        if (rangeField.lt == null && rangeField.lte == null && rangeField.gt == null && rangeField.gte == null) {
            throw 'At least one range property must be specified';
        }
        if (rangeField.lt != null && rangeField.lte != null) {
            throw 'lt and lte cannot be used together.';
        }
        if (rangeField.gt != null && rangeField.gte != null) {
            throw 'gt and gte cannot be used together.';
        }
        validateOnlyOneFieldMustBeNotNull(rangeField.gt, 'Range.gt');
        validateOnlyOneFieldMustBeNotNull(rangeField.gte, 'Range.gte');
        validateOnlyOneFieldMustBeNotNull(rangeField.lt, 'Range.lt');
        validateOnlyOneFieldMustBeNotNull(rangeField.lte, 'Range.lte');

        const valueHolder = {};
        collectNameOfNonNullField(valueHolder, rangeField.gt);
        collectNameOfNonNullField(valueHolder, rangeField.gte);
        collectNameOfNonNullField(valueHolder, rangeField.lt);
        collectNameOfNonNullField(valueHolder, rangeField.lte);
        if (Object.keys(valueHolder).length > 1) {
            throw 'Range. All values must be of the same type';
        }
    }
}

function collectNameOfNonNullField(holder, valueObj) {
    if (valueObj) {
        Object.keys(valueObj).forEach(key => {
            if (valueObj[key]) {
                holder[key] = key;
            }
        })
    }
}

function validateDslInExpression(dslQueryObject) {
    if (dslQueryObject['in'] != null) {
        const inDslExpr = dslQueryObject['in'];
        const graphQlFields = Object.keys(inDslExpr).filter(graphQlField =>
            ['field', 'boost'].indexOf(graphQlField) === -1
        );
        validateOnlyOneFieldMustBeNotNullByFields(inDslExpr, graphQlFields, 'In.values');
    }
}

function validateOnlyOneFieldMustBeNotNull(projectionGraphQL, fieldName) {
    if (projectionGraphQL) {
        validateOnlyOneFieldMustBeNotNullByFields(projectionGraphQL, Object.keys(projectionGraphQL), fieldName);
    }
}

function validateOnlyOneFieldMustBeNotNullByFields(projectionGraphQL, fields, fieldName) {
    let amountOfNonNullableProperties = 0;
    fields.forEach(graphQlField => {
        if (projectionGraphQL[graphQlField] != null) {
            amountOfNonNullableProperties++;
        }
        if (amountOfNonNullableProperties > 1) {
            throw `Must be set only one field for ${fieldName}`;
        }
    });
}

exports.validateArguments = validateArguments;
exports.validateArgumentsForQueryField = validateArgumentsForQueryField;
exports.validateUniqueNamesOfTypeFields = validateUniqueNamesOfTypeFields;
exports.validateDslQuery = validateDslQuery;

