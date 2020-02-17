function forceArray(data) {
    if (data) {
        if (Array.isArray(data)) {
            return data;
        }
        return [data];
    }
    return [];
}

exports.forceArray = forceArray;