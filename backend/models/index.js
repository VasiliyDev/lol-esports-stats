// models/index.js
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../services/dvService');
const logger = require('../utils/logger');

const models = {};

// Read all model files and import them
fs.readdirSync(__dirname)
    .filter(file => {
        return (
            file.indexOf('.') !== 0 && // Ignore dot files
            file !== 'index.js' &&     // Ignore this file
            file.slice(-3) === '.js'   // Only .js files
        );
    })
    .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize);
        models[model.name] = model;
    });

// Associate models if they have associations
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

// Export models and sequelize instance
module.exports = {
    ...models,
    sequelize
};
