const {ApolloServer} = require('apollo-server');
const {globalSchema} = require('./schemas/global');
const {statsAggregationSchema} = require('./schemas/statsAggregation');
const {termsAggregationSchema} = require('./schemas/termsAggregation');
const {rangeAggregationSchema} = require('./schemas/rangeAggregation');
const {geoDistanceAggregationSchema} = require('./schemas/geoDistanceAggregation');
const {dateRangeAggregationSchema} = require('./schemas/dateRangeAggregation');
const {dateHistogramAggregationSchema} = require('./schemas/dateHistogramAggregation');
const {filtersSchema} = require('./schemas/filters');

const typeDefs = [
    globalSchema,
    statsAggregationSchema,
    termsAggregationSchema,
    rangeAggregationSchema,
    geoDistanceAggregationSchema,
    dateRangeAggregationSchema,
    dateHistogramAggregationSchema,
    filtersSchema
];

const resolvers = {
    Query: {
        query: () => {
            return {
                contents: [
                    {
                        "_id": "ca4dd139-6e6f-44de-aad0-23e7cdd02736",
                        "_name": "bergen",
                        "_path": "/features/input-types/geo-point/cities-manager/bergen",
                        "_score": 1
                    }
                ],
                aggregationsAsJson: JSON.stringify({
                    "myTerms": {
                        "buckets": [
                            {
                                "key": "-33.86,151.21",
                                "docCount": 1
                            },
                            {
                                "key": "37.783333,-122.44",
                                "docCount": 1
                            },
                            {
                                "key": "4.6,-74.1",
                                "docCount": 1
                            },
                            {
                                "key": "41.3833,2.18",
                                "docCount": 1
                            },
                            {
                                "key": "48.8567,2.3508",
                                "docCount": 1
                            },
                            {
                                "key": "53.2028,50.1408",
                                "docCount": 1
                            },
                            {
                                "key": "53.906,27.56",
                                "docCount": 1
                            },
                            {
                                "key": "60.389444,5.33",
                                "docCount": 1
                            },
                            {
                                "key": "69.65,18.96",
                                "docCount": 1
                            }
                        ]
                    }
                })
            }
        }
    },
    Content: {
        __resolveType: function (obj, context, info) {
            return obj.typename;
        }
    }
};

const server = new ApolloServer({typeDefs, resolvers});
server.listen().then(() => console.log("Server started ! Open your browser at http://localhost:4000"));
