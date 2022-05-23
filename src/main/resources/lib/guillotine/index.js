const contentApiLib = require('/lib/guillotine/query/content-api');
const genericLib = require('/lib/guillotine/generic/index');
const dynamicLib = require('/lib/guillotine/dynamic/index');
const graphQlLib = require('/lib/guillotine/graphql');
const rootQueryLib = require('/lib/guillotine/query/root-query');
const rootSubscriptionLib = require('/lib/guillotine/subscription/root-subscription');
const graphQlRxLib = require('/lib/graphql-rx');
const webSocketLib = require('/lib/xp/websocket');
const eventLib = require('/lib/xp/event');
const contentLib = require('/lib/xp/content');
const contextLib = require('/lib/xp/context');
const portalLib = require('/lib/xp/portal');
const utilLib = require('/lib/guillotine/util/util');

function required(params, name) {
    let value = params[name];
    if (value === undefined) {
        throw `Parameter '${name}' is required`;
    }
    return value;
}

function valueOrDefault(value, defaultValue) {
    if (value === undefined) {
        return defaultValue;
    }
    return value;
}

let schemaMap = {};

eventLib.listener({
    type: 'application',
    localOnly: false,
    callback: function (event) {
        if ('STOPPED' === event.data.eventType || 'STARTED' === event.data.eventType) {
            invalidate();
        }
    }
});

eventLib.listener({
    type: 'node.*',
    localOnly: false,
    callback: function (event) {
        if ('node.delete' === event.type || 'node.pushed' === event.type || 'node.updated' === event.type ||
            'node.stateUpdated' === event.type) {
            let nodes = event.data.nodes;
            if (nodes) {
                nodes.forEach(function (node) {
                    invalidate(node.id, node.branch);
                });
            }
        }
    }
});

function createInternalSchema(siteId, branch, schemaOptions) {
    let siteConfigs = utilLib.forceArray(getSite(siteId, branch).data.siteConfig);
    let applicationKeys = siteConfigs.map(siteConfigEntry => siteConfigEntry.applicationKey);

    let options = {};
    if (schemaOptions) {
        for (const optionKey in schemaOptions) {
            options[optionKey] = schemaOptions[optionKey];
        }
    }
    options.applications = applicationKeys;

    if (schemaOptions) {
        if (schemaOptions.applications) {
            let apps = {};
            utilLib.forceArray(schemaOptions.applications).forEach(applicationKey => {
                apps[applicationKey] = applicationKey;
            });
            let uniqueAppKeys = Object.keys(apps);
            if (uniqueAppKeys.length) {
                options.applications = options.applications.concat(uniqueAppKeys);
            }
        }
        if (schemaOptions.allowPaths) {
            options.allowPaths = utilLib.forceArray(schemaOptions.allowPaths);
        }
        if (schemaOptions.subscriptionEventTypes) {
            options.subscriptionEventTypes = utilLib.forceArray(schemaOptions.subscriptionEventTypes);
        }
    }

    return createSchema(options);
}

function getSite(siteId, branch) {
    return contextLib.run({
        branch: branch
    }, () => contentLib.get({key: siteId}));
}

function invalidate(siteId, branch) {
    Java.type('com.enonic.lib.guillotine.Synchronizer').sync(__.toScriptValue(function () {
        if (siteId && branch) {
            delete schemaMap[`${siteId}/${branch}`];
        } else {
            schemaMap = {};
        }
    }));
}

function getSchema(siteId, branch, schemaOptions) {
    let schemaId = `${siteId}/${branch}`;
    let schema = null;
    Java.type('com.enonic.lib.guillotine.Synchronizer').sync(__.toScriptValue(function () {
        schema = schemaMap[schemaId];
        if (!schema) {
            schema = createInternalSchema(siteId, branch, schemaOptions);
            schemaMap[schemaId] = schema;
        }
    }));
    return schema;
}

function createSchema(options) {
    const context = createContext(options);

    createTypes(context);

    return context.schemaGenerator.createSchema({
        query: rootQueryLib.createRootQueryType(context),
        subscription: rootSubscriptionLib.createRootSubscriptionType(context),
        dictionary: context.dictionary
    });
}

function createContentApi(context) {
    context = context || createContext();

    createTypes(context);
    return contentApiLib.createContentApiType(context);
}

function createTypes(context) {
    genericLib.createTypes(context);
    dynamicLib.createTypes(context);
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

    context.schemaGenerator = graphQlLib.newSchemaGenerator();

    context.isProjectMode = function () {
        const site = portalLib.getSite();
        return typeof site === 'undefined' || site === null;
    };

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

function handleStartMessage(schema, subscriptionEvent, message) {
    const operationId = message.id;
    const payload = message.payload;
    const sessionId = subscriptionEvent.session.id;
    try {
        const result = graphQlLib.execute(schema, payload.query, payload.variables);

        if (result.data instanceof com.enonic.lib.graphql.rx.Publisher) {
            const subscriber = graphQlRxLib.createSubscriber({
                onNext: (payload) => {
                    if (payload.data.event.dataAsJson && payload.data.event.dataAsJson.nodes) {
                        Object.keys(payload.data.event.dataAsJson.nodes).forEach(key => {
                            let node = payload.data.event.dataAsJson.nodes[key];
                            if (node.repo === subscriptionEvent.data.repositoryId && node.branch === subscriptionEvent.data.branch) {
                                sendWebSocketMessage(sessionId, operationId, payload);
                            }
                        });
                    } else {
                        sendWebSocketMessage(sessionId, operationId, payload);
                    }
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
        if (!event) {
            return;
        }

        switch (event.type) {
        case 'close':
            cancelSubscription(event.session.id);
            break;
        case 'message':
            if (!schema) {
                required(event.data, 'siteId');
                required(event.data, 'branch');

                schema = getSchema(event.data.siteId, event.data.branch);
            }
            processEventMessage(schema, event);
            break;
        case 'error':
            log.warning(`Session [${event.session.id}] error: ${event.error}`);
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
        handleStartMessage(schema, event, message);
        break;
    case 'stop':
        cancelSubscription(event.session.id);
        break;
    default:
        log.debug(`Unknown message type ${message.type}`);
        break;
    }
}

function sendWebSocketMessage(sessionId, operationId, payload) {
    webSocketLib.send(sessionId, JSON.stringify({
        type: 'data',
        id: operationId,
        payload: payload
    }));
}

function createWebSocketData(req) {
    return {
        branch: required(req, 'branch'),
        repositoryId: required(req, 'repositoryId'),
        siteId: portalLib.getSite()._id
    }
}

function execute(params) {
    const query = required(params, 'query');
    const variables = valueOrDefault(params.variables, {});
    const schemaOptions = valueOrDefault(params.schemaOptions, {});
    const context = valueOrDefault(params.context, {});

    let schema = params.schema;
    if (!schema) {
        let siteId = valueOrDefault(params.siteId, portalLib.getSite()._id);
        let branch = valueOrDefault(params.branch, contextLib.get().branch);
        schema = getSchema(siteId, branch, schemaOptions);
    }
    return JSON.stringify(graphQlLib.execute(schema, query, variables, context));
}

exports.createSchema = createSchema;
exports.createHeadlessCmsType = createContentApi;
exports.createContext = createContext;
exports.initWebSockets = initWebSockets;
exports.createWebSocketData = createWebSocketData;
exports.execute = execute;
