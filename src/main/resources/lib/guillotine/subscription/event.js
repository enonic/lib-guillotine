const graphQlLib = require('/lib/graphql');
const graphQlRxLib = require('/lib/graphql-rx');
const eventLib = require('/lib/xp/event');
const ctxLib = require('/lib/xp/context');

function createEventObjectType(context) {
    return graphQlLib.createObjectType({
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
            },
        }
    });
}

function createNewEventPublisher(context) {
    const siteCtx = ctxLib.get();

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

                    let eventMatched = false;

                    if (event.type.startsWith(eventType)) {
                        eventMatched = isEventMatched(event, siteCtx, event.type);
                    } else if (subscriptionEventType === event.type) {
                        eventMatched = isEventMatched(event, siteCtx, subscriptionEventType);
                    }

                    if (eventMatched) {
                        processor.onNext(event);
                        return true;
                    }
                }
            });
        }
    });
    return processor;
}

function isEventMatched(event, siteCtx, type) {
    if (!type.startsWith("node.")) {
        return true;
    }

    return event.data.nodes.some(node => {
        if (node.repo === siteCtx.repository && node.branch === siteCtx.branch) {
            return true;
        }
    });
}

exports.createEventObjectType = createEventObjectType;
exports.createNewEventPublisher = createNewEventPublisher;
