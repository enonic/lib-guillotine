const portalLib = require('/lib/xp/portal');

const siteRegex = /\$\{site\}/gi;

function replaceSitePath(path, sitePath) {
    return path ? path.replace(siteRegex, sitePath) : path;
}

exports.replaceSitePath = replaceSitePath;