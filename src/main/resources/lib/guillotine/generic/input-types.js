const graphQlLib = require('/lib/guillotine/graphql');

function createInputTypes(context) {
    context.types.processHtmlType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('ProcessHtmlInput'),
        description: 'Process HTML input type',
        fields: {
            type: {
                type: context.types.urlType
            },
            imageWidths: {
                type: graphQlLib.list(graphQlLib.GraphQLInt)
            },
            imageSizes: {
                type: graphQlLib.GraphQLString
            }
        }
    });

    context.types.numberRangeInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('NumberRangeInput'),
        description: 'Number range input type',
        fields: {
            key: {
                type: graphQlLib.GraphQLString
            },
            from: {
                type: graphQlLib.GraphQLFloat
            },
            to: {
                type: graphQlLib.GraphQLFloat
            }
        }
    });

    context.types.dateRangeInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('DateRangeInput'),
        description: 'Date range input type',
        fields: {
            key: {
                type: graphQlLib.GraphQLString
            },
            from: {
                type: graphQlLib.GraphQLString
            },
            to: {
                type: graphQlLib.GraphQLString
            }
        }
    });


    context.types.geoPointInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('GeoPointInput'),
        description: 'Geo range input type',
        fields: {
            lat: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            },
            lon: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            }
        }
    });

    context.types.termsAggregationInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('TermsAggregationInput'),
        description: 'Terms aggregation input type',
        fields: {
            field: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            },
            order: {
                type: graphQlLib.GraphQLString
            },
            size: {
                type: graphQlLib.GraphQLInt,
            },
            minDocCount: {
                type: graphQlLib.GraphQLInt
            }
        }
    });

    context.types.statsAggregationInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('StatsAggregationInput'),
        description: 'Stats aggregation input type',
        fields: {
            field: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            }
        }
    });

    context.types.rangeAggregationInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('RangeAggregationInput'),
        description: 'Range aggregation input type',
        fields: {
            field: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            },
            ranges: {
                type: graphQlLib.list(context.types.numberRangeInputType)
            }
        }
    });

    context.types.dateRangeAggregationInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('DateRangeAggregationInput'),
        description: 'DateRange aggregation input type',
        fields: {
            field: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            },
            format: {
                type: graphQlLib.GraphQLString
            },
            ranges: {
                type: graphQlLib.list(context.types.dateRangeInputType)
            }
        }
    });

    context.types.dateHistogramAggregationInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('DateHistogramAggregationInput'),
        description: 'DateHistogram aggregation input type',
        fields: {
            field: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            },
            interval: {
                type: graphQlLib.GraphQLString
            },
            format: {
                type: graphQlLib.GraphQLString
            },
            minDocCount: {
                type: graphQlLib.GraphQLInt
            }
        }
    });

    context.types.geoDistanceAggregationInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('GeoDistanceAggregationInput'),
        description: 'GeoDistance aggregation input type',
        fields: {
            field: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            },
            unit: {
                type: graphQlLib.GraphQLString
            },
            origin: {
                type: graphQlLib.nonNull(context.types.geoPointInputType)
            },
            ranges: {
                type: graphQlLib.nonNull(graphQlLib.list(context.types.numberRangeInputType))
            }
        }
    });

    context.types.minAggregationInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('MinAggregationInput'),
        description: 'MinAggregation input type',
        fields: {
            field: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            }
        }
    });

    context.types.maxAggregationInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('MaxAggregationInput'),
        description: 'MaxAggregation input type',
        fields: {
            field: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            }
        }
    });

    context.types.valueCountAggregationInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('ValueCountAggregationInput'),
        description: 'ValueCount Aggregation input type',
        fields: {
            field: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            }
        }
    });

    context.types.aggregationInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('AggregationInput'),
        description: 'Aggregation input type',
        fields: {
            subAggregations: {
                type: graphQlLib.list(graphQlLib.reference('AggregationInput'))
            },
            name: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            },
            terms: {
                type: context.types.termsAggregationInputType
            },
            stats: {
                type: context.types.statsAggregationInputType
            },
            range: {
                type: context.types.rangeAggregationInputType
            },
            dateRange: {
                type: context.types.dateRangeAggregationInputType
            },
            dateHistogram: {
                type: context.types.dateHistogramAggregationInputType
            },
            geoDistance: {
                type: context.types.geoDistanceAggregationInputType
            },
            min: {
                type: context.types.minAggregationInputType
            },
            max: {
                type: context.types.maxAggregationInputType
            },
            count: {
                type: context.types.valueCountAggregationInputType
            }
        }
    });

    context.types.existsFilterInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('ExistsFilterInput'),
        description: 'ExistsFilter input type',
        fields: {
            field: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            }
        }
    });

    context.types.notExistsFilterInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('NotExistsFilterInput'),
        description: 'NotExistsFilter input type',
        fields: {
            field: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            }
        }
    });

    context.types.hasValueFilterInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('HasValueFilterInput'),
        description: 'HasValueFilter input type',
        fields: {
            field: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            },
            stringValues: {
                type: graphQlLib.list(graphQlLib.GraphQLString)
            },
            intValues: {
                type: graphQlLib.list(graphQlLib.GraphQLInt)
            },
            floatValues: {
                type: graphQlLib.list(graphQlLib.GraphQLFloat)
            },
            booleanValues: {
                type: graphQlLib.list(graphQlLib.GraphQLBoolean)
            }
        }
    });

    context.types.idsFilterInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('IdsFilterInput'),
        description: 'IdsFilter input type',
        fields: {
            values: {
                type: graphQlLib.list(graphQlLib.GraphQLString)
            }
        }
    });

    context.types.booleanFilterInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('BooleanFilterInput'),
        description: 'BooleanFilter input type',
        fields: {
            must: {
                type: graphQlLib.list(graphQlLib.reference('FilterInput'))
            },
            mustNot: {
                type: graphQlLib.list(graphQlLib.reference('FilterInput'))
            },
            should: {
                type: graphQlLib.list(graphQlLib.reference('FilterInput'))
            }
        }
    });

    context.types.filterInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('FilterInput'),
        description: 'Filter input type',
        fields: {
            boolean: {
                type: context.types.booleanFilterInputType
            },
            exists: {
                type: context.types.existsFilterInputType
            },
            notExists: {
                type: context.types.notExistsFilterInputType
            },
            hasValue: {
                type: context.types.hasValueFilterInputType
            },
            ids: {
                type: context.types.idsFilterInputType
            }
        }
    });

    context.types.dslExpressionValueInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('DSLExpressionValueInput'),
        description: 'DSLExpressionValueInput type',
        fields: {
            string: {
                type: graphQlLib.GraphQLString,
            },
            double: {
                type: graphQlLib.GraphQLFloat,
            },
            long: {
                type: graphQlLib.GraphQLInt,
            },
            boolean: {
                type: graphQlLib.GraphQLBoolean,
            },
            localDate: {
                type: graphQlLib.Date,
            },
            localDateTime: {
                type: graphQlLib.LocalDateTime,
            },
            localTime: {
                type: graphQlLib.LocalTime,
            },
            instant: {
                type: graphQlLib.DateTime,
            },
        }
    });

    context.types.termExpressionDslInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('TermDSLExpressionInput'),
        description: 'TermDSLExpressionInput type',
        fields: {
            field: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString),
            },
            boost: {
                type: graphQlLib.GraphQLFloat,
            },
            value: {
                type: graphQlLib.nonNull(context.types.dslExpressionValueInputType),
            },
        },
    });

    context.types.likeDslExpressionInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('LikeDSLExpressionInput'),
        description: 'LikeDSLExpressionInput type',
        fields: {
            field: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString),
            },
            boost: {
                type: graphQlLib.GraphQLFloat,
            },
            value: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString),
            },
        }
    });

    context.types.inDslExpressionInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('InDSLExpressionInput'),
        description: 'InDSLExpressionInput type',
        fields: {
            field: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString),
            },
            boost: {
                type: graphQlLib.GraphQLFloat,
            },
            stringValues: {
                type: graphQlLib.list(graphQlLib.GraphQLString),
            },
            doubleValues: {
                type: graphQlLib.list(graphQlLib.GraphQLFloat),
            },
            longValues: {
                type: graphQlLib.list(graphQlLib.GraphQLInt),
            },
            booleanValues: {
                type: graphQlLib.list(graphQlLib.GraphQLBoolean),
            },
            localDateValues: {
                type: graphQlLib.list(graphQlLib.Date),
            },
            localDateTimeValues: {
                type: graphQlLib.list(graphQlLib.LocalDateTime),
            },
            localTimeValues: {
                type: graphQlLib.list(graphQlLib.LocalTime),
            },
            instantValues: {
                type: graphQlLib.list(graphQlLib.DateTime),
            },
        }
    });

    context.types.existsDslExpressionInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('ExistsDSLExpressionInput'),
        description: 'ExistsDSLExpressionInput type',
        fields: {
            field: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString),
            },
            boost: {
                type: graphQlLib.GraphQLFloat,
            },
        }
    });

    context.types.stemmedDslExpressionInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('StemmedDSLExpressionInput'),
        description: 'StemmedDSLExpressionInput type',
        fields: {
            fields: {
                type: graphQlLib.nonNull(graphQlLib.list(graphQlLib.GraphQLString)),
            },
            query: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString),
            },
            language: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString),
            },
            operator: {
                type: context.types.dslOperatorType,
            },
            boost: {
                type: graphQlLib.GraphQLFloat,
            },
        }
    });

    context.types.fulltextDslExpressionInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('FulltextDSLExpressionInput'),
        description: 'FulltextDSLExpressionInput type',
        fields: {
            fields: {
                type: graphQlLib.nonNull(graphQlLib.list(graphQlLib.GraphQLString)),
            },
            query: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString),
            },
            operator: {
                type: context.types.dslOperatorType,
            },
        }
    });

    context.types.ngramDslExpressionInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('NgramDSLExpressionInput'),
        description: 'NgramDSLExpressionInput type',
        fields: {
            fields: {
                type: graphQlLib.nonNull(graphQlLib.list(graphQlLib.GraphQLString)),
            },
            query: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString),
            },
            operator: {
                type: context.types.dslOperatorType,
            },
        }
    });

    context.types.pathMatchDslExpressionInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('PathMatchDSLExpressionInput'),
        description: 'PathMatchDSLExpressionInput type',
        fields: {
            field: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString),
            },
            path: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString),
            },
            minimumMatch: {
                type: graphQlLib.GraphQLInt,
            },
            boost: {
                type: graphQlLib.GraphQLFloat,
            },
        }
    });

    context.types.matchAllDslExpressionInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('MatchAllDSLExpressionInput'),
        description: 'MatchAllDSLExpressionInput type',
        fields: {
            boost: {
                type: graphQlLib.GraphQLFloat,
            }
        }
    });

    context.types.rangeDslExpressionInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('RangeDSLExpressionInput'),
        description: 'RangeDSLExpressionInput type',
        fields: {
            field: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString),
            },
            lt: {
                type: context.types.dslExpressionValueInputType,
            },
            lte: {
                type: context.types.dslExpressionValueInputType,
            },
            gt: {
                type: context.types.dslExpressionValueInputType,
            },
            gte: {
                type: context.types.dslExpressionValueInputType,
            },
            boost: {
                type: graphQlLib.GraphQLFloat,
            },
        }
    });

    context.types.booleanExpressionDslInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('BooleanDSLExpressionInput'),
        description: 'BooleanDSLExpressionInput type',
        fields: {
            should: {
                type: graphQlLib.list(graphQlLib.reference('QueryDSLInput')),
            },
            must: {
                type: graphQlLib.list(graphQlLib.reference('QueryDSLInput')),
            },
            mustNot: {
                type: graphQlLib.list(graphQlLib.reference('QueryDSLInput')),
            },
            filter: {
                type: graphQlLib.list(graphQlLib.reference('QueryDSLInput')),
            },
            boost: {
                type: graphQlLib.GraphQLFloat,
            },
        }
    });

    context.types.queryDslInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('QueryDSLInput'),
        description: 'QueryDSLInput type',
        fields: {
            boolean: {
                type: context.types.booleanExpressionDslInputType,
            },
            ngram: {
                type: context.types.ngramDslExpressionInputType,
            },
            stemmed: {
                type: context.types.stemmedDslExpressionInputType,
            },
            fulltext: {
                type: context.types.fulltextDslExpressionInputType,
            },
            matchAll: {
                type: context.types.matchAllDslExpressionInputType,
            },
            pathMatch: {
                type: context.types.pathMatchDslExpressionInputType,
            },
            range: {
                type: context.types.rangeDslExpressionInputType,
            },
            term: {
                type: context.types.termExpressionDslInputType,
            },
            like: {
                type: context.types.likeDslExpressionInputType,
            },
            in: {
                type: context.types.inDslExpressionInputType,
            },
            exists: {
                type: context.types.existsDslExpressionInputType,
            },
        }
    });

    context.types.geoPointDslInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('GeoPointSortDslInput'),
        description: 'GeoPoint Sort Dsl input type',
        fields: {
            lat: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLFloat),
            },
            lon: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLFloat),
            },
        }
    });

    context.types.sortDslInputType = context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('SortDslInput'),
        description: 'Sort Dsl input type',
        fields: {
            field: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString),
            },
            direction: {
                type: context.types.dslSortDirectionType,
            },
            location: {
                type: context.types.geoPointDslInputType,
            },
            unit: {
                type: context.types.dslGeoPointDistanceType,
            },
        }
    });

    const highlightCommonFields = createHighlightCommonFields(context);

    context.types.highlightPropertiesInputType = createHighlightPropertiesInputType(context, highlightCommonFields);

    context.types.highlightInputType = createHighlightInputType(context, highlightCommonFields);
}

function createHighlightCommonFields(context) {
    return {
        fragmenter: {
            type: context.types.highlightFragmenterType,
        },
        fragmentSize: {
            type: graphQlLib.GraphQLInt,
        },
        noMatchSize: {
            type: graphQlLib.GraphQLInt,
        },
        numberOfFragments: {
            type: graphQlLib.GraphQLInt,
        },
        order: {
            type: context.types.highlightOrderType,
        },
        preTag: {
            type: graphQlLib.GraphQLString,
        },
        postTag: {
            type: graphQlLib.GraphQLString,
        },
        requireFieldMatch: {
            type: graphQlLib.GraphQLBoolean,
        },
    }
}

function createHighlightPropertiesInputType(context, highlightCommonFields) {
    const fields = Object.create(highlightCommonFields);
    fields.propertyName = {
        type: graphQlLib.nonNull(graphQlLib.GraphQLString),
    };

    return context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('HighlightPropertiesInputType'),
        description: 'HighlightProperties input type',
        fields: fields,
    });
}

function createHighlightInputType(context, highlightCommonFields) {
    const fields = Object.create(highlightCommonFields);
    fields.properties = {
        type: graphQlLib.nonNull(graphQlLib.list(context.types.highlightPropertiesInputType)),
    };
    fields.encoder = {
        type: context.types.highlightEncoderType,
    };
    fields.tagsSchema = {
        type: context.types.highlightTagsSchemaType,
    };
    return context.schemaGenerator.createInputObjectType({
        name: context.uniqueName('HighlightInputType'),
        description: 'Highlight input type',
        fields: fields,
    });
}

exports.createInputTypes = createInputTypes;
