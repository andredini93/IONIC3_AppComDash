const webpackConfig = require('../node_modules/@ionic/app-scripts/config/webpack.config');
const webpack = require('webpack');

const ENV = process.env.IONIC_ENV;
const envConfigFile = require(`./config-${ENV.toLowerCase()}.json`);
const serverConfig = envConfigFile['SERVER_ADDRESS'];
const app_idConfig = envConfigFile.APP_ID;
const envConfig = envConfigFile.ENV;

webpackConfig.prod.plugins.push(
    new webpack.DefinePlugin({
        webpackGlobalVars: {
            SERVER_ADDRESS: JSON.stringify(serverConfig),
            APP_ID: JSON.stringify(app_idConfig),
            ENV: JSON.stringify(envConfig)
        }
    })
);
webpackConfig.dev.plugins.push(
    new webpack.DefinePlugin({
        webpackGlobalVars: {
            SERVER_ADDRESS: JSON.stringify(serverConfig),
            APP_ID: JSON.stringify(app_idConfig),
            ENV: JSON.stringify(envConfig)
        }
    })
);