/**
 * Get unique error field name
 */

const camelToSentence = (text) => {
    var result = text.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
}

const uniqueMessage = error => {
    let output;
    try {
        let fieldName = error.message.substring(
            error.message.lastIndexOf(".$") + 2,
            error.message.lastIndexOf("_1")
        );
        output =
            fieldName.charAt(0).toUpperCase() +
            fieldName.slice(1) +
            " already exists";
    } catch (ex) {
        output = "Unique field already exists";
    }

    return output;
};

/**
 * Get the erroror message from error object
 */
exports.errorHandler = error => {

    let messages = [];

    if (error.code == undefined && Object.keys(error).length > 0) {
        error = Object.keys(error.errors).map((q) => {

            if (error.errors[q].properties.type == "required") {
                const message = `${camelToSentence(error.errors[q].properties.path)} is ${error.errors[q].properties.type}`
                messages = messages.concat([message])
            }

        })
    } else if (error.code) {
        switch (error.code) {
            case 11000:
                messages = messages.concat([uniqueMessage(error)]);
                break;
            case 11001:
                messages = messages.concat([uniqueMessage(error)]);
                break;
            default:
                messages = messages.concat(["Something went wrong"]);
        }
    } 

    return messages;
    // else {
    //     for (let errorName in error.errors) {
    //         if (error.errors[errorName].message)
    //             error.message.concat([error.errors[errorName].message]);
    //     }
};