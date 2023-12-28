const initializeClarifai = (apiKey) => {
    try {
        return new Clarifai.App({ apiKey });
    } catch (error) {
        console.error('Error initializing Clarifai:', error);
        return null;
    }
};

module.exports = initializeClarifai;