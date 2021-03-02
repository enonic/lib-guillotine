function createEnumTypes(schemaGenerator, context) {
    context.types.urlType = schemaGenerator.createEnumType({
        name: context.uniqueName('UrlType'),
        description: 'URL type.',
        values: {
            'server': 'server',
            'absolute': 'absolute'
        }
    });
}

exports.createEnumTypes = createEnumTypes;
