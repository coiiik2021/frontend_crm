import axios from "./axios.admin.customize";
const APILogin = async (data) => {
    const API = "auth/login";
    return await axios.post(API, data);
}

export { APILogin };