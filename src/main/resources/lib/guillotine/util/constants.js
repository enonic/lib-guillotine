const SUPPORTED_AGGREGATIONS = ['terms', 'stats', 'range', 'dateRange', 'dateHistogram', 'geoDistance'];

exports.getSupportedAggregations = function () {
    return SUPPORTED_AGGREGATIONS;
};
