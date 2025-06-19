import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/admin/common/PageBreadCrumb";
import UserMetaCard from "../../components/admin/my-profile/UserMetaCard";
import UserInfoCard from "../../components/admin/my-profile/UserInfoCard";
import PageMeta from "../../components/admin/common/PageMeta";
import UserService from "../../components/admin/profile/UserService";
import UserOfManager from "../../components/admin/profile/UserOfManager";
import { GetCurrentUser } from "../../service/api.admin.service";
import ChangePassword from "../../components/admin/my-profile/ChangePassword"

export default function MyProfile() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function fetchUser() {
            const currentUser = await GetCurrentUser();
            setUser(currentUser);
        }
        fetchUser();
    }, []);

    return (
        <>
            <PageMeta
                title="My Profile"
                description="This is your profile page."
            />
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
                    My Profile
                </h3>
                <div className="space-y-6">
                    <UserMetaCard user={user} />
                    <UserInfoCard user={user} setUser={setUser} /> {/* <-- Truyền user hiện tại */}
                </div>
            </div>
        </>
    );
}