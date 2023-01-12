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

function createDslQuery(inputQueryDsl) {
    let queryDsl = {};

    createDslMatchAll(queryDsl, inputQueryDsl.matchAll);
    createDslTermExpression(queryDsl, inputQueryDsl.term);
    createDslLikeExpression(queryDsl, inputQueryDsl.like);
    createDslInExpression(queryDsl, inputQueryDsl.in);
    createDslRangeExpression(queryDsl, inputQueryDsl.range);
    createDslPathMatchExpression(queryDsl, inputQueryDsl.pathMatch);
    createDslExistsExpression(queryDsl, inputQueryDsl.exists);
    createDslStringExpression(queryDsl, inputQueryDsl.fulltext, 'fulltext');
    createDslStringExpression(queryDsl, inputQueryDsl.ngram, 'ngram');
    createDslStemmedExpression(queryDsl, inputQueryDsl.stemmed);
    createDslBooleanExpression(queryDsl, inputQueryDsl.boolean);

    return queryDsl;
}

function createDslMatchAll(holder, expression) {
    if (expression) {
        let matchAll = {};
        if (expression.boost) {
            matchAll.boost = expression.boost;
        }
        holder.matchAll = matchAll;
    }
}

function setTypeBaseOnValue(source, target) {
    if (source.localTime) {
        target.type = 'time';
    }
    if (source.localDate || source.localDateTime || source.instant) {
        target.type = 'dateTime';
    }
}

function setTypeBaseOnValueForInExpression(source, target) {
    if (source.localTimeValues) {
        target.type = 'time';
    }
    if (source.localDateValues || source.localDateTimeValues || source.instantValues) {
        target.type = 'dateTime';
    }
}

function createDslTermExpression(holder, expression) {
    if (expression) {
        let dslExpression = {
            field: expression.field,
            value: extractPropertyValue(expression.value),
        };
        setTypeBaseOnValue(expression.value, dslExpression);
        if (expression.boost) {
            dslExpression.boost = expression.boost;
        }
        holder.term = dslExpression;
    }
}

function createDslInExpression(holder, expression) {
    if (expression) {
        let dslExpression = {
            field: expression.field,
            values: extractPropertyValues(expression),
        };
        setTypeBaseOnValueForInExpression(expression, dslExpression);
        if (expression.boost) {
            dslExpression.boost = expression.boost;
        }
        holder.in = dslExpression;
    }
}

function createDslLikeExpression(holder, expression) {
    if (expression) {
        let dslExpression = {
            field: expression.field,
            value: expression.value,
        };
        if (expression.boost) {
            dslExpression.boost = expression.boost;
        }
        holder.like = dslExpression;
    }
}

function createDslRangeExpression(holder, expression) {
    if (expression) {
        let rangeExpression = {
            field: expression.field,
        };
        if (expression.lt) {
            rangeExpression.lt = extractPropertyValue(expression.lt);
        }
        if (expression.lte) {
            rangeExpression.lte = extractPropertyValue(expression.lte);
        }
        if (expression.gt) {
            rangeExpression.gt = extractPropertyValue(expression.gt);
        }
        if (expression.gte) {
            rangeExpression.gte = extractPropertyValue(expression.gte);
        }
        if (expression.boost) {
            rangeExpression.boost = expression.boost;
        }

        // all properties must be of the same type, so will be enough to obtain value from first non-null
        [expression.lt, expression.lte, expression.gt, expression.gte].some(item => {
            if (item) {
                setTypeBaseOnValue(item, rangeExpression);
                return true;
            }
        });

        holder.range = rangeExpression;
    }
}

function createDslPathMatchExpression(holder, expression) {
    if (expression) {
        let dslExpression = {
            field: expression.field,
            path: expression.path,
        };
        if (expression.minimumMatch) {
            dslExpression.minimumMatch = expression.minimumMatch;
        }
        if (expression.boost) {
            dslExpression.boost = expression.boost;
        }
        holder.pathMatch = dslExpression;
    }
}

function createDslExistsExpression(holder, expression) {
    if (expression) {
        let dslExpression = {
            field: expression.field,
        };
        if (expression.boost) {
            dslExpression.boost = expression.boost;
        }
        holder.exists = dslExpression;
    }
}

function createDslStringExpression(holder, expression, expressionName) {
    if (expression) {
        let dslExpression = {
            fields: expression.fields,
            query: expression.query,
        };
        if (expression.operator) {
            dslExpression.operator = expression.operator;
        }
        holder[expressionName] = dslExpression;
    }
}

function createDslStemmedExpression(holder, expression) {
    if (expression) {
        let dslExpression = {
            fields: expression.fields,
            query: expression.query,
        };
        if (expression.operator) {
            dslExpression.operator = expression.operator;
        }
        if (expression.language) {
            dslExpression.language = expression.language;
        }
        if (expression.boost) {
            dslExpression.boost = expression.boost;
        }
        holder.stemmed = dslExpression;
    }
}

function createDslBooleanExpression(holder, expression) {
    if (expression) {
        let dslExpression = {};
        if (expression.should) {
            dslExpression.should = [];
            (expression.should || []).forEach(boolExpression => dslExpression.should.push(createDslQuery(boolExpression)))
        } else if (expression.must) {
            dslExpression.must = [];
            (expression.must || []).forEach(boolExpression => dslExpression.must.push(createDslQuery(boolExpression)))
        } else if (expression.mustNot) {
            dslExpression.mustNot = [];
            (expression.mustNot || []).forEach(boolExpression => dslExpression.mustNot.push(createDslQuery(boolExpression)))
        } else if (expression.filter) {
            dslExpression.filter = [];
            (expression.filter || []).forEach(boolExpression => dslExpression.filter.push(createDslQuery(boolExpression)))
        } else {
            throw 'Must be set property for boolean expression';
        }
        holder.boolean = dslExpression;
    }
}

function extractPropertyValues(graphQLValue) {
    if (graphQLValue.stringValues) {
        return graphQLValue.stringValues;
    }
    if (graphQLValue.doubleValues) {
        return graphQLValue.doubleValues;
    }
    if (graphQLValue.longValues) {
        return graphQLValue.longValues;
    }
    if (graphQLValue.booleanValues) {
        return graphQLValue.booleanValues;
    }
    if (graphQLValue.localDateValues) {
        return graphQLValue.localDateValues;
    }
    if (graphQLValue.localDateTimeValues) {
        return graphQLValue.localDateTimeValues;
    }
    if (graphQLValue.localTimeValues) {
        return graphQLValue.localTimeValues;
    }
    if (graphQLValue.instantValues) {
        return graphQLValue.instantValues;
    }
    throw 'Values must be not null';
}

function extractPropertyValue(graphQLValue) {
    if (graphQLValue.string) {
        return graphQLValue.string;
    }
    if (graphQLValue.double != null) {
        return graphQLValue.double;
    }
    if (graphQLValue.long != null) {
        return graphQLValue.long;
    }
    if (graphQLValue.boolean != null) {
        return graphQLValue.boolean;
    }
    if (graphQLValue.localDate) {
        return graphQLValue.localDate;
    }
    if (graphQLValue.localDateTime) {
        return graphQLValue.localDateTime;
    }
    if (graphQLValue.localTime) {
        return graphQLValue.localTime;
    }
    if (graphQLValue.instant) {
        return graphQLValue.instant;
    }
    throw 'Value must be not null';
}

function createDslSort(inputSortDsl) {
    let sortDsl = [];

    (inputSortDsl || []).forEach(sort => {
        let sortItem = {
            field: sort.field,
        };
        if (sort.direction) {
            sortItem.direction = sort.direction;
        }
        if (sort.location) {
            sortItem.location = {
                lat: sort.location.lat,
                lon: sort.location.lon,
            };
        }
        if (sort.unit) {
            sortItem.unit = sort.unit;
        }
        sortDsl.push(sortItem);
    });

    return sortDsl;
}

function createHighlightProperties(inputHighlight) {
    const result = {};
    inputHighlight.properties.forEach(highlightProperty => {
        const propertyData = {};
        Object.keys(highlightProperty).filter(prop => prop !== 'propertyName').forEach(prop => {
            if (highlightProperty[prop] != null) {
                propertyData[prop] = highlightProperty[prop];
            }
        });
        result[highlightProperty['propertyName']] = propertyData;
    });
    return result;
}

function createHighlight(inputHighlight) {
    const highlight = {};
    Object.keys(inputHighlight).forEach(key => {
        if (inputHighlight[key] != null) {
            highlight[key] = inputHighlight[key];
        }
    });
    highlight.properties = createHighlightProperties(inputHighlight);
    return highlight;
}

exports.createAggregation = createAggregation;
exports.createFilters = createFilters;
exports.createDslQuery = createDslQuery;
exports.createDslSort = createDslSort;
exports.createHighlight = createHighlight;
