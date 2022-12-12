const testingLib = require('/lib/xp/testing');
const factoryLib = require('/lib/guillotine/util/factory');

exports.testTermDslExpression = function () {
    testingLib.assertJsonEquals({
        'term': {
            'field': 'displayName',
            'value': 'DisplayName',
        }
    }, factoryLib.createDslQuery({
        term: {
            field: 'displayName',
            value: {
                string: 'DisplayName'
            }
        }
    }));

    testingLib.assertJsonEquals({
        'term': {
            'field': 'longField',
            'value': 123,
        }
    }, factoryLib.createDslQuery({
        term: {
            field: 'longField',
            value: {
                long: 123
            }
        }
    }));

    testingLib.assertJsonEquals({
        'term': {
            'field': 'doubleField',
            'value': 12.5,
        }
    }, factoryLib.createDslQuery({
        term: {
            field: 'doubleField',
            value: {
                double: 12.5,
            }
        }
    }));

    testingLib.assertJsonEquals({
        'term': {
            'field': 'booleanField',
            'value': false,
        }
    }, factoryLib.createDslQuery({
        term: {
            field: 'booleanField',
            value: {
                boolean: false,
            }
        }
    }));

    testingLib.assertJsonEquals({
        term: {
            field: 'dateTimeField',
            value: '1999-12-15',
            type: 'dateTime',
        }
    }, factoryLib.createDslQuery({
        term: {
            field: 'dateTimeField',
            value: {
                localDate: '1999-12-15',
            },
        }
    }));

    testingLib.assertJsonEquals({
        term: {
            field: 'localDateTimeField',
            value: '1999-12-15T13:15:40',
            type: 'dateTime',
        }
    }, factoryLib.createDslQuery({
        term: {
            field: 'localDateTimeField',
            value: {
                localDateTime: '1999-12-15T13:15:40',
            },
        }
    }));

    testingLib.assertJsonEquals({
        term: {
            field: 'localTimeField',
            value: '10:00:03',
            type: 'time',
        }
    }, factoryLib.createDslQuery({
        term: {
            field: 'localTimeField',
            value: {
                localTime: '10:00:03',
            },
            type: 'time',
        }
    }));

    testingLib.assertJsonEquals({
        term: {
            field: 'instantField',
            value: '2015-03-16T10:00:02Z',
            type: 'dateTime',
        }
    }, factoryLib.createDslQuery({
        term: {
            field: 'instantField',
            value: {
                instant: '2015-03-16T10:00:02Z',
            },
        }
    }));
};

exports.testLikeDslExpression = function () {
    testingLib.assertJsonEquals({
        like: {
            field: 'stringField',
            value: '*abc*',
            boost: 1.0,
        }
    }, factoryLib.createDslQuery({
        like: {
            field: 'stringField',
            value: '*abc*',
            boost: 1.0,
        }
    }));
};

exports.testExistsDslExpression = function () {
    testingLib.assertJsonEquals({
        exists: {
            field: 'stringField',
            boost: 1.0,
        }
    }, factoryLib.createDslQuery({
        exists: {
            field: 'stringField',
            boost: 1.0,
        }
    }));
};

exports.testPathMatchDslExpression = function () {
    testingLib.assertJsonEquals({
        pathMatch: {
            field: '_path',
            path: '/mySite/folder1/folder2/images',
            minimumMatch: 2,
        }
    }, factoryLib.createDslQuery({
        pathMatch: {
            field: '_path',
            path: '/mySite/folder1/folder2/images',
            minimumMatch: 2,
        }
    }));
};

exports.testMatchAllDslExpression = function () {
    testingLib.assertJsonEquals({
        matchAll: {
            boost: 2
        }
    }, factoryLib.createDslQuery({
        matchAll: {
            boost: 2
        }
    }));
};

exports.testFulltextDslExpression = function () {
    testingLib.assertJsonEquals({
        fulltext: {
            fields: 'displayName',
            query: '~apple pork+pie*',
            operator: 'OR',
        }
    }, factoryLib.createDslQuery({
        fulltext: {
            fields: 'displayName',
            query: '~apple pork+pie*',
            operator: 'OR',
        }
    }));
};

exports.testStemmedDslExpression = function () {
    testingLib.assertJsonEquals({
        stemmed: {
            fields: ['_allText'],
            query: 'fish boat',
            operator: 'OR',
            language: 'en',
            boost: 1.0,
        }
    }, factoryLib.createDslQuery({
        stemmed: {
            fields: ['_allText'],
            query: 'fish boat',
            language: 'en',
            operator: 'OR',
            boost: 1.0,
        }
    }));
};

exports.testNgramDslExpression = function () {
    testingLib.assertJsonEquals({
        ngram: {
            fields: ['custom.'],
            query: 'lev alg',
            operator: 'AND',
        }
    }, factoryLib.createDslQuery({
        ngram: {
            fields: ['custom.'],
            query: 'lev alg',
            operator: 'AND',
        }
    }));
};

exports.testInDslExpression = function () {
    testingLib.assertJsonEquals({
        in: {
            field: 'myDateTime',
            values: [
                '2015-03-16T10:00:02',
                '2015-03-17T10:00:02',
            ],
            type: 'dateTime',
        }
    }, factoryLib.createDslQuery({
        in: {
            field: 'myDateTime',
            localDateTimeValues: [
                '2015-03-16T10:00:02',
                '2015-03-17T10:00:02',
            ],
        }
    }));
};

exports.testRangeDslExpression = function () {
    testingLib.assertJsonEquals({
        range: {
            field: 'myDateTime',
            gt: '2017-09-11T09:00:00Z',
            type: 'dateTime',
        }
    }, factoryLib.createDslQuery({
        range: {
            field: 'myDateTime',
            gt: {
                instant: '2017-09-11T09:00:00Z',
            }
        }
    }));
};

exports.testBooleanDslExpression = function () {
    testingLib.assertJsonEquals({
        boolean: {
            should: [
                {
                    term: {
                        field: 'myString',
                        value: 'value 1',
                    }
                },
                {
                    term: {
                        field: 'myString',
                        value: 'value 2',
                        boost: 2.0,
                    }
                }
            ]
        }
    }, factoryLib.createDslQuery({
        boolean: {
            should: [
                {
                    term: {
                        field: 'myString',
                        value: {
                            string: 'value 1',
                        }
                    }
                },
                {
                    term: {
                        field: 'myString',
                        value: {
                            string: 'value 2',
                        },
                        boost: 2.0
                    }
                }
            ]
        }
    }));
};
