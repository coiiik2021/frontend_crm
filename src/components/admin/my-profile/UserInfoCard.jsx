import { useModal } from "../../../hooks/useModal";
import { Modal } from "../ui/modal";
import { useState, useEffect } from "react";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { PutBaseUser } from "../../../service/api.admin.service";
import { ChangePassword } from "../../../service/api.admin.service";
import axios from "axios";

export default function UserInfoCard({ user, setUser }) {
    // Modal chỉnh sửa thông tin cá nhân
    const { isOpen, openModal, closeModal } = useModal();
    // Modal đổi mật khẩu
    const { isOpen: isOpenPwd, openModal: openModalPwd, closeModal: closeModalPwd } = useModal();

    const [currentUser, setCurrentUser] = useState(user);
    useEffect(() => {
        setCurrentUser(user);
    }, [user]);

    // State đổi mật khẩu
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pwdMessage, setPwdMessage] = useState("");

    // Xử lý thay đổi thông tin cá nhân
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentUser((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await PutBaseUser(currentUser);
            setUser((prevUser) => ({
                ...prevUser,
                ...currentUser,
            }));
            closeModal();
            console.log("User updated successfully");
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    // Xử lý đổi mật khẩu
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPwdMessage("Mật khẩu mới và xác nhận không khớp!");
            return;
        }
        try {
            await ChangePassword({ oldPassword, newPassword });
            setPwdMessage("Đổi mật khẩu thành công!");
            setTimeout(() => {
                setPwdMessage("");
                closeModalPwd();
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }, 1200);
        } catch (error) {
            setPwdMessage("Mật khẩu cũ không đúng hoặc có lỗi xảy ra!");
        }
    };

    return (
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <div className="flex flex-col gap-6">
                {/* Tiêu đề và hai nút cùng hàng */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Personal Information
                    </h4>
                    <div className="flex gap-2 mt-2 lg:mt-0">
                        {/* Nút Edit */}
                        <button
                            onClick={openModal}
                            className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
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
                        {/* Nút Change Password */}
                        <button
                            onClick={openModalPwd}
                            className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
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
                                    d="M9 1.5C6.23858 1.5 4 3.73858 4 6.5V8.5C2.89543 8.5 2 9.39543 2 10.5V14.5C2 15.6046 2.89543 16.5 4 16.5H14C15.1046 16.5 16 15.6046 16 14.5V10.5C16 9.39543 15.1046 8.5 14 8.5V6.5C14 3.73858 11.7614 1.5 9 1.5ZM6 6.5C6 4.84315 7.34315 3.5 9 3.5C10.6569 3.5 12 4.84315 12 6.5V8.5H6V6.5ZM4 10.5H14V14.5H4V10.5Z"
                                    fill=""
                                />
                            </svg>
                            Change Password
                        </button>
                    </div>
                </div>
                {/* Thông tin cá nhân */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                    <div>
                        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                            Full name
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                            {user?.fullName}
                        </p>
                    </div>
                    <div>
                        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                            Gender
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                            {user?.gender}
                        </p>
                    </div>
                    <div>
                        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                            Date of birth
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                            {user?.dateOfBirth}
                        </p>
                    </div>
                    <div>
                        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                            Email address
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                            {user?.email}
                        </p>
                    </div>
                    <div>
                        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                            Phone
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                            {user?.phone}
                        </p>
                    </div>
                    <div>
                        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                            Salary
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                            {user?.salary}
                        </p>
                    </div>
                    <div>
                        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                            KPI
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                            {user?.kpi}
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal chỉnh sửa thông tin cá nhân */}
            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Edit Personal Information
                        </h4>
                        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                            Update your details to keep your profile up-to-date.
                        </p>
                    </div>
                    <form className="flex flex-col" onSubmit={handleSubmit}>
                        <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                            <div className="mt-7">
                                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                                    Personal Information
                                </h5>
                                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                    <div>
                                        <Label>Full name</Label>
                                        <Input
                                            type="text"
                                            name="fullName"
                                            value={currentUser?.fullName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <Label>Gender</Label>
                                        <select
                                            name="gender"
                                            value={currentUser?.gender || "Other"}
                                            onChange={handleChange}
                                            className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-800 dark:text-white"
                                        >
                                            <option value="Other">Other</option>
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label>Date of birth</Label>
                                        <Input
                                            type="date"
                                            name="dateOfBirth"
                                            value={currentUser?.dateOfBirth || ""}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <Label>Phone</Label>
                                        <Input
                                            type="text"
                                            name="phone"
                                            value={currentUser?.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <Label>Salary</Label>
                                        <Input
                                            type="number"
                                            name="salary"
                                            value={currentUser?.salary}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <Label>KPI</Label>
                                        <Input
                                            type="number"
                                            name="kpi"
                                            value={currentUser?.kpi}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                            <Button
                                size="sm"
                                variant="outline"
                                type="button"
                                onClick={closeModal}
                            >
                                Close
                            </Button>
                            <Button size="sm" type="submit">
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal đổi mật khẩu */}
            <Modal isOpen={isOpenPwd} onClose={closeModalPwd} className="max-w-[400px] m-4">
                <div className="p-4">
                    <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                        Đổi mật khẩu
                    </h4>
                    <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                        <div>
                            <Label>Mật khẩu cũ</Label>
                            <Input
                                type="password"
                                value={oldPassword}
                                onChange={e => setOldPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label>Mật khẩu mới</Label>
                            <Input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label>Xác nhận mật khẩu mới</Label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={closeModalPwd}>
                                Đóng
                            </Button>
                            <Button type="submit">Save</Button>
                        </div>
                        {pwdMessage && (
                            <p className="mt-2 text-center text-red-500">{pwdMessage}</p>
                        )}
                    </form>
                </div>
            </Modal>
        </div>
    );
}