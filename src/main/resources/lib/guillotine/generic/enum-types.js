function createEnumTypes(context) {
    context.types.urlType = context.schemaGenerator.createEnumType({
        name: context.uniqueName('UrlType'),
        description: 'URL type.',
        values: {
            'server': 'server',
            'absolute': 'absolute'
        }
    });

    context.types.contentPathType = context.schemaGenerator.createEnumType({
        name: context.uniqueName('ContentPathType'),
        description: 'Content path type.',
        values: {
            'siteRelative': 'siteRelative'
        }
    });

    context.types.mediaIntentType = context.schemaGenerator.createEnumType({
        name: context.uniqueName('MediaIntentType'),
        description: 'Media intent type.',
        values: {
            'download': 'download',
            'inline': 'inline'
        }
    });

    context.types.dslOperatorType = context.schemaGenerator.createEnumType({
        name: context.uniqueName('DslOperatorType'),
        description: 'DSL Operator type.',
        values: {
            'OR': 'OR',
            'AND': 'AND'
        }
    });

    context.types.dslSortDirectionType = context.schemaGenerator.createEnumType({
        name: context.uniqueName('DslSortDirectionType'),
        description: 'DSL sort direction type.',
        values: {
            'ASC': 'ASC',
            'DESC': 'DESC'
        }
    });

    context.types.dslGeoPointDistanceType = context.schemaGenerator.createEnumType({
        name: context.uniqueName('DslGeoPointDistanceType'),
        description: 'DSL Geo Point Distance type.',
        values: {
            'm': 'm',
            'meters': 'meters',
            'in': 'in',
            'inch': 'inch',
            'yd': 'yd',
            'yards': 'yards',
            'ft': 'ft',
            'feet': 'feet',
            'km': 'km',
            'kilometers': 'kilometers',
            'NM': 'NM',
            'nmi': 'nmi',
            'nauticalmiles': 'nauticalmiles',
            'mm': 'mm',
            'millimeters': 'millimeters',
            'cm': 'cm',
            'centimeters': 'centimeters',
            'mi': 'mi',
            'miles': 'miles',
        }
    });
}

exports.createEnumTypes = createEnumTypes;
