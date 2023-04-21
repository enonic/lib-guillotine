function addRecursiveNodeId(holder, nodeId) {
    if (holder && typeof holder === 'object') {
        Object.keys(holder).forEach(prop => {
            const holderElement = holder[prop];
            if (holderElement && typeof holderElement === 'object') {
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
    if (obj && typeof obj === 'object') {
        delete obj['__nodeId'];
        Object.keys(obj).forEach(prop => {
            const holderProp = obj[prop];
            if (holderProp && typeof holderProp === 'object') {
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
