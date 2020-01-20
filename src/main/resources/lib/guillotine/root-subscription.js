var graphQlLib = require('./graphql');
var eventLib = require('./event');

exports.createRootSubscriptionType = function (context) {
    const newEventPublisher = eventLib.createNewEventPublisher(context)
    return graphQlLib.createObjectType(context, {
        name: context.uniqueName('Subscription'),
        fields: {
            newEvent: {
                type: eventLib.createEventObjectType(context),
                resolve: () => newEventPublisher
            }
        }
    });
};