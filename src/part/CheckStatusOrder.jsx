import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';

export default function CheckStatusOrder() {
    const [inputValue, setInputValue] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [dataButton, setDataButton] = useState(true);
    const [loading, setLoading] = useState(false);
    const [hang, setHang] = useState("UPS");
    const formRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (formRef.current) {
            if (showForm) {
                formRef.current.style.maxHeight = formRef.current.scrollHeight + 'px';
            } else {
                formRef.current.style.maxHeight = '0';
            }
        }
        const searchParams = new URLSearchParams(location.search);
        const codeFromUrl = searchParams.get('code');

        if (codeFromUrl) {
            setInputValue(codeFromUrl);
        }
    }, [showForm, location.search]);

    const handleSubmitAPI = () => {
        if (inputValue.substring(0, 2) === "1Z") {
            window.open(
                `https://www.ups.com/track?loc=en_VN&tracknum=${inputValue}&requester=ST&fromrecent=1/trackdetails`,
                '_blank',
                'noopener,noreferrer'
            );
            setHang("UPS EXPRESS");
        } else if (inputValue.substring(0, 2) === "SF") {
            window.open(
                `https://www.sf-international.com/vn/vi/support/querySupport/waybill#search/bill-number/${inputValue}`,
                '_blank',
                'noopener,noreferrer'
            );
            setHang("SF EXPRESS");
        } else if (inputValue.length === 12) {
            window.open(
                `https://www.fedex.com/fedextrack/?trknbr=${inputValue}`,
                '_blank',
                'noopener,noreferrer'
            );
            setHang("FedEx");
        } else if(inputValue.substring(0,2) === "ET"){
            window.open(
                `https://tools.usps.com/go/TrackConfirmAction?tRef=fullpage&tLc=2&text28777=&tLabels=${inputValue}%2C&tABt=false`,
                '_blank',
                'noopener,noreferrer'
            );
            setHang("EMS TRACKING");
        }
        else {
            window.open(
                `https://www.dhl.com/vn-vi/home/theo-doi.html?tracking-id=${inputValue}&submit=1&inputsource=marketingstage`,
                '_blank',
                'noopener,noreferrer'
            );
            setHang("DHL EXPRESS");
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        if (showForm) {
            setShowForm(false);
            setDataButton(true);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            navigate(`${location.pathname}?code=${encodeURIComponent(inputValue)}`);

            if (!showForm) {
                setLoading(true);
                setTimeout(() => {
                    setShowForm(true);
                    handleSubmitAPI();
                    setLoading(false);
                }, 800);
            } else {
                setShowForm(false);
            }
            setDataButton(!dataButton);
        }
        // console.log(GetTrackingOrder(inputValue));
    };

    return (
        <div className="min-h-[40vh] rounded-3xl bg-gradient-to-b from-blue-50 to-white">
            <div className="container mx-auto pt-6 pb-8 px-4 sm:px-6">
                <div className="flex flex-col items-center p-3 sm:p-5 max-w-2xl mx-auto">
                    {/* Tracking Form */}
                    <div className="w-full mb-6 flex flex-col h-full">
                        <h2 className="text-lg sm:text-2xl font-bold text-center text-blue-800 mb-3">
                            Theo dõi đơn hàng
                        </h2>

                        <form onSubmit={handleSubmit} className="w-full flex flex-col h-full space-y-4">
                            {/* Input Group */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    placeholder="Tracking UPS/FEDEX/SF/DHL/EMS"
                                    className="w-full px-3 py-2 text-sm sm:text-base border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                                    aria-label="Mã vận đơn"
                                    autoComplete="off"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !inputValue.trim()}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs sm:text-sm bg-blue-600 text-white font-semibold rounded-lg transition-all ${
                                        loading || !inputValue.trim()
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:bg-blue-700'
                                    }`}
                                    aria-label="Tra cứu đơn hàng"
                                >
                                    {loading ? 'Loading...' : 'Tracking'}
                                </button>
                            </div>

                            {/* Helper Text */}
                            <div className="text-center">
                                <p className="text-blue-600 text-sm">
                                    <span className="font-medium">Mẫu mã vận đơn:</span>
                                    <span className="ml-2 inline-flex flex-wrap gap-1 mt-1 justify-center sm:space-x-2">
                  <span className="px-2 py-1 bg-blue-100 rounded-md text-xs">DHL987654321</span>
                  <span className="px-2 py-1 bg-blue-100 rounded-md text-xs">1Z0123XX0123456789</span>
                  <span className="px-2 py-1 bg-blue-100 rounded-md text-xs">SF123456789</span>
                  <span className="px-2 py-1 bg-blue-100 rounded-md text-xs">ET012345678VN</span>
                </span>
                                </p>
                            </div>

                            {/* Button */}
                            <div className="text-center pt-5">
                                <p className="text-gray-600 text-base mb-3">Nhận báo giá ngay!</p> {/* text to hơn */}
                                <Button
                                    href="/gia-van-chuyen"
                                    type="link"
                                    className="inline-flex items-center justify-center px-5 py-3 bg-white text-theme-purple border border-theme-purple rounded-lg shadow hover:shadow-md transition w-full sm:w-auto text-base"
                                >
                                    Báo giá nhanh
                                    <svg
                                        className="ml-2 w-5 h-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Button>
                            </div>

                        </form>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="w-full max-w-md p-4 text-center">
                            <div className="inline-flex items-center justify-center space-x-2">
                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-blue-700 text-sm">Đang tìm kiếm thông tin...</span>
                            </div>
                        </div>
                    )}

                    {/* Result */}
                    {showForm && (
                        <div className="w-full sm:max-w-2xl mt-5 animate-fade-in">
                            <div className="bg-white rounded-xl shadow overflow-hidden border border-blue-100">
                                <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-blue-800 text-sm sm:text-base">
                                                Mã đơn hàng: <span className="text-blue-600">{inputValue}</span>
                                            </h3>
                                            <p className="text-xs text-blue-600 mt-1">Hãng vận chuyển: {hang}</p>
                                        </div>
                                        <div className="bg-blue-100 p-2 rounded-full">
                                            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 sm:p-5">
                                    <div className="flex items-center mb-4">
                                        <div className="bg-green-100 p-2 rounded-full mr-3">
                                            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm text-gray-800">EbayExpress</h4>
                                            <p className="text-xs text-gray-500">Cảm ơn bạn đã sử dụng dịch vụ Tracking {hang}</p>
                                        </div>
                                    </div>

                                    {/* Special Offer */}
                                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-4 text-white relative overflow-hidden mt-4">
                                        <div className="relative z-10">
                                            <h4 className="font-bold text-sm sm:text-base mb-1">Ưu đãi đặc biệt!</h4>
                                            <p className="mb-2 text-sm">Giảm <span className="font-bold text-yellow-300">20%</span> cho lần vận chuyển tiếp theo</p>
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
                                                className="bg-white text-blue-600 px-3 py-1.5 text-xs sm:text-sm rounded font-medium hover:bg-opacity-90 transition"
                                            >
                                                Nhận ưu đãi ngay
                                            </Button>
                                        </div>
                                        <div className="absolute right-0 bottom-0 opacity-10">
                                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                                                <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                <path d="M18 7v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                <path d="M12 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                <path d="M6 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>


    );
}