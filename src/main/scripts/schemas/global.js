exports.globalSchema = `
type Query {
  query(aggregations: [AggregationInput], filters: [FilterInput]): QueryResult
}

type QueryResult {
  hits: [Content],
  aggregationsAsJson: String
}

interface Content {
  _id: ID!
  _name: String!
  _path: String!
  _references: [Content]
  displayName: String
}

input AggregationInput {
  name: String!,
  terms: TermsAggregation,
  stats: StatsAggregation,
  range: RangeAggregation,
  geoDistance: GeoDistanceAggregation,
  dateRange: DateRangeAggregation,
  dateHistogram: DateHistogramAggregation,
  
  subAggregations: [AggregationInput] 
}
`
;
