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

    context.types.highlightEncoderType = context.schemaGenerator.createEnumType({
        name: context.uniqueName('HighlightEncoderType'),
        description: 'Indicates if the snippet should be HTML encoded: default (no encoding) or html.',
        values: {
            'default': 'default',
            'html': 'html'
        }
    });

    context.types.highlightTagsSchemaType = context.schemaGenerator.createEnumType({
        name: context.uniqueName('HighlightTagsSchemaType'),
        description: 'Set to styled to use the built-in tag schema.',
        values: {
            'styled': 'styled',
        }
    });

    context.types.highlightFragmenterType = context.schemaGenerator.createEnumType({
        name: context.uniqueName('HighlightFragmenterType'),
        description: 'Specifies how text should be broken up in highlight snippets: simple or span (default).',
        values: {
            'simple': 'simple',
            'span': 'span',
        }
    });

    context.types.highlightOrderType = context.schemaGenerator.createEnumType({
        name: context.uniqueName('HighlightOrderType'),
        description: 'Sorts highlighted fragments by score when set to score. Defaults to none - will be displayed in the same order in which fragments appear in the property.',
        values: {
            'score': 'score',
            'none': 'none',
        }
    });
}

exports.createEnumTypes = createEnumTypes;
