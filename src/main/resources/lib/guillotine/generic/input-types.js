const graphQlLib = require('/lib/guillotine/graphql');

function createInputTypes(context) {
    context.types.processHtmlType = graphQlLib.createInputObjectType({
        name: context.uniqueName('ProcessHtmlInput'),
        description: 'Process HTML input type',
        fields: {
            'type': {
                type: context.types.urlType
            }
        }
    });

    context.types.numberRangeInputType = graphQlLib.createInputObjectType({
        name: context.uniqueName('NumberRangeInput'),
        description: 'Number range input type',
        fields: {
            from: {
                type: graphQlLib.GraphQLFloat
            },
            to: {
                type: graphQlLib.GraphQLFloat
            }
        }
    });

    context.types.dateRangeInputType = graphQlLib.createInputObjectType({
        name: context.uniqueName('DateRangeInput'),
        description: 'Date range input type',
        fields: {
            from: {
                type: graphQlLib.GraphQLString
            },
            to: {
                type: graphQlLib.GraphQLString
            }
        }
    });


    context.types.geoPointInputType = graphQlLib.createInputObjectType({
        name: context.uniqueName('GeoPointInput'),
        description: 'Geo range input type',
        fields: {
            lat: {
                type: graphQlLib.GraphQLString
            },
            lon: {
                type: graphQlLib.GraphQLString
            }
        }
    });

    context.types.termsAggregationInputType = graphQlLib.createInputObjectType({
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
            }
        }
    });

    context.types.statsAggregationInputType = graphQlLib.createInputObjectType({
        name: context.uniqueName('StatsAggregationInput'),
        description: 'Stats aggregation input type',
        fields: {
            field: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            }
        }
    });

    context.types.rangeAggregationInputType = graphQlLib.createInputObjectType({
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

    context.types.dateRangeAggregationInputType = graphQlLib.createInputObjectType({
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

    context.types.dateHistogramAggregationInputType = graphQlLib.createInputObjectType({
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

    context.types.geoDistanceAggregationInputType = graphQlLib.createInputObjectType({
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
                type: context.types.geoPointInputType
            },
            ranges: {
                type: graphQlLib.list(context.types.numberRangeInputType)
            }
        }
    });

    context.types.minAggregationInputType = graphQlLib.createInputObjectType({
        name: context.uniqueName('MinAggregationInput'),
        description: 'MinAggregation input type',
        fields: {
            field: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            }
        }
    });

    context.types.maxAggregationInputType = graphQlLib.createInputObjectType({
        name: context.uniqueName('MaxAggregationInput'),
        description: 'MaxAggregation input type',
        fields: {
            field: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            }
        }
    });

    context.types.valueCountAggregationInputType = graphQlLib.createInputObjectType({
        name: context.uniqueName('ValueCountAggregationInput'),
        description: 'ValueCount Aggregation input type',
        fields: {
            field: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            }
        }
    });

    context.types.aggregationInputType = graphQlLib.createInputObjectType({
        name: context.uniqueName('AggregationInput'),
        description: 'Aggregation input type',
        fields: {
            subAggregations: {
                type: graphQlLib.list(graphQlLib.reference('AggregationInput'))
            },
            name: {
                type: graphQlLib.GraphQLString
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

    context.types.existsFilterInputType = graphQlLib.createInputObjectType({
        name: context.uniqueName('ExistsFilterInput'),
        description: 'ExistsFilter input type',
        fields: {
            field: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            }
        }
    });

    context.types.notExistsFilterInputType = graphQlLib.createInputObjectType({
        name: context.uniqueName('NotExistsFilterInput'),
        description: 'NotExistsFilter input type',
        fields: {
            field: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLString)
            }
        }
    });

    context.types.hasValueFilterInputType = graphQlLib.createInputObjectType({
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

    context.types.idsFilterInputType = graphQlLib.createInputObjectType({
        name: context.uniqueName('IdsFilterInput'),
        description: 'IdsFilter input type',
        fields: {
            values: {
                type: graphQlLib.list(graphQlLib.GraphQLString)
            }
        }
    });

    context.types.booleanFilterInputType = graphQlLib.createInputObjectType({
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

    context.types.filterInputType = graphQlLib.createInputObjectType({
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
}

exports.createInputTypes = createInputTypes;
