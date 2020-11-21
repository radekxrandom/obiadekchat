import axios from "axios";

export const mainAxios = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

export const imgurAxios = axios.create({
  baseURL: "https://api.imgur.com/3/",
  headers: {
    Authorization: `Client-ID ${process.env.REACT_APP_IMGUR_CLIENT_ID}`
  }
});

export const setToken = token => {
  if (token) {
    // Apply authorization token to every request if logged in
    mainAxios.defaults.headers.common.Authorization = token;
  } else {
    // Delete auth header
    delete mainAxios.defaults.headers.common.Authorization;
  }
};
