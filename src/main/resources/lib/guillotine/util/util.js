exports.forceArray = function(data) {
    if (data) {
        if (Array.isArray(data)) {
            return data;
        }
        return [data];
    }
    return [];
};