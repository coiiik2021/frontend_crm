import axiosInstance from "./axios.admin.customizets";

export const GetConstUser = async (user_id: string): Promise<any[]> => {
  const res = await axiosInstance.get(`/const_user/${user_id}`);
  return res.data.data;
};
