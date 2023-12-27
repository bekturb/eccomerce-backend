const Clarifai = require('clarifai');
require("dotenv").config()

const clarifaiApp = new Clarifai.App({
    apiKey: process.env.CLARIFAI_API_KEY,
});

async function searchProductsByImage(imageURL) {
    try {
        const response = await clarifaiApp.models.predict(Clarifai.GENERAL_MODEL, imageURL);
        const concepts = response.outputs[0].data.concepts;
        return concepts;
    } catch (error) {
        throw new Error('Error searching for products by image:', error);
    }
}

module.exports = { searchProductsByImage };