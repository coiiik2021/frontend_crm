import { useLocation } from "react-router-dom";
import PageBreadcrumb from "../../components/admin/common/PageBreadCrumb";
import UserMetaCard from "../../components/admin/UserProfile/UserMetaCard";
import UserInfoCard from "../../components/admin/UserProfile/UserInfoCard";
import UserService from "../../components/admin/UserProfile/UserService";
import PageMeta from "../../components/admin/common/PageMeta";

export default function UserProfiles() {
  const location = useLocation();
  const user = location.state?.user;
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
          <UserInfoCard user={user} />
          <UserService user={user} />
        </div>
      </div>
    </>
  );
}
