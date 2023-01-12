const testingLib = require('/lib/xp/testing');
const factoryLib = require('/lib/guillotine/util/factory');

exports.testHighlight = function () {
    testingLib.assertJsonEquals({
        encoder: 'html',
        tagsSchema: 'styled',
        fragmenter: 'simple',
        fragmentSize: 2,
        noMatchSize: 2,
        numberOfFragments: 5,
        order: 'none',
        preTag: '<section>',
        postTag: '</section>',
        requireFieldMatch: true,
        properties: {
            briefDescription: {
                fragmenter: 'span',
                fragmentSize: 2,
                noMatchSize: 2,
                numberOfFragments: 5,
                order: 'score',
                preTag: '<span>',
                postTag: '</span>',
            },
            description: {},
        }
    }, factoryLib.createHighlight({
        encoder: 'html',
        tagsSchema: 'styled',
        fragmenter: 'simple',
        fragmentSize: 2,
        noMatchSize: 2,
        numberOfFragments: 5,
        order: 'none',
        preTag: '<section>',
        postTag: '</section>',
        requireFieldMatch: true,
        properties: [
            {
                propertyName: "briefDescription",
                fragmenter: 'span',
                fragmentSize: 2,
                noMatchSize: 2,
                numberOfFragments: 5,
                order: 'score',
                preTag: '<span>',
                postTag: '</span>',
            },
            {
                propertyName: 'description',
            }
        ]
    }));
};
