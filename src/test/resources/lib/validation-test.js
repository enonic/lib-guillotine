const testingLib = require('/lib/xp/testing');
const validationLib = require('/lib/guillotine/util/validation');

function executeHighlight(highlight, errMsg) {
    try {
        validationLib.validateArgumentsForQueryField({
            args: {
                highlight: highlight,
            }
        });
    } catch (e) {
        testingLib.assertEquals(errMsg, e);
    }
}

exports.testInvalidHighlight = function () {
    const highlight = {
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
        properties: []
    };

    executeHighlight(highlight, 'Highlight properties must be not empty');

    highlight.properties = [{}];
    executeHighlight(highlight, 'Highlight propertyName is required and can not be empty');

    highlight.properties = [{
        propertyName: '',
    }];
    executeHighlight(highlight, 'Highlight propertyName is required and can not be empty');


    highlight.properties = [{
        propertyName: 'description',
    }];
    validationLib.validateArgumentsForQueryField({
        args: {
            highlight: highlight,
        }
    });
};
