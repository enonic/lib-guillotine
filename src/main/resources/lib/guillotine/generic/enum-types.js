function createEnumTypes(context) {
    context.types.urlType = context.schemaGenerator.createEnumType({
        name: context.uniqueName('UrlType'),
        description: 'URL type.',
        values: {
            'server': 'server',
            'absolute': 'absolute'
        }
    });
}

exports.createEnumTypes = createEnumTypes;
