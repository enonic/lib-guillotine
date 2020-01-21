const graphQlLib = require('/lib/graphql');
const graphQlRxLib = require('/lib/graphql-rx');
const eventLib = require('/lib/xp/event');

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
                type: graphQlLib.GraphQLString,
                resolve: (env) => JSON.stringify(env.source.data)
            },
        }
    });
}

function createNewEventPublisher(context) {
    const processor = graphQlRxLib.createPublishProcessor();
    eventLib.listener({
        type: '*',
        callback: function (event) {
            if (!(event.type == 'application' && event.data.applicationKey == app.name)) { //TODO Temporary Workaround
                processor.onNext(event);
            }
        }
    });
    return processor;
}

exports.createEventObjectType = createEventObjectType;
exports.createNewEventPublisher = createNewEventPublisher;