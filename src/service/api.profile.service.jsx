import axios from "./axios.admin.customize";



const UploadAvatar = async (data) => {
    const API = "upload-avatar";

    return await axios.post(API, data);
}

export { UploadAvatar }