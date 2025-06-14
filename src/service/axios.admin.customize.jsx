import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8080/api",
});

instance.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  function (response) {
    if (response.config.responseType === "blob") {
      return response.data; // Trả nguyên blob, không parse
    }
    return response.data?.data ?? response.data;
  },
  function (error) {
    return Promise.reject(error);
  }
);
export default instance;
