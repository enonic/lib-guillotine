const guillotineConstants = require('/lib/guillotine/util/constants');

function createAggregation(holder, aggregation) {
    holder[aggregation.name] = {};

    guillotineConstants.getSupportedAggregations().some(aggregationName => {
        if (aggregation.hasOwnProperty(aggregationName)) {
            holder[aggregation.name][aggregationName] = aggregation[aggregationName];
            return true;
        }
    });

    if (aggregation.subAggregations && aggregation.subAggregations.length > 0) {
        holder[aggregation.name]['aggregations'] = {};

        aggregation.subAggregations.forEach(subAggregation => {
            createAggregation(holder[aggregation.name]['aggregations'], subAggregation);
        });
    }

    return holder;
}

function createFilters(inputFilters) {
    return inputFilters && inputFilters.length > 0 ? inputFilters.map(inputFilter => {
        let filter = {};

        Object.keys(inputFilter).forEach(filterName => {
            if (filterName === "hasValue") {
                filter.hasValue = processHasValueFilter(inputFilter);
            } else if (filterName === "boolean") {
                filter.boolean = processBooleanFilter(inputFilter);
            } else {
                filter[filterName] = inputFilter[filterName];
            }
        });

        return filter;
    }) : [];
}

function processHasValueFilter(inputFilter) {
    let hasValueFilter = inputFilter.hasValue;

    if (hasValueFilter.hasOwnProperty('field') && Object.keys(hasValueFilter).length > 2) {
        throw "HasValueFilter must have only one type of values from (\"stringValues, intValues, floatValues and booleanValues\")";
    }

    let filter = {
        field: hasValueFilter['field']
    };

    ["stringValues", "intValues", "floatValues", "booleanValues"].some(fieldName => {
        if (hasValueFilter.hasOwnProperty(fieldName)) {
            filter['values'] = hasValueFilter[fieldName];
            return true;
        }
    });

    return filter;
}

function processBooleanFilter(inputFilter) {
    let booleanFilter = {};

    if (inputFilter.boolean.hasOwnProperty('must')) {
        booleanFilter.must = createFilters(inputFilter.boolean.must);
    }
    if (inputFilter.boolean.hasOwnProperty('mustNot')) {
        booleanFilter.mustNot = createFilters(inputFilter.boolean.mustNot);
    }
    if (inputFilter.boolean.hasOwnProperty('should')) {
        booleanFilter.should = createFilters(inputFilter.boolean.should);
    }

    return booleanFilter;
}

exports.createAggregation = createAggregation;
exports.createFilters = createFilters;
