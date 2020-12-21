exports.dateHistogramAggregationSchema = `
input DateHistogramAggregation {
  field: String!,
  interval: String,
  format: String,
  minDocCount: Int
}
`
;
