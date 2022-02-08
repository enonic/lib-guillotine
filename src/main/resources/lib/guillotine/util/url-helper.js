const contextLib = require('/lib/xp/context');
const portalLib = require('/lib/xp/portal');

function buildRepoAndBranchPartUrl() {
    const ctx = contextLib.get();
    const branch = ctx.branch;
    const repo = ctx.repository.substring("com.enonic.cms.".length);

    return `${repo}/${branch}`;
}

function buildUrl(url, endpointTypePath) {
    let endpointTypePathIndex = url.indexOf(endpointTypePath);
    return `${url.substring(0, endpointTypePathIndex)}/${buildRepoAndBranchPartUrl()}${url.substring(endpointTypePathIndex)}`;
}

function resolveAttachmentUrl(params, isProjectMode) {
    const url = portalLib.attachmentUrl(params);

    return isProjectMode ? buildUrl(url, '/_/attachment') : url;
}

exports.resolveAttachmentUrlById = function (env, isProjectMode) {
    const params = {
        id: env.source._id,
        download: env.args.download,
        type: env.args.type,
        params: env.args.params && JSON.parse(env.args.params)
    };

    return resolveAttachmentUrl(params, isProjectMode);
}

exports.resolveAttachmentUrlByName = function (env, isProjectMode) {
    const params = {
        id: env.source['__nodeId'],
        name: env.source.name,
        download: env.args.download,
        type: env.args.type,
        params: env.args.params && JSON.parse(env.args.params)
    };

    return resolveAttachmentUrl(params, isProjectMode);
}

exports.resolveImageUrl = function (env, isProjectMode) {
    const url = portalLib.imageUrl({
        id: env.source._id,
        scale: env.args.scale,
        quality: env.args.quality,
        background: env.args.background,
        format: env.args.format,
        filter: env.args.filter,
        type: env.args.type,
        params: env.args.params && JSON.parse(env.args.params)
    })

    return isProjectMode ? buildUrl(url, '/_/image') : url;
}

exports.resolvePageUrl = function (env, isProjectMode) {
    let url = portalLib.pageUrl({
        id: env.source._id,
        type: env.args.type,
        params: env.args.params && JSON.parse(env.args.params)
    });

    return isProjectMode ? null : url;
}
