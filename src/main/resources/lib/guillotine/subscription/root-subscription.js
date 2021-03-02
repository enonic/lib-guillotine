const graphQlLib = require('/lib/guillotine/graphql');
const eventLib = require('/lib/guillotine/subscription/event');

function createRootSubscriptionType(context) {
    const newEventPublisher = eventLib.createNewEventPublisher(context);

    return graphQlLib.createObjectType(context, {
        name: context.uniqueName('Subscription'),
        fields: {
            event: {
                type: eventLib.createEventObjectType(context),
                resolve: (env) => {
                    return newEventPublisher;
                }
            }
        }
    });
}

exports.createRootSubscriptionType = createRootSubscriptionType;
