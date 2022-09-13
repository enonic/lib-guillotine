function addRecursiveNodeId(holder, nodeId) {
    if (typeof holder === 'object') {
        Object.keys(holder).forEach(prop => {
            const holderElement = holder[prop];
            if (typeof holderElement === 'object') {
                if (Array.isArray(holderElement)) {
                    holderElement.forEach(p => addRecursiveNodeId(p, nodeId));
                } else {
                    holderElement['__nodeId'] = nodeId;
                    addRecursiveNodeId(holderElement, nodeId);
                }
            }
        });
    }
}

function removeNodeIdPropIfNeeded(obj) {
    if (typeof obj === 'object') {
        delete obj['__nodeId'];
        Object.keys(obj).forEach(prop => {
            const holderProp = obj[prop];
            if (typeof holderProp === 'object') {
                if (Array.isArray(holderProp)) {
                    holderProp.forEach(p => removeNodeIdPropIfNeeded(p));
                } else {
                    removeNodeIdPropIfNeeded(holderProp);
                }
            }
        });
    }
}

exports.addRecursiveNodeId = addRecursiveNodeId;
exports.removeNodeIdPropIfNeeded = removeNodeIdPropIfNeeded;
