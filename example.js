const axios = require('axios');
const fs = require('fs');
const os = require('os');
const path = require('path');

// const url = 'https://oceandata.sci.gsfc.nasa.gov/';
const url = 'https://oceandata.sci.gsfc.nasa.gov/gibs/TERRA_MODIS.20220101.L3b.DAY.GIBS_OC.chlor_a.NRT.tgz'
const outputFilePath = path.join(__dirname, 'filename.tgz');

const netrcPath = path.join(os.homedir(), '.netrc');

// Read the contents of the .netrc file
fs.readFile(netrcPath, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading .netrc file: ${err.message}`);
    return;
  }

  // Extract the username and password from the .netrc file data
  const netrcCredentials = parseNetrc(data);
  const { login, password } = netrcCredentials['urs.earthdata.nasa.gov'];

  // Create an axios instance with the basic authentication headers
  const axiosInstance = axios.create({
    auth: {
      username: login,
      password: password,
    },
  });

    // Log the username and password variables
    console.log('Username:', axiosInstance.defaults.auth.username);
    console.log('Password:', axiosInstance.defaults.auth.password);

  // Make the HEAD request using the axios instance
  axiosInstance
    .head(url)
    .then((response) => {
      console.log('HEAD request successful');
      console.log('Response headers:', response.headers);
    })
    .catch((error) => {
      console.error('Error making HEAD request:', error.message);
    });

// Make a GET request using the axios instance
  axiosInstance
  .get(url, { responseType: 'stream' }) // Set the responseType to 'stream' to handle large file download
  .then((response) => {
    response.data.pipe(fs.createWriteStream(outputFilePath))
      .on('finish', () => {
        console.log('File download completed');
      })
      .on('error', (error) => {
        console.error('Error writing file:', error.message);
      });
  })
  .catch((error) => {
    console.error('Error making GET request:', error.message);
  });
});


// Helper function to parse the .netrc file contents into an object
function parseNetrc(data) {
    const lines = data.trim().split('\n');
    const netrc = {};
  
    lines.forEach((line) => {
      const [keyword, ...values] = line.trim().split(/\s+/);
  
      if (keyword === 'machine' && values.length > 0) {
        const machineName = values[0];
        netrc[machineName] = {};
        const loginIndex = values.indexOf('login');
        const passwordIndex = values.indexOf('password');
        if (loginIndex !== -1 && passwordIndex !== -1) {
          netrc[machineName].login = values[loginIndex + 1];
          netrc[machineName].password = values[passwordIndex + 1];
        }
      }
    });
  
    return netrc;
  }
  
