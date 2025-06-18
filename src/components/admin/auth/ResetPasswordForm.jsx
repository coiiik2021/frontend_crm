import { Link } from "react-router";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { useState } from "react";
import axios from "axios";
import { message } from 'antd';
import { APIResetPassword } from "../../../service/api.auth.service";
import { toast } from "react-toastify";


const ResetPasswordForm = () => {

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [notification, setNotification] = useState({ open: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ open: true, message, type });
    setTimeout(() => setNotification({ open: false, message: "", type }), 3000);
  };

  const handleResetPassword = async () => {


    try {
      // Hiển thị thông báo đang xử lý
      const loadingToast = toast.loading("Đang gửi email...");
      const response = await APIResetPassword(email);
      console.log(response);

      if (response.length === 10) {
        toast.update(loadingToast, {
          render: "reset password correct",
          type: "success",
          isLoading: false,
          autoClose: 3000
        });

        // Chuyển hướng sau khi hiển thị thông báo thành công
        setTimeout(() => {
          window.location.href = "/";
        }, 5000);
      } else {
        toast.update(loadingToast, {
          render: "Có lỗi xảy ra khi tạo đơn hàng.",
          type: "error",
          isLoading: false,
          autoClose: 3000
        });
      }
    } catch (error) {
      // Xử lý lỗi và hiển thị thông báo
      console.error("Error creating order:", error);
      toast.error(`Lỗi: ${error.message || "Không thể tạo đơn hàng"}`);
    }
    // console.log(import.meta.env.VITE_APP_API_URL + `/api/reset/${email}`);

    // await axios.put(import.meta.env.VITE_APP_API_URL + `/api/reset/${email}`)

  }

  return (
    <div className="flex flex-col flex-1 w-full lg:w-1/2">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <svg
            className="stroke-current"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M12.7083 5L7.5 10.2083L12.7083 15.4167"
              stroke=""
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Forgot Your Password?
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter the email address linked to your account, and we’ll send you a
            link to reset your password.
          </p>
        </div>
        <div>
          <form>
            <div className="space-y-5">
              {/* <!-- Email --> */}
              <div>
                <Label>
                  Email<span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* <!-- Button --> */}
              <div>
                <button onClick={async (e) => {
                  e.preventDefault();
                  handleResetPassword();
                }} className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
                  Send Reset Link
                </button>
              </div>
            </div>
          </form>
          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Wait, I remember my password...
              <Link
                to="/"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Click here
              </Link>
            </p>
          </div>
        </div>
      </div>
      {/* <Form
        name="change-password"
        onFinish={onFinish}
        layout="vertical"
        style={{ maxWidth: 400, margin: '0 auto' }}
      >
        <Form.Item
          label="Mật khẩu cũ"
          name="oldPassword"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Đổi mật khẩu
          </Button>
        </Form.Item>
      </Form> */}

      {notification.open && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg text-white transition-all
            ${notification.type === "success" ? "bg-green-500" : "bg-red-500"}`}
        >
          {notification.message}
        </div>
      )}
    </div>


  );
}

export default ResetPasswordForm;