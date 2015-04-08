var webpack = require("webpack");

module.exports = {
    entry: {
        "demo": "./demo",
        "test": "./test/suite"
    },
    output: {
        filename: "./[name].bundle.js"
    },
    resolve: {
      alias: {
        // workaround for client side authormodel tests 0.3.7
        "fs": "memory-fs"
      }
    }
};
