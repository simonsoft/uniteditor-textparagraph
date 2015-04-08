var webpack = require("webpack");

module.exports = {
    entry: {
        "demo": "./demo",
        "test": "./test/suite"
    },
    output: {
        filename: "./[name].bundle.js"
    }
};
