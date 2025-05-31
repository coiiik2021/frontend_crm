import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router";
import BrandIcon from "../../part/BrandIcon.jsx";
import Button from "../../part/Button.jsx";
import { jwtDecode } from "jwt-decode";

export default function Header() {
    const [isCollapse, setIsCollapse] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // State để kiểm tra trạng thái đăng nhập
    const location = useLocation();
    const path = location.pathname;
    const [authorities, setAuthorities] = useState([]);

    useEffect(() => {
        // Kiểm tra token trong localStorage
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token); // Nếu có token, đặt isLoggedIn thành true
        const decoded = jwtDecode(token);
        setAuthorities(decoded.authorities || []);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        window.location.href = "/signin";
    };

    return (
        <header className="bg-white sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 md:h-20">

                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <BrandIcon className="h-8 w-auto md:h-10" />
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-4">
                        {[
                            { href: "/", text: "Trang chủ" },
                            { href: "/gia-van-chuyen", text: "Báo giá" },
                            { href: "/team", text: "Giới thiệu" },
                            { href: "/tao-don-hang", text: "Tạo đơn" },
                        ].map((item) => (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                className={`px-3 py-2 rounded-md text-sm font-medium ${path === item.href
                                    ? "text-purple-600 bg-purple-50"
                                    : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                                    }`}
                            >
                                {item.text}
                            </NavLink>
                        ))}

                        {/* Hiển thị nút dựa trên trạng thái đăng nhập */}
                        {isLoggedIn ? (
                            <div className="flex items-center space-x-4">
                                <NavLink
                                    to={authorities.includes('ADMIN') ? '/quan-ly' : authorities.includes('USER') ? '/quan-ly/shipment' : '/quan-ly/user-table'}
                                    className="px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-md hover:bg-purple-700"
                                >
                                    Quản lý tài khoản
                                </NavLink>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-700"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <NavLink
                                to="/signin"
                                className="relative inline-block px-4 py-2 text-sm font-bold text-white rounded-md shadow-lg
                   bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400
                   hover:scale-105 transform transition duration-300 ease-in-out
                   animate-pulse"
                            >
                                🔥 Đăng nhập
                            </NavLink>
                        )}


                    </nav>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsCollapse(!isCollapse)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-purple-50 focus:outline-none"
                            aria-expanded="false"
                        >
                            {!isCollapse ? (
                                <svg
                                    className="block h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="block h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}