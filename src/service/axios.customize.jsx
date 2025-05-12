import axios from "axios";


const instance = axios.create({
    baseURL: "https://sheets.googleapis.com/v4/spreadsheets/1n3RWuMLiRYPFp5DailX_8lqOcwXmGYDCReVrTBv0Buw/values"
}
);

instance.interceptors.request.use(function (config) {
    return config;
  }, function (error) {
    return Promise.reject(error);
  });

instance.interceptors.response.use(function (response) {
    
    return response;
  }, function (error) {
    
    return Promise.reject(error);
  });

  export default instance;