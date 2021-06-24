const testingLib = require('/lib/xp/testing');
const factoryLib = require('/lib/guillotine/util/factory');

exports.testCreateTermsAggregation = function () {
    let inputAggregation = {
        name: 'categories',
        terms: {
            field: 'myCategory',
            order: '_count desc',
            size: 10,
            minDocCount: 2
        }
    };

    let result = factoryLib.createAggregation({}, inputAggregation);

    testingLib.assertJsonEquals({
        "categories": {
            "terms": {
                "field": "myCategory",
                "order": "_count desc",
                "size": 10,
                "minDocCount": 2
            }
        }
    }, result);
};


exports.testCreateStatsAggregation = function () {
    let inputAggregation = {
        name: "products",
        terms: {
            field: "data.category",
            order: "_count desc",
            size: 10
        },
        subAggregations: [{
            name: "priceStats",
            stats: {
                field: "data.price"
            }
        }]
    };

    let result = factoryLib.createAggregation({}, inputAggregation);

    testingLib.assertJsonEquals({
        "products": {
            "terms": {
                "field": "data.category",
                "order": "_count desc",
                "size": 10
            },
            "aggregations": {
                "priceStats": {
                    "stats": {
                        "field": "data.price"
                    }
                }
            }
        }
    }, result);
};

exports.testCreateNumberRangeAggregation = function () {
    let inputAggregation = {
        name: "products",
        range: {
            field: "data.price",
            ranges: [
                {
                    from: 0,
                    to: 50
                },
                {
                    from: 50,
                    to: 100
                },
                {
                    from: 100,
                    to: 150
                }
            ]
        }
    };

    let result = factoryLib.createAggregation({}, inputAggregation);

    testingLib.assertJsonEquals({
        "products": {
            "range": {
                "field": "data.price",
                "ranges": [
                    {
                        "from": 0,
                        "to": 50
                    },
                    {
                        "from": 50,
                        "to": 100
                    },
                    {
                        "from": 100,
                        "to": 150
                    }
                ]
            }
        }
    }, result);
};

exports.testCreateDateRangeAggregation = function () {
    let inputAggregation = {
        name: "products",
        dateRange: {
            field: "modifiedTime",
            format: "dd-MM-yyyy",
            ranges: [
                {
                    from: "now-10d"
                }, {
                    to: "now"
                }
            ]
        }
    };

    let result = factoryLib.createAggregation({}, inputAggregation);

    testingLib.assertJsonEquals({
        "products": {
            "dateRange": {
                "field": "modifiedTime",
                "format": "dd-MM-yyyy",
                "ranges": [
                    {
                        "from": "now-10d"
                    },
                    {
                        "to": "now"
                    }
                ]
            }
        }
    }, result);
};

exports.testCreateDateHistogramAggregation = function () {
    let inputAggregation = {
        name: "products",
        dateHistogram: {
            field: "modifiedTime",
            interval: "1d",
            format: "yyyy-MM-dd",
            minDocCount: 10
        }
    };

    let result = factoryLib.createAggregation({}, inputAggregation);

    testingLib.assertJsonEquals({
        "products": {
            "dateHistogram": {
                "field": "modifiedTime",
                "interval": "1d",
                "format": "yyyy-MM-dd",
                "minDocCount": 10
            }
        }
    }, result);
};

exports.testCreateGeoDistanceAggregation = function () {
    let inputAggregation = {
        name: "products",
        geoDistance: {
            field: "data.cityLocation",
            unit: "km",
            origin: {
                lat: "90",
                lon: "0.0"
            },
            ranges: [
                {
                    from: 0,
                    to: 1200
                }, {
                    from: 1200,
                    to: 4000
                }
            ]
        }
    };

    let result = factoryLib.createAggregation({}, inputAggregation);

    testingLib.assertJsonEquals({
        "products": {
            "geoDistance": {
                "field": "data.cityLocation",
                "unit": "km",
                "origin": {
                    "lat": "90",
                    "lon": "0.0"
                },
                "ranges": [
                    {
                        "from": 0,
                        "to": 1200
                    },
                    {
                        "from": 1200,
                        "to": 4000
                    }
                ]
            }
        }
    }, result);

};

exports.testMinAggregation = function () {
    let inputAggregation = {
        name: "minPrice",
        min: {
            field: "data.price"
        }
    };

    let result = factoryLib.createAggregation({}, inputAggregation);

    testingLib.assertJsonEquals({
        "minPrice": {
            "min": {
                "field": "data.price"
            }
        }
    }, result);
};


exports.testMaxAggregation = function () {
    let inputAggregation = {
        name: "maxPrice",
        max: {
            field: "data.price"
        }
    };

    let result = factoryLib.createAggregation({}, inputAggregation);

    testingLib.assertJsonEquals({
        "maxPrice": {
            "max": {
                "field": "data.price"
            }
        }
    }, result);
};


exports.testCountAggregation = function () {
    let inputAggregation = {
        name: "countWithPrice",
        count: {
            field: "data.price"
        }
    };

    let result = factoryLib.createAggregation({}, inputAggregation);

    testingLib.assertJsonEquals({
        "countWithPrice": {
            "count": {
                "field": "data.price"
            }
        }
    }, result);
};
