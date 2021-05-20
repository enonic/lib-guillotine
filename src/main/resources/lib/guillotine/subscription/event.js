const graphQlLib = require('/lib/guillotine/graphql');
const graphQlRxLib = require('/lib/graphql-rx');
const eventLib = require('/lib/xp/event');

function createEventObjectType(context) {
    return graphQlLib.createObjectType(context, {
        name: context.uniqueName('Event'),
        fields: {
            type: {
                type: graphQlLib.GraphQLString
            },
            timestamp: {
                type: graphQlLib.GraphQLString
            },
            localOrigin: {
                type: graphQlLib.GraphQLBoolean
            },
            distributed: {
                type: graphQlLib.GraphQLBoolean
            },
            dataAsJson: {
                type: graphQlLib.Json,
                resolve: (env) => env.source.data
            }
        }
    });
}

function createNewEventPublisher(context) {
    const processor = graphQlRxLib.createPublishProcessor();

    eventLib.listener({
        type: '*',
        callback: function (event) {
            context.options.subscriptionEventTypes.some(subscriptionEventType => {
                if (subscriptionEventType === '*') {
                    processor.onNext(event);
                    return true;
                } else {
                    let eventType = subscriptionEventType.endsWith('*')
                                    ? subscriptionEventType.substring(0, subscriptionEventType.length - 1)
                                    : subscriptionEventType;

                    if (event.type.startsWith(eventType)) {
                        processor.onNext(event);
                        return true;
                    }
                }
            });
        }
    });
    return processor;
}

exports.createEventObjectType = createEventObjectType;
exports.createNewEventPublisher = createNewEventPublisher;
