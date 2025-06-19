import { useModal } from "../../../hooks/useModal";
import { useEffect, useState } from "react";
import { GetAllPermissions, GetUserPermissions, UpdateUserPermissions } from "../../../service/api.admin.service";

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



    return (
        <>
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                <div className="relative">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between mt-8">
                        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                                <img src="/images/user/owner.jpg" alt="user" />
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
