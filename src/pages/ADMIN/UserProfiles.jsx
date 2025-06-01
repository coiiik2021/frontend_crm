import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/admin/common/PageBreadCrumb";
import UserMetaCard from "../../components/admin/profile/UserMetaCard";
import UserInfoCard from "../../components/admin/profile/UserInfoCard";
import PageMeta from "../../components/admin/common/PageMeta";
import UserService from "../../components/admin/profile/UserService";
import UserOfManager from "../../components/admin/profile/UserOfManager";



export default function UserProfiles() {
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);

  // Nếu location.state thay đổi (ví dụ do redirect), cập nhật lại user
  useEffect(() => {
    if (location.state?.user) {
      setUser(location.state.user);
    }
  }, [location.state]);
  return (
    <>
      <PageMeta
        title="React.js Profile Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard user={user} />
          <UserInfoCard user={user} setUser={setUser} />
          <UserService user={user} />
          {
            user.nameRole === "MANAGER" && (
              <UserOfManager user={user} />
            )
          }
        </div>
      </div>
    </>
  );
}
