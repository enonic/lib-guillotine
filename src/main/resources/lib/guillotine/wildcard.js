const portalLib = require('/lib/xp/portal');

const siteRegex = /\$\{site\}/gi;

function replaceSitePath(path, sitePath) {
    return path.replace(siteRegex, sitePath)
}

exports.replaceSitePath = replaceSitePath;