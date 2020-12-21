exports.dateRangeAggregationSchema = `
input DateRange {
  from: String, 
  to: String
} 

input DateRangeAggregation {
  field: String!,
  format: String,
  ranges: [DateRange],
  range: DateRange
}
`
;
