var firstArgumentMaxValue = 1000;

exports.validateArguments = function (args) {
    if (args) {
        if (args.first && (args.first < 0 || args.first > firstArgumentMaxValue)) {
            throw "Invalid field argument first: The value must be between 0 and " + firstArgumentMaxValue;
        }        
    }
}