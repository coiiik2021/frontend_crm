import React from 'react';
import BrandIcon from "../../part/BrandIcon.jsx";
import {Button} from "@headlessui/react";

export default function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-200 py-12 px-6 sm:px-8">
            <script src="https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1"></script>
            <df-messenger
                chat-title="ebay_express"
                agent-id="1047dcdb-f8cf-4913-8d54-7b15c3be0b49"
                language-code="vi"
            ></df-messenger>
            <div className="max-w-7xl mx-auto">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
                    {/* Brand Section */}
                    <div className="md:col-span-4 lg:col-span-3">
                        <div className="flex flex-col space-y-4">
                            <BrandIcon />
                            <p className="text-gray-600 leading-relaxed">
                            </p>
                            <div className="flex space-x-4 mt-2">
                                <Button
                                    href="https://www.facebook.com/profile.php?id=61575197381868"
                                    type="link"
                                    isExternal
                                    className="text-gray-500 hover:text-theme-blue transition-colors duration-300"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                    </svg>
                                </Button>
                                <Button
                                    href="#"
                                    type="link"
                                    isExternal
                                    className="text-gray-500 hover:text-theme-blue transition-colors duration-300"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </Button>
                                <Button
                                    href="#"
                                    type="link"
                                    isExternal
                                    className="text-gray-500 hover:text-theme-blue transition-colors duration-300"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-5 h-5"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.056 1.97.24 2.427.408a4.915 4.915 0 011.738 1.01 4.915 4.915 0 011.01 1.738c.168.457.352 1.256.408 2.427.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.408 2.427a4.915 4.915 0 01-1.01 1.738 4.915 4.915 0 01-1.738 1.01c-.457.168-1.256.352-2.427.408-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.97-.24-2.427-.408a4.915 4.915 0 01-1.738-1.01 4.915 4.915 0 01-1.01-1.738c-.168-.457-.352-1.256-.408-2.427C2.212 15.784 2.2 15.4 2.2 12.2s.012-3.584.07-4.85c.056-1.17.24-1.97.408-2.427a4.915 4.915 0 011.01-1.738 4.915 4.915 0 011.738-1.01c.457-.168 1.256-.352 2.427-.408C8.416 2.212 8.8 2.2 12 2.2zm0 1.8c-3.153 0-3.522.012-4.766.069-1.048.05-1.613.218-1.99.364a3.104 3.104 0 00-1.132.739 3.104 3.104 0 00-.739 1.132c-.146.377-.314.942-.364 1.99C3.012 8.478 3 8.847 3 12s.012 3.522.069 4.766c.05 1.048.218 1.613.364 1.99a3.104 3.104 0 00.739 1.132 3.104 3.104 0 001.132.739c.377.146.942.314 1.99.364C8.478 20.988 8.847 21 12 21s3.522-.012 4.766-.069c1.048-.05 1.613-.218 1.99-.364a3.104 3.104 0 001.132-.739 3.104 3.104 0 00.739-1.132c.146-.377.314-.942.364-1.99.058-1.244.069-1.613.069-4.766s-.012-3.522-.069-4.766c-.05-1.048-.218-1.613-.364-1.99a3.104 3.104 0 00-.739-1.132 3.104 3.104 0 00-1.132-.739c-.377-.146-.942-.314-1.99-.364C15.522 4.012 15.153 4 12 4zm0 3.6a4.4 4.4 0 110 8.8 4.4 4.4 0 010-8.8zm0 1.8a2.6 2.6 0 100 5.2 2.6 2.6 0 000-5.2zm5.6-.9a1.1 1.1 0 110 2.2 1.1 1.1 0 010-2.2z" />
                                    </svg>

                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="md:col-span-4 lg:col-span-3">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Liên kết nhanh</h3>
                        <nav className="space-y-2">
                            <Button
                                href="/"
                                type="link"
                                className="text-gray-600 hover:text-theme-blue transition-colors duration-300 block"
                            >
                                Dịch vụ
                            </Button>
                            <Button
                                href="/gia-van-chuyen"
                                type="link"
                                className="text-gray-600 hover:text-theme-blue transition-colors duration-300 block"
                            >
                                Bảng giá
                            </Button>
                            <Button
                                href="/"
                                type="link"
                                className="text-gray-600 hover:text-theme-blue transition-colors duration-300 block"
                            >
                                Theo dõi đơn hàng
                            </Button>
                            <Button
                                href="/team"
                                type="link"
                                className="text-gray-600 hover:text-theme-blue transition-colors duration-300 block"
                            >
                                Về chúng tôi
                            </Button>
                        </nav>
                    </div>

                    {/* Contact Info */}
                    <div className="md:col-span-4 lg:col-span-3">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Liên hệ</h3>

                        {/* Company Info */}
                        <div className="text-gray-700 mb-4">CT TNHH TM-DV VẬN CHUYỂN QUỐC TẾ EBAY EXPRESS</div>

                        <div className="space-y-4">
                            {/* Email */}
                            <div className="flex items-start">
                                <svg
                                    className="h-5 w-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                                <a
                                    href="mailto:ebayexpressvn@gmail.com"
                                    className="text-gray-600 hover:text-blue-500 hover:underline"
                                >
                                    ebayexpressvn@gmail.com
                                </a>
                            </div>

                            {/* Phone */}
                            <div className="flex items-start">
                                <svg
                                    className="h-5 w-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                    />
                                </svg>
                                <a
                                    href="tel:0932667533"
                                    className="text-gray-600 hover:text-blue-500 hover:underline"
                                >
                                    0932 667 533
                                </a>
                            </div>

                            {/* Address */}
                            <div className="flex items-start">
                                <svg
                                    className="h-5 w-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                <p className="text-gray-700">
                                    300 Độc Lập, phường Tân Quý, quận Tân Phú, TP. Hồ Chí Minh
                                </p>
                            </div>
                        </div>

                        {/* Map - Moved to bottom */}
                        <div className="mt-6 rounded-lg overflow-hidden shadow-md border border-gray-200">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.2341303037997!2d106.62475783271428!3d10.793371767419982!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752b158fecc1cb%3A0x512354e49ecbc2bc!2zVuG6rW4gY2h1eeG7g24gcXXhu5FjIHThur8gRWJheWV4cHJlc3M!5e0!3m2!1svi!2s!4v1745223981599!5m2!1svi!2s"
                                width="100%"
                                height="200"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="w-full"
                                title="Bản đồ vị trí eBay Express"
                            ></iframe>
                        </div>
                    </div>


                    {/* Newsletter */}
                    <div className="md:col-span-12 lg:col-span-3">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Đăng ký nhận tin</h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3">Nhận thông tin khuyến mãi và cập nhật mới nhất từ chúng tôi.</p>
                        <form className="flex">
                            {/* <input
      type="email"
      placeholder="Email của bạn"
      className="flex-grow px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-theme-blue focus:border-transparent"
      required
    /> */}
                            <Button
                                type="button"
                                onClick={() => {
                                    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                                    const zaloURL = 'https://zaloapp.com/qr/p/1qg64agb3q6dw';

                                    if (isIOS) {
                                        // iOS: dùng location.href để tránh bị reload
                                        window.location.href = zaloURL;
                                    } else {
                                        // Android: vẫn dùng window.open nếu muốn mở tab mới
                                        window.open(zaloURL, '_blank');
                                    }
                                }}
                                className="bg-theme-blue text-white px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-r-lg hover:bg-blue-700 transition-colors duration-300"
                            >
                                Liên hệ
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-12 pt-6 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} Ebay Express. All rights reserved.
                    </p>
                </div>
            </div>

        </footer>
    );
}