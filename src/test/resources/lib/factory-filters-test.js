const testingLib = require('/lib/xp/testing');
const factoryLib = require('/lib/guillotine/util/factory');

exports.testCreateHasValueFilter = function () {
    let inputFilters = [
        {
            hasValue: {
                field: "data.category",
                stringValues: ["books"]
            }
        }
    ];

    let result = factoryLib.createFilters(inputFilters);

    testingLib.assertJsonEquals([
        {
            "hasValue": {
                "field": "data.category",
                "values": [
                    "books"
                ]
            }
        }
    ], result);
};

exports.testCreateHasValueFilter_Failed = function () {
    let inputFilters = [
        {
            hasValue: {
                field: "data.category",
                stringValues: ["books"],
                intValues: [1, 2, 3]
            }
        }
    ];

    try {
        factoryLib.createFilters(inputFilters);
    } catch (e) {
        testingLib.assertTrue(e.indexOf(
            "HasValueFilter must have only one type of values from (\"stringValues, intValues, floatValues and booleanValues\")") > -1);
    }
};

exports.testComplexFilter = function () {
    let inputFilters = [
        {
            boolean: {
                must: [
                    {
                        exists: {
                            field: "data.price"
                        },
                        boolean: {
                            must: [
                                {
                                    exists: {
                                        field: "data.category"
                                    }
                                }
                            ]
                        }
                    }
                ],
                mustNot: [
                    {
                        hasValue: {
                            field: "data.category",
                            stringValues: ["books"]
                        }
                    }
                ]
            },
            notExists: {
                field: "unwantedField"
            }
        }
    ];

    let result = factoryLib.createFilters(inputFilters);

    testingLib.assertJsonEquals([
        {
            "boolean": {
                "must": [
                    {
                        "exists": {
                            "field": "data.price"
                        },
                        "boolean": {
                            "must": [
                                {
                                    "exists": {
                                        "field": "data.category"
                                    }
                                }
                            ]
                        }
                    }
                ],
                "mustNot": [
                    {
                        "hasValue": {
                            "field": "data.category",
                            "values": [
                                "books"
                            ]
                        }
                    }
                ]
            },
            "notExists": {
                "field": "unwantedField"
            }
        }
    ], result);
};

exports.testBooleanShouldFilter = function () {
    let inputFilters = [
        {
            boolean: {
                should: [{
                    exists: {
                        field: "data.price"
                    },
                    hasValue: {
                        field: "data.price",
                        floatValues: [100.0, 150.06]
                    }
                }]
            }
        }
    ];

    let result = factoryLib.createFilters(inputFilters);

    testingLib.assertJsonEquals([
        {
            "boolean": {
                "should": [
                    {
                        "exists": {
                            "field": "data.price"
                        },
                        "hasValue": {
                            "field": "data.price",
                            "values": [
                                100,
                                150.06
                            ]
                        }
                    }
                ]
            }
        }
    ], result);
};
