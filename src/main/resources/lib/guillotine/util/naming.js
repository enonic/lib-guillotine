function generateCamelCase(text, upper, keepUnderscore) {
    const sanitizedText = sanitizeText(text);
    const camelCasedText = sanitizedText.replace(/_[0-9A-Za-z]/g, function (match, offset, string) {
        return (keepUnderscore ? '_' : '') + match.charAt(1).toUpperCase();
    });
    const firstCharacter = upper ? camelCasedText.charAt(0).toUpperCase() : camelCasedText.charAt(0).toLowerCase();
    return firstCharacter + (camelCasedText.length > 1 ? camelCasedText.substr(1) : '');
}

function sanitizeText(text) {
    return text.replace(/([^0-9A-Za-z])+/g, '_');
}

function applicationConfigKey(text) {
    return text.replace(/\./g, '-');
}

function generateRandomString() {
    return Math.random().toString(36).substr(2, 10).toUpperCase() + Math.random().toString(36).substr(2, 6).toUpperCase();
}

exports.generateCamelCase = generateCamelCase;
exports.sanitizeText = sanitizeText;
exports.applicationConfigKey = applicationConfigKey;
exports.generateRandomString = generateRandomString;