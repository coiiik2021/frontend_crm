import axios from "./axios.admin.customize";
const APILogin = async (data) => {
    const API = "auth/login";
    // return await axios.post(API, data);
    try {
        const response = await axios.post(API, data);
        return response; // ✅ Chỉ trả response.data
    } catch (error) {
        if (error.response?.message) {
        throw new Error(error.response.data.message);
        } else {
        throw new Error("Không thể kết nối tới máy chủ");
        }
    }
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