import { motion, AnimatePresence } from "framer-motion"; // Thêm framer-motion
import React, { useEffect, useRef, useState } from "react";
import Button from "../../admin/ui/button/Button.jsx";
import { GetListPriceQuote } from "../../../service/api.admin.service.jsx";
import { ArrowRightIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, FileTextIcon, PackageIcon, ScaleIcon, Truck, TruckIcon } from "lucide-react";
const Document = ({ packages, setPackages, nameCountry: initialNameCountry, zone, handleService, setSelectedService, isChangeCountry, setIsChangeCountry }) => {
    const [isOpenFormPackage, setIsOpenFormPackage] = useState(!isChangeCountry);
    const [showQuote, setShowQuote] = useState(isChangeCountry);
    const [errors, setErrors] = useState({});
    const [quoteData, setQuoteData] = useState([]);
    const [weight, setWeight] = useState(0);
    const [realVolume, setRealVolume] = useState(0);
    // Add new state for weight validation
    const [isWeightValid, setIsWeightValid] = useState(true);

    useEffect(() => {
        setRealVolume(Math.ceil(weight * 2) / 2);
        // Add weight validation
        setIsWeightValid(parseFloat(weight) <= 5);
    }, [weight]);


    const quoteRef = useRef(null);


    // Xóa bỏ useEffect ở dòng 294 nếu nó đang gây ra vòng lặp vô hạn

    const formatCurrency = (amount) => {
        const num = parseFloat(String(amount).replace(/[^0-9.]/g, ''));
        if (isNaN(num)) return '0';
        return new Intl.NumberFormat('vi-VN', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    const scrollContainer = (direction) => {
        if (quoteRef.current) {
            const scrollAmount = window.innerWidth < 640 ? 240 : 300;
            quoteRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };


    const handleGetQuote = async () => {
        // Check weight validation first
        if (parseFloat(weight) > 5) {
            setIsWeightValid(false);
            setShowQuote(false);
            setIsChangeCountry(true);
            return;
        }

        // if (!validateInputs()) {
        //     setShowQuote(false);
        //     setIsChangeCountry(true);
        //     return;
        // }

        const dataRequest = {
            nameCountry: initialNameCountry,
            weight: realVolume,
            isPackage: false
        };
        console.log("data request", dataRequest);
        const data = await GetListPriceQuote(dataRequest);
        console.log("dataResponse", data);

        setQuoteData(data);
        setShowQuote(!showQuote);
        setIsChangeCountry(true);
        setIsOpenFormPackage(!isOpenFormPackage);
    };

    const fadeIn = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.3 }
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.2 }
        }
    };

    const slideDown = {
        hidden: { height: 0, opacity: 0, overflow: "hidden" },
        visible: {
            height: "auto",
            opacity: 1,
            transition: {
                height: { duration: 0.3 },
                opacity: { duration: 0.3, delay: 0.1 }
            }
        },
        exit: {
            height: 0,
            opacity: 0,
            transition: {
                opacity: { duration: 0.2 },
                height: { duration: 0.3, delay: 0.1 }
            }
        }
    };

    const cardAnimation = {
        hidden: { y: 10, opacity: 0 }, // Giảm y từ 20 xuống 10
        visible: (i) => ({
            y: 0,
            opacity: 1,
            transition: {
                delay: i * 0.05, // Giảm delay từ 0.1 xuống 0.05
                duration: 0.2 // Giảm duration từ 0.3 xuống 0.2
            }
        })
    };

    const handleSelectService = (quote) => {
        const [carrier, service] = quote.nameService.split(" ");

        console.log(quote);
        const selectedServiceInfo = {
            carrier: carrier,
            service: service,
            priceNet: quote.priceNet,
            constPPXD: quote.constPPXD,
            overSize: quote.overSize,
            constVAT: quote.constVAT,
            zone: quote.zone,
            pricePeakSeason: quote.pricePeakSeason,
            totalPrice: (quote.priceNet + quote.pricePeakSeason + (quote.overSize ? quote.overSize.price : 0)) * (1 + quote.constPPXD / 100) * (1 + quote.constVAT / 100)
        };
        console.log("selectedServiceInfo", selectedServiceInfo);
        setSelectedService(selectedServiceInfo);
        handleService();
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            {/* Collapsible Header */}
            <div
                onClick={() => {
                    setIsOpenFormPackage(!isOpenFormPackage);
                    setShowQuote(false);
                }}
                className="flex items-center justify-between cursor-pointer mb-4 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
                <div className="flex items-center">
                    <FileTextIcon className="w-5 h-5 text-purple-600 mr-3" />
                    <h2 className="text-lg font-semibold text-gray-800">Thông Tin</h2>
                </div>
                <motion.span
                    className="text-gray-500"
                    animate={{ rotate: isOpenFormPackage ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDownIcon className="w-5 h-5" />
                </motion.span>
            </div>

            {/* Package Form Section */}
            <AnimatePresence>
                {isOpenFormPackage && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Cân nặng kiện hàng */}
                                <div className="flex flex-col h-full">
                                    <label className="text-sm font-medium text-gray-700 mb-2">
                                        Cân nặng kiện hàng
                                    </label>
                                    <div className="relative flex-grow">
                                        <input
                                            type="number"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                            className={`w-full h-12 pl-4 pr-12 rounded-lg border ${!isWeightValid
                                                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                                : "border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                                                }`}
                                            placeholder="0.00"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <span className="text-gray-500">kg</span>
                                        </div>
                                    </div>
                                    {!isWeightValid && (
                                        <p className="text-xs text-red-600 mt-1">
                                            Tối đa 5kg
                                        </p>
                                    )}
                                </div>

                                {/* Cân nặng tính phí */}
                                <div className="flex flex-col h-full">
                                    <label className="text-sm font-medium text-gray-700 mb-2">
                                        Cân nặng tính phí
                                    </label>
                                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg h-12 px-4">
                                        <div className="flex items-center space-x-3 w-full">
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                            </svg>
                                            <span className="font-semibold text-gray-800">{realVolume} kg</span>
                                        </div>
                                    </div>
                                    <div className="h-5">
                                        {/* Placeholder div to maintain alignment with error message space */}
                                    </div>
                                </div>

                                {/* Nút chọn dịch vụ */}
                                <div className="flex flex-col h-full">
                                    <label className="text-sm font-medium text-gray-700 mb-2">
                                        Thao tác
                                    </label>
                                    <button
                                        onClick={async () => await handleGetQuote()}
                                        disabled={!isWeightValid}
                                        className={`h-12 px-4 rounded-lg font-medium transition-all ${isWeightValid
                                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            }`}
                                    >
                                        <span className="flex items-center justify-center">
                                            {isWeightValid ? (
                                                <>
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                    </svg>
                                                    {isOpenFormPackage ? "Chọn Dịch Vụ" : "Kiểm tra Kiện hàng"}
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    Vượt quá giới hạn
                                                </>
                                            )}
                                        </span>
                                    </button>
                                    <div className="h-5">
                                        {/* Placeholder div to maintain alignment with error message space */}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-2">
                                <p className="text-xs text-gray-500">
                                    Lưu ý: Cân nặng tối đa cho phép là 5kg
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quote Section */}
            <AnimatePresence>
                {showQuote && isChangeCountry && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 overflow-hidden"
                    >
                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                Bảng giá dịch vụ
                            </h3>

                            <div className="relative">
                                {/* Navigation Arrows */}
                                <button
                                    onClick={() => scrollContainer("left")}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 z-10 bg-white rounded-full p-1 shadow-sm border border-gray-200 hover:bg-gray-50"
                                >
                                    <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                                </button>

                                <button
                                    onClick={() => scrollContainer("right")}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 z-10 bg-white rounded-full p-1 shadow-sm border border-gray-200 hover:bg-gray-50"
                                >
                                    <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                                </button>

                                {/* Quote Cards */}
                                <div
                                    ref={quoteRef}
                                    className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
                                >
                                    {quoteData.map((quote, index) => (
                                        <div key={index} className="flex-shrink-0 w-72">
                                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                {/* Header */}
                                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center">
                                                            <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                                                <TruckIcon className="w-5 h-5 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900">
                                                                    {quote.nameService.split(" ")[0]}
                                                                </h4>
                                                                <p className="text-xs text-gray-500">
                                                                    {quote.nameService.split(" ").slice(1).join(" ")}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                            Zone {quote.zone}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Pricing */}
                                                <div className="p-4 space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Cân nặng:</span>
                                                        <span className="font-medium">{formatCurrency(quote.totalWeight)} kg</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Phí cơ bản:</span>
                                                        <span className="font-medium">{formatCurrency(quote.priceNet)} đ</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Phí mùa cao điểm:</span>
                                                        <span className="font-medium">{formatCurrency(quote.pricePeakSeason)} đ</span>
                                                    </div>
                                                    <div className="border-t border-gray-100 my-2"></div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Phí xăng dầu ({quote.constPPXD}%):</span>
                                                        <span className="text-blue-600 font-medium">
                                                            {formatCurrency((quote.priceNet + quote.pricePeakSeason) * quote.constPPXD / 100)} đ
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">VAT ({quote.constVAT}%):</span>
                                                        <span className="text-purple-600 font-medium">
                                                            {formatCurrency(((quote.priceNet + quote.pricePeakSeason) + (quote.overSize ? quote.overSize.price : 0)) * quote.constVAT / 100)} đ
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Footer */}
                                                <div className="bg-gray-50 p-4 border-t border-gray-200">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="text-xs text-gray-500">Tổng cộng</p>
                                                            <p className="font-bold text-gray-900">
                                                                {formatCurrency(((quote.priceNet + quote.pricePeakSeason) + (quote.overSize ? quote.overSize.price : 0)) * (1 + quote.constPPXD / 100) * (1 + quote.constVAT / 100))} đ
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleSelectService(quote)}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-3 rounded-lg transition-colors"
                                                        >
                                                            Đặt ngay
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Document;
