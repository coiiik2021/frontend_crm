import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://171.244.143.4:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
