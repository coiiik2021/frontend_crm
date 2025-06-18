import axios from "axios";

const instance = axios.create({
  baseURL: "http://171.244.143.4:8080/api",
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
      return response.data;
    }
    return response.data?.data ?? response.data;
  },
  function (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

export default instance;
