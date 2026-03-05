import { TIMEOUT_SEC } from './config.js';
const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};
export const getJSON = async function (url) {
  try {
    const res = await Promise.race([fetch(url), timeout(TIMEOUT_SEC)]);
    const data = await res.json();
    if (!res.ok) throw new Error(`${data.message} ${res.status}`);
    return data;
  } catch (err) {
    console.log(err);
  }
};
export const sendJSON = async function (url, uploadData) {
  try {
    const res = await Promise.race([fetch(url,
      {
        method: 'POST', // to send the data to the server
        headers: { 'Content-Type': 'application/json' }, //type of the data that we send is in the JSON format
        body: JSON.stringify(uploadData) // data that we send is in the JSON format
      }),
    timeout(TIMEOUT_SEC)]);
    const data = await res.json();
    if (!res.ok) throw new Error(`${data.message} ${res.status}`);
    return data;
  } catch (err) {
    console.log(err);
  }
};