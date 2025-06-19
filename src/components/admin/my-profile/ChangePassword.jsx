import { useState } from "react";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import axios from "axios";

export default function ChangePassword() {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage("Mật khẩu mới và xác nhận không khớp!");
            return;
        }
        try {
            await axios.post("/update-password", {
                oldPassword,
                newPassword,
            });
            setMessage("Đổi mật khẩu thành công!");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            setMessage("Đổi mật khẩu thất bại!");
        }
    };

    return (
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 max-w-md">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
                Đổi mật khẩu
            </h4>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
                <Button type="submit">Save</Button>
                {message && (
                    <p className="mt-2 text-center text-red-500">{message}</p>
                )}
            </form>
        </div>
    );
}