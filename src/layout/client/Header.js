"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Header;
var jsx_runtime_1 = require("react/jsx-runtime");
/* eslint-disable linebreak-style */
/* eslint-disable no-unused-vars */
/* eslint-disable react/button-has-type */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable import/extensions */
/* eslint-disable react/prop-types */
var react_1 = require("react");
var react_2 = require("@headlessui/react");
var react_router_1 = require("react-router");
var BrandIcon_jsx_1 = require("../../part/BrandIcon.jsx");
var Button_jsx_1 = require("../../part/Button.jsx");
function Header() {
    var _a = (0, react_1.useState)(false), isCollapse = _a[0], setIsCollapse = _a[1];
    var location = (0, react_router_1.useLocation)();
    var path = location.pathname;
    return ((0, jsx_runtime_1.jsxs)("header", { className: "bg-white sticky top-0 z-50 shadow-sm", children: [(0, jsx_runtime_1.jsx)("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center h-16 md:h-20", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0", children: (0, jsx_runtime_1.jsx)(BrandIcon_jsx_1.default, { className: "h-8 w-auto md:h-10" }) }), (0, jsx_runtime_1.jsxs)("nav", { className: "hidden md:flex space-x-4", children: [[
                                    { href: '/', text: 'Trang chủ' },
                                    { href: '/gia-van-chuyen', text: 'Báo giá' },
                                    { href: '/team', text: 'Giới thiệu' },
                                    { href: '/tao-don-hang', text: 'Tạo đơn' },
                                    { href: '/signin', text: 'Đăng nhập' },
                                ].map(function (item) {
                                    return item.text === 'Đăng nhập' ? ((0, jsx_runtime_1.jsxs)(react_router_1.NavLink, { to: item.href, className: "relative inline-block px-4 py-2 text-sm font-bold text-white rounded-md shadow-lg\n                   bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400\n                   hover:scale-105 transform transition duration-300 ease-in-out\n                   animate-pulse", children: ["\uD83D\uDD25 ", item.text] }, item.href)) : item.subItems ? ((0, jsx_runtime_1.jsxs)("div", { className: "relative group px-3 py-2 rounded-md text-sm font-medium flex items-center ".concat(path === item.href
                                            ? 'text-purple-600 bg-purple-50'
                                            : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'), children: [(0, jsx_runtime_1.jsxs)("span", { className: "flex items-center cursor-pointer", children: [item.text, (0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4 ml-1 inline-block", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "absolute left-0 top-full mt-2 w-56 origin-top-left bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50", children: (0, jsx_runtime_1.jsx)("div", { className: "py-1", children: item.subItems.map(function (subItem) { return ((0, jsx_runtime_1.jsx)(react_router_1.NavLink, { to: subItem.href, className: "block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 w-full text-left", children: subItem.text }, subItem.href)); }) }) })] }, item.href)) : ((0, jsx_runtime_1.jsx)(react_router_1.NavLink, { to: item.href, className: "px-3 py-2 rounded-md text-sm font-medium ".concat(path === item.href
                                            ? 'text-purple-600 bg-purple-50'
                                            : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'), children: item.text }, item.href));
                                }), (0, jsx_runtime_1.jsx)("a", { href: "tel:0932667533", className: "ml-4 px-4 py-2 bg-theme-purple text-white text-sm font-medium rounded-md hover:bg-purple-700", children: "Li\u00EAn h\u1EC7" })] }), (0, jsx_runtime_1.jsx)("div", { className: "md:hidden", children: (0, jsx_runtime_1.jsx)("button", { onClick: function () { return setIsCollapse(!isCollapse); }, className: "inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-purple-50 focus:outline-none", "aria-expanded": "false", children: !isCollapse ? ((0, jsx_runtime_1.jsx)("svg", { className: "block h-6 w-6", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" }) })) : ((0, jsx_runtime_1.jsx)("svg", { className: "block h-6 w-6", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })) }) })] }) }), (0, jsx_runtime_1.jsx)(react_2.Transition, { show: isCollapse, enter: "transition ease-out duration-100", enterFrom: "transform opacity-0 scale-95", enterTo: "transform opacity-100 scale-100", leave: "transition ease-in duration-75", leaveFrom: "transform opacity-100 scale-100", leaveTo: "transform opacity-0 scale-95", children: (0, jsx_runtime_1.jsx)("div", { className: "md:hidden bg-white shadow-lg", children: (0, jsx_runtime_1.jsxs)("div", { className: "px-2 pt-2 pb-3 space-y-1 sm:px-3", children: [[
                                { href: '/', text: 'Trang chủ' },
                                { href: '/gia-van-chuyen', text: 'Báo giá' },
                                { href: '/team', text: 'Giới thiệu' },
                                { href: '/tao-don-hang', text: 'Tạo đơn' },
                                { href: '/signin', text: 'Đăng nhập' },
                            ].map(function (item) {
                                return item.subItems ? ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-1", children: [(0, jsx_runtime_1.jsx)(Button_jsx_1.default, { href: item.href, type: "link", className: "block px-3 py-2 rounded-md text-base font-medium w-full text-left ".concat(path === item.href
                                                ? 'bg-purple-100 text-purple-600'
                                                : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'), onClick: function () { return setIsCollapse(false); }, children: item.text }), (0, jsx_runtime_1.jsx)("div", { className: "pl-4 space-y-1", children: item.subItems.map(function (subItem) { return ((0, jsx_runtime_1.jsx)(Button_jsx_1.default, { href: subItem.href, type: "link", className: "block px-3 py-2 rounded-md text-sm font-medium w-full text-left ".concat(path === subItem.href
                                                    ? 'bg-purple-50 text-purple-600'
                                                    : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'), onClick: function () { return setIsCollapse(false); }, children: subItem.text }, subItem.href)); }) })] }, item.href)) : item.isHot ? (
                                // Nút "Khuyến mãi" nổi bật
                                (0, jsx_runtime_1.jsxs)(Button_jsx_1.default, { href: item.href, type: "link", className: "relative block px-3 py-2 rounded-md text-base font-bold w-full text-left text-white bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 animate-pulse hover:scale-105 transform transition duration-300 ease-in-out shadow-lg", onClick: function () { return setIsCollapse(false); }, children: ["\uD83D\uDD25 ", item.text] }, item.href)) : ((0, jsx_runtime_1.jsx)(Button_jsx_1.default, { href: item.href, type: "link", className: "block px-3 py-2 rounded-md text-base font-medium w-full text-left ".concat(path === item.href
                                        ? 'bg-purple-100 text-purple-600'
                                        : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'), onClick: function () { return setIsCollapse(false); }, children: item.text }, item.href));
                            }), (0, jsx_runtime_1.jsx)(Button_jsx_1.default, { type: "button", onClick: function () {
                                    var isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                                    var zaloURL = 'https://zaloapp.com/qr/p/1qg64agb3q6dw';
                                    if (isIOS) {
                                        window.location.href = zaloURL;
                                    }
                                    else {
                                        window.open(zaloURL, '_blank');
                                    }
                                    setIsCollapse(false);
                                }, className: "block w-full mt-2 px-4 py-2 bg-theme-purple text-white text-center rounded-md hover:bg-purple-700", children: "Li\u00EAn h\u1EC7" })] }) }) })] }));
}
