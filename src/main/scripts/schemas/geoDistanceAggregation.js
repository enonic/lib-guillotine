exports.geoDistanceAggregationSchema = `
input GeoPoint {
  lat: Float!, 
  lon: Float!
} 

input GeoDistanceAggregation {
  field: String!,
  ranges: [Range],
  range: Range,
  unit: String,
  origin: GeoPoint
}
`
;
