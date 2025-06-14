import { useModal } from "../../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import { useEffect, useState } from "react";
import { GetAllPermissions, GetUserPermissions, UpdateUserPermissions } from "../../../service/api.admin.service";

export default function UserMetaCard({ user }) {
  const { isOpen, openModal, closeModal } = useModal();
  const [currentUser, setCurrentUser] = useState(user);
  const [allPermissions, setAllPermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy danh sách quyền từ backend khi modal mở
  useEffect(() => {
    if (isOpen && user?.id) {
      fetchPermissions();
    }
  }, [isOpen, user?.id]);

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

  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    setPermissions(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const permissionsArray = Object.keys(permissions).filter(key => permissions[key]);
      await UpdateUserPermissions({
        account_id: user.id,
        permissions: permissionsArray
      });

      console.log("Permissions saved:", permissionsArray);
      closeModal();

      alert("Permissions updated successfully");
    } catch (error) {
      console.error("Error saving permissions:", error);
      setError("Failed to update permissions. Please try again.");
      alert("Failed to update permissions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatPermissionName = (permName) => {
    return permName
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="relative">
          <button
            onClick={openModal}
            className="absolute top-0 right-0 flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Edit
          </button>
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

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-3xl mx-auto p-0 rounded-3xl bg-white shadow-lg dark:bg-gray-900"
      >
        <div className="w-full">
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Edit User Permissions
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Select the permissions for user {user?.fullName}
              </p>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">{error}</p>
                  <Button
                    size="sm"
                    className="mt-4"
                    onClick={fetchPermissions}
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Permission Checkboxes */}
                  {Object.keys(permissions).map(permName => (
                    <div key={permName} className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                      <Label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name={permName}
                          checked={permissions[permName]}
                          onChange={handlePermissionChange}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span>{formatPermissionName(permName)}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <Button size="sm" variant="outline" onClick={closeModal} type="button">
                Cancel
              </Button>
              <Button
                size="sm"
                type="submit"
                disabled={loading}
                className={loading ? "opacity-70 cursor-not-allowed" : ""}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
