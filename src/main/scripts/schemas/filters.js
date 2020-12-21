exports.filtersSchema = `
input ExistsFilter {
  field: String!
}

input NotExistsFilter {
  field: String!
}

input HasValueFilter {
  field: String!,
  stringValues: [String],
  intValues: [Int],
  floatValues: [Float]
  booleanValues: [Boolean]
}

input IdsFilter {
  values: [String]!
}

input BooleanFilter {
  must: [FilterInput], 
  notMust: [FilterInput], 
  should: [FilterInput] 
}

input FilterInput {
  boolean: BooleanFilter,
  exists: ExistsFilter,
  notExists: NotExistsFilter,
  hasValue: HasValueFilter,
  ids: IdsFilter
}
`
;
