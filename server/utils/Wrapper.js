function Success(statusCode, result) {
    return {
        status: "ok",
        statusCode,
        result,
    };
}

function Error(statusCode, message) {
    return {
        status: "error",
        statusCode,
        message,
    };
}

module.exports = { Success, Error };
