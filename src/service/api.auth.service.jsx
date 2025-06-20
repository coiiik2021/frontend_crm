import axios from "./axios.admin.customize";
const APILogin = async (data) => {
    const API = "auth/login";
    return await axios.post(API, data);
}

const APIResetPassword = async (email) => {
    const API = `account/reset/${email}`;
    return await axios.put(API);
}

const APIInformation = async () => {
    const API = "base_user/fill_information";
    return await axios.get(API);
}

export { APILogin, APIResetPassword , APIInformation };