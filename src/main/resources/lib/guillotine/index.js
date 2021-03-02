const contentApiLib = require('/lib/guillotine/query/content-api');
const genericLib = require('/lib/guillotine/generic/index');
const dynamicLib = require('/lib/guillotine/dynamic/index');
const graphQlLib = require('/lib/guillotine/graphql');
const rootQueryLib = require('/lib/guillotine/query/root-query');
const rootSubscriptionLib = require('/lib/guillotine/subscription/root-subscription');
const graphQlRxLib = require('/lib/graphql-rx');
const webSocketLib = require('/lib/xp/websocket');

function createSchema(options) {
    const context = createContext(options);

    const schemaGenerator = graphQlLib.schemaGenerator();

    createTypes(schemaGenerator, context);

    return schemaGenerator.createSchema({
        query: rootQueryLib.createRootQueryType(schemaGenerator, context),
        subscription: rootSubscriptionLib.createRootSubscriptionType(schemaGenerator, context),
        dictionary: context.dictionary
    });
}

function createContentApi(schemaGenerator, context) {
    context = context || createContext();

    createTypes(schemaGenerator, context);
    return contentApiLib.createContentApiType(schemaGenerator, context);
}

function createTypes(schemaGenerator, context) {
    genericLib.createTypes(schemaGenerator, context);
    dynamicLib.createTypes(schemaGenerator, context);
}

function createContext(options) {
    const context = {
        types: {},
        dictionary: [],
        nameCountMap: {},
        contentTypeMap: {},
        options: {},
        addDictionaryType: function (objectType) {
            this.dictionary.push(objectType);
        },
        putContentTypeType: function (name, objectType) {
            this.contentTypeMap[name] = objectType;
        },
        uniqueName: function (name) {
            var uniqueName = name;
            if (this.nameCountMap[name]) {
                this.nameCountMap[uniqueName]++;
                uniqueName = name + '_' + this.nameCountMap[uniqueName];
            } else {
                this.nameCountMap[uniqueName] = 1;
            }
            return uniqueName;
        },
        getOption: function (name) {
            return this.options[name];
        },
        putOption: function (name, value) {
            this.options[name] = value;
        }
    };

    if (options) {
        for (var optionKey in options) {
            context.options[optionKey] = options[optionKey];
        }
    }
    context.options.applications = context.options.applications || [app.name];
    context.options.allowPaths = context.options.allowPaths || [];
    context.options.subscriptionEventTypes = context.options.subscriptionEventTypes || ['node.*'];

    return context;
}

//──────────────────────────────────────────────────────────────────────────────
// GraphQL WS Protocol
//──────────────────────────────────────────────────────────────────────────────
const graphQlSubscribers = {};

function cancelSubscription(sessionId) {
    Java.synchronized(() => {
        const subscriber = graphQlSubscribers[sessionId];
        if (subscriber) {
            delete graphQlSubscribers[sessionId];
            subscriber.cancelSubscription();
        }
    }, graphQlSubscribers)();
}

function handleStartMessage(schema, sessionId, message) {
    const graphQLOperationId = message.id;
    const payload = message.payload;

    try {
        const result = graphQlLib.execute(schema, payload.query, payload.variables);

        if (result.data instanceof com.enonic.lib.graphql.rx.Publisher) {
            const subscriber = graphQlRxLib.createSubscriber({
                onNext: (result) => {
                    webSocketLib.send(sessionId, JSON.stringify({
                        type: 'data',
                        id: graphQLOperationId,
                        payload: result
                    }));
                }
            });
            Java.synchronized(() => graphQlSubscribers[sessionId] = subscriber, graphQlSubscribers)();
            result.data.subscribe(subscriber);
        }
    } catch (e) {
        log.error('Error while handling Start GraphQL-WS message', e);
        throw e;
    }
}

function initWebSockets(schema) {
    return function (event) {
        switch (event.type) {
        case 'close':
            cancelSubscription(event.session.id);
            break;
        case 'message':
            processEventMessage(schema, event);
            break;
        case 'error':
            log.warning('Session [' + event.session.id + '] error: ' + event.error);
            break;
        default:
            log.debug(`Unknown event type ${event.type}`);
            break;
        }
    }
}

function processEventMessage(schema, event) {
    var message = JSON.parse(event.message);
    switch (message.type) {
    case 'connection_init':
        webSocketLib.send(event.session.id, JSON.stringify({
            type: 'connection_ack'
        }));
        break;
    case 'start':
        handleStartMessage(schema, event.session.id, message);
        break;
    case 'stop':
        cancelSubscription(event.session.id);
        break;
    default:
        log.debug(`Unknown message type ${message.type}`);
        break;
    }
}

exports.createSchema = createSchema;
exports.createHeadlessCmsType = createContentApi;
exports.createContext = createContext;
exports.initWebSockets = initWebSockets;

