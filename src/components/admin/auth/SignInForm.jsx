import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom"; // ✅ Sửa import
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { APILogin } from "../../../service/api.auth.service";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();

  const [accountRequest, setAccountRequest] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async () => {
    if (!accountRequest.email.trim() || !accountRequest.password.trim()) {
      toast.error("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    const toastId = toast.loading("Đang cập nhật dữ liệu...");

    try {
      const response = await APILogin(accountRequest);

      if (!response?.accessToken) {
        console.error("Token không tồn tại");
        throw new Error("Token không tồn tại");
      } else {

        localStorage.setItem("token", response.accessToken);

        let decoded;
        try {
          decoded = jwtDecode(response.accessToken);
          const authorities = decoded.authorities || [];

          if (authorities.includes("ADMIN")) {
            navigate("/quan-ly");
          } else if (authorities.includes("MANAGER")) {
            navigate("/quan-ly/user-table");
          } else if (
            ["TRANSPORTER", "ACCOUNTANT", "BD", "USER", "CS"].some(role => authorities.includes(role))
          ) {
            navigate("/quan-ly/shipment");
          } else {
            throw new Error("Không xác định được quyền người dùng");
          }

          toast.update(toastId, {
            render: "Đăng nhập tài khoản thành công",
            type: "success",
            isLoading: false,
            autoClose: 2000,
          });
        } catch (e) {
          throw new Error("Không thể giải mã token");
        }
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      toast.update(toastId, {
        render: "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };


  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <NavLink
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </NavLink>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
          </div>
          <div>
            <form
              className="flex flex-col"
              onSubmit={async (e) => {
                e.preventDefault();
                await handleLogin();
              }}
            >
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="info@gmail.com"
                    value={accountRequest.email}
                    onChange={(e) =>
                      setAccountRequest({ ...accountRequest, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={accountRequest.password}
                      onChange={(e) =>
                        setAccountRequest({ ...accountRequest, password: e.target.value })
                      }
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <NavLink
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </NavLink>
                </div>
                <div>
                  <Button type="submit" className="w-full">
                    Sign in
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
