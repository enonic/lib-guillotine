const graphQlLib = require('/lib/guillotine/graphql');
const eventLib = require('/lib/guillotine/subscription/event');

function createRootSubscriptionType(schemaGenerator, context) {
    const newEventPublisher = eventLib.createNewEventPublisher(context);

    return graphQlLib.createOutputObjectType(schemaGenerator, context, {
        name: context.uniqueName('Subscription'),
        fields: {
            event: {
                type: eventLib.createEventObjectType(schemaGenerator, context),
                resolve: (env) => {
                    return newEventPublisher;
                }
            }
        }
    });
}

exports.createRootSubscriptionType = createRootSubscriptionType;
