const SUPPORTED_AGGREGATIONS = ['terms', 'stats', 'range', 'dateRange', 'dateHistogram', 'geoDistance', 'min', 'max', 'count'];

exports.getSupportedAggregations = function () {
    return SUPPORTED_AGGREGATIONS;
};
