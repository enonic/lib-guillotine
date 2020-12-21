exports.rangeAggregationSchema = `
input Range {
  from: Float,
  to: Float
}

input RangeAggregation {
  field: String!,
  ranges: [Range],
  range: Range
}
`
;
