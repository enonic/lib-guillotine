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
}

exports.createEnumTypes = createEnumTypes;
