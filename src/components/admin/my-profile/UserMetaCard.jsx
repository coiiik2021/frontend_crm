import { useModal } from "../../../hooks/useModal";
import { useEffect, useRef, useState } from "react";
import { GetAllPermissions, GetUserPermissions, UpdateUserPermissions } from "../../../service/api.admin.service";
import { UploadAvatar } from "../../../service/api.profile.service";

export default function UserMetaCard({ user }) {
    const fetchPermissions = async () => {
        try {
            setLoading(true);
            setError(null);

            const allPermsResponse = await GetAllPermissions(user.id);
            setAllPermissions(allPermsResponse.permissions);

            const userPermsResponse = await GetUserPermissions(user.id);
            setUserPermissions(userPermsResponse.permissions);
            const permissionsData = {};
            allPermsResponse.permissions.forEach(perm => {
                permissionsData[perm] = userPermsResponse.permissions.includes(perm);
            });

            setPermissions(permissionsData);
        } catch (err) {
            console.error("Error fetching permissions:", err);
            setError("Failed to load permissions. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fileInputRef = useRef(null);

    const handleEditAvatar = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("file", file);

            try {
                const dataResponse = await UploadAvatar(formData);
                // data.url là đường dẫn ảnh mới trả về từ backend
                // Cập nhật lại avatar trên FE nếu muốn
            } catch (error) {
                // Xử lý lỗi
            }
        }
    };




    return (
        <>
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                <div className="relative">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between mt-8">
                        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                            <div className="relative w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                                <img src="/images/user/owner.jpg" alt="user" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={handleEditAvatar}
                                    className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                                    title="Chỉnh sửa ảnh"
                                >
                                    {/* Icon bút chì */}
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                        <path d="M16.862 5.487a2.06 2.06 0 0 1 2.916 2.915l-9.03 9.03-3.89.974.974-3.89 9.03-9.03Z" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                            <div className="order-3 xl:order-2">
                                <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                                    {user?.fullName}
                                </h4>
                                <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {user?.nameRole}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end"></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
