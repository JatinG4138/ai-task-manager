const config = {
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000/',
    baseUrl:'https://jawebcrm.onrender.com',
    debugMode: true,
  };
  console.log(`Running for ${config.baseUrl}.`);

  export default config;


