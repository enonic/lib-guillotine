var graphQlLib = require('./graphql');
var eventLib = require('./event');

exports.createRootSubscriptionType = function (context) {
    const newEventPublisher = eventLib.createNewEventPublisher(context)
    return graphQlLib.createObjectType(context, {
        name: context.uniqueName('Subscription'),
        fields: {
            newEvent: {
                type: eventLib.createEventObjectType(context),
                args: {
                    type: graphQlLib.GraphQLString,
                    localOnly: graphQlLib.GraphQLBoolean
                },
                resolve: (env) => {
                    if (env.args.type || env.args.localOnly) {
                        let regexp = null;
                        if (env.args.type) {
                            const pattern = env.args.type.replace(/\./g, '\\.').replace(/\*/g, '.*');
                            regexp = new RegExp('^' + pattern + '$');
                        }
                        return newEventPublisher.filter(
                            (event) => (!env.args.localOnly || event.localOrigin) && (!regexp || regexp.test(event.type)))
                    }
                    return newEventPublisher;
                }
            }
        }
    });
};