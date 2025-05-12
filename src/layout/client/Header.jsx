/* eslint-disable linebreak-style */
/* eslint-disable no-unused-vars */
/* eslint-disable react/button-has-type */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable import/extensions */
/* eslint-disable react/prop-types */
import React, { useState } from 'react';

import { Transition } from '@headlessui/react';
import {NavLink, useLocation} from "react-router";
import BrandIcon from "../../part/BrandIcon.jsx";
import Button from "../../part/Button.jsx";

export default function Header() {
    const [isCollapse, setIsCollapse] = useState(false);
    const location = useLocation();
    const path = location.pathname;

    return (
        <header className="bg-white sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 md:h-20">

                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <BrandIcon className="h-8 w-auto md:h-10" />
                    </div>

                    {/* Desktop Navigation */}
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-4">
                        {[
                            { href: '/', text: 'Trang chủ' },
                            { href: '/gia-van-chuyen', text: 'Báo giá' },

                            { href: '/team', text: 'Giới thiệu' },
                            { href: '/tao-don-hang', text: 'Tạo đơn' },

                            { href: '/signin', text: 'Đăng nhập' },

                        ].map((item) =>
                                item.text === 'Đăng nhập' ? (
                                    <NavLink
                                        key={item.href}
                                        to={item.href}
                                        className="relative inline-block px-4 py-2 text-sm font-bold text-white rounded-md shadow-lg
                   bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400
                   hover:scale-105 transform transition duration-300 ease-in-out
                   animate-pulse"
                                    >
                                        🔥 {item.text}
                                    </NavLink>
                                ) : item.subItems ? (
                                    <div
                                        key={item.href}
                                        className={`relative group px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                                            path === item.href
                                                ? 'text-purple-600 bg-purple-50'
                                                : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                                        }`}
                                    >
        <span className="flex items-center cursor-pointer">
          {item.text}
            <svg
                className="w-4 h-4 ml-1 inline-block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>

                                        {/* Dropdown menu */}
                                        <div className="absolute left-0 top-full mt-2 w-56 origin-top-left bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                            <div className="py-1">
                                                {item.subItems.map((subItem) => (
                                                    <NavLink
                                                        key={subItem.href}
                                                        to={subItem.href}
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 w-full text-left"
                                                    >
                                                        {subItem.text}
                                                    </NavLink>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <NavLink
                                        key={item.href}
                                        to={item.href}
                                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                                            path === item.href
                                                ? 'text-purple-600 bg-purple-50'
                                                : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                                        }`}
                                    >
                                        {item.text}
                                    </NavLink>
                                )
                        )}

                        {/* Nút liên hệ */}
                        <a
                            href="tel:0932667533"
                            className="ml-4 px-4 py-2 bg-theme-purple text-white text-sm font-medium rounded-md hover:bg-purple-700"
                        >
                            Liên hệ
                        </a>
                    </nav>



                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsCollapse(!isCollapse)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-purple-50 focus:outline-none"
                            aria-expanded="false"
                        >
                            {!isCollapse ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <Transition
                show={isCollapse}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <div className="md:hidden bg-white shadow-lg">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {[
                            { href: '/', text: 'Trang chủ' },
                            { href: '/gia-van-chuyen', text: 'Báo giá' },
                            { href: '/team', text: 'Giới thiệu' },
                            { href: '/tao-don-hang', text: 'Tạo đơn' },

                            { href: '/signin', text: 'Đăng nhập' },

                        ].map((item) =>
                            item.subItems ? (
                                <div key={item.href} className="space-y-1">
                                    <Button
                                        href={item.href}
                                        type="link"
                                        className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                                            path === item.href
                                                ? 'bg-purple-100 text-purple-600'
                                                : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                                        }`}
                                        onClick={() => setIsCollapse(false)}
                                    >
                                        {item.text}
                                    </Button>

                                    {/* Sub items */}
                                    <div className="pl-4 space-y-1">
                                        {item.subItems.map((subItem) => (
                                            <Button
                                                key={subItem.href}
                                                href={subItem.href}
                                                type="link"
                                                className={`block px-3 py-2 rounded-md text-sm font-medium w-full text-left ${
                                                    path === subItem.href
                                                        ? 'bg-purple-50 text-purple-600'
                                                        : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                                                }`}
                                                onClick={() => setIsCollapse(false)}
                                            >
                                                {subItem.text}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            ) : item.isHot ? (
                                // Nút "Khuyến mãi" nổi bật
                                <Button
                                    key={item.href}
                                    href={item.href}
                                    type="link"
                                    className="relative block px-3 py-2 rounded-md text-base font-bold w-full text-left text-white bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 animate-pulse hover:scale-105 transform transition duration-300 ease-in-out shadow-lg"
                                    onClick={() => setIsCollapse(false)}
                                >
                                    🔥 {item.text}
                                </Button>
                            ) : (
                                <Button
                                    key={item.href}
                                    href={item.href}
                                    type="link"
                                    className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                                        path === item.href
                                            ? 'bg-purple-100 text-purple-600'
                                            : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                                    }`}
                                    onClick={() => setIsCollapse(false)}
                                >
                                    {item.text}
                                </Button>
                            )
                        )}

                        {/* Nút liên hệ Zalo */}
                        <Button
                            type="button"
                            onClick={() => {
                                const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                                const zaloURL = 'https://zaloapp.com/qr/p/1qg64agb3q6dw';

                                if (isIOS) {
                                    window.location.href = zaloURL;
                                } else {
                                    window.open(zaloURL, '_blank');
                                }
                                setIsCollapse(false);
                            }}
                            className="block w-full mt-2 px-4 py-2 bg-theme-purple text-white text-center rounded-md hover:bg-purple-700"
                        >
                            Liên hệ
                        </Button>
                    </div>
                </div>
            </Transition>

        </header>
    );
}
