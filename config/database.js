require("dotenv").config();

function getURL() {
    if (process.env.NODE_ENV === "production") {
        return process.env.MONGO_PROD_URI;
    } else {
        return process.env.MONGO_DEV_URI;
    }
}

module.exports = getURL;
