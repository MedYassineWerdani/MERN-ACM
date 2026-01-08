const axios = require('axios');

async function verifyCodeforcesHandle(handle) {
  try {
    const url = `https://codeforces.com/api/user.info?handles=${handle}`;
    const response = await axios.get(url);

    // Codeforces returns status EXACTLY "OK" for a valid handle
    return response.data.status === "OK";
  } catch (err) {
    // Any error (404, CF API down, bad handle, etc.) means invalid
    return false;
  }
}

module.exports = { verifyCodeforcesHandle };
