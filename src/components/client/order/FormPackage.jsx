import { motion, AnimatePresence } from "framer-motion"; // Thêm framer-motion
import React, { useEffect, useRef, useState } from "react";
import Button from "../../admin/ui/button/Button.jsx";
import { GetListPriceQuote } from "../../../service/api.admin.service.jsx";

const FormPackage = ({ packages, setPackages, nameCountry: initialNameCountry, zone, handleService, setSelectedService, isChangeCountry, setIsChangeCountry }) => {
    useEffect(() => {
        const fetchData = () => {

        }

        fetchData();
    }, []);


    const [nameCountry, setNameCountry] = useState(initialNameCountry);
    const [isOpenFormPackage, setIsOpenFormPackage] = useState(!isChangeCountry);
    const [showQuote, setShowQuote] = useState(isChangeCountry);
    const [errors, setErrors] = useState({});
    const [quoteData, setQuoteData] = useState([]);
    const [total, setTotal] = useState({
        totalPackage: packages.length,
        totalOverSize: 0,
        realVolume: 0
    });

    const formatCurrency = (amount) => {
        const num = parseFloat(String(amount).replace(/[^0-9.]/g, ''));
        if (isNaN(num)) return '0';
        return new Intl.NumberFormat('vi-VN', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    const addPackage = () => {
        const newId = packages.length > 0 ? Math.max(...packages.map(p => p.id)) + 1 : 1;
        const newPackage = {
            id: newId,
            length: "",
            width: "",
            height: "",
            weight: "",
            dim: 0,
            total: {
                totalWeight: 0,
                OverSize: "NO FEE",
                realVolume: 0
            }
        };
        setPackages([...packages, newPackage]);
        setTotal(prev => ({ ...prev, totalPackage: prev.totalPackage + 1 }));
        setShowQuote(false);
    };

    const removePackage = (id) => {
        if (packages.length <= 1) return;
        const packageToRemove = packages.find(pkg => pkg.id === id);
        if (!packageToRemove) return;

        setPackages(packages.filter(pkg => pkg.id !== id));
        setTotal(prev => ({
            totalPackage: prev.totalPackage - 1,
            realVolume: prev.realVolume - (packageToRemove.total?.realVolume || 0),
            totalOverSize: prev.totalOverSize - (quaKhoMap.get(packageToRemove.total?.OverSize)?.price || 0)
        }));
        setShowQuote(false);
    };

    const handleChange = (id, field, value) => {
        const numericValue = value.replace(/[^\d.]/g, '');

        // Tạo bản sao của packages để tính toán
        const updatedPackages = packages.map(pkg => {
            if (pkg.id !== id) return pkg;

            const updatedPkg = { ...pkg, [field]: numericValue };
            const { length, width, height } = updatedPkg;
            let dimValue = (parseFloat(length) || 0) *
                (parseFloat(width) || 0) *
                (parseFloat(height) || 0) / 5000;

            const decimalPart = dimValue % 1;
            if (decimalPart > 0 && decimalPart < 0.5) {
                dimValue = Math.floor(dimValue) + 0.5;
            } else if (decimalPart >= 0.5) {
                dimValue = Math.ceil(dimValue);
            }
            updatedPkg.dim = dimValue;

            const overSizeUpdate = overSize(
                parseFloat(updatedPkg.length) || 0,
                parseFloat(updatedPkg.width) || 0,
                parseFloat(updatedPkg.height) || 0,
                parseFloat(updatedPkg.weight) || 0
            );

            // Tính realVolumePkg dựa trên max của dimValue và weight
            let realVolumePkg = Math.max(dimValue, parseFloat(updatedPkg.weight) || 0);
            if (realVolumePkg > 20) {
                realVolumePkg = Math.ceil(realVolumePkg);
            }

            updatedPkg.total = {
                realVolume: realVolumePkg,
                totalPackage: parseFloat(updatedPkg.quantity) || 0,
                OverSize: overSizeUpdate,
                totalWeight: parseFloat(updatedPkg.weight) || 0
            };

            return updatedPkg;
        });

        // Tính toán tổng mới dựa trên updatedPackages
        const newTotal = updatedPackages.reduce((acc, pkg) => ({
            realVolume: acc.realVolume + (pkg.total?.realVolume || 0),
            totalOverSize: acc.totalOverSize + (quaKhoMap.get(pkg.total?.OverSize)?.price || 0),
            totalPackage: updatedPackages.length
        }), {
            totalOverSize: 0,
            realVolume: 0,
            totalPackage: 0
        });

        // Cập nhật cả packages và total
        setPackages(updatedPackages);
        setTotal(newTotal);

        // Log để debug
        console.log("Updated packages:", updatedPackages);
        console.log("New total:", newTotal);

        setErrors(prev => ({
            ...prev,
            [`${id}-${field}`]: "",
        }));

        setShowQuote(false);
        setIsOpenFormPackage(true);
    };

    useEffect(() => {

    }, [initialNameCountry]);

    const quaKho = [
        { code: "NO FEE", price: 0, note: "không dính phí quá khổ" },
        { code: "AHC", price: 268715, note: "kiện hàng lớn hơn 25kg" },
        { code: "LPS", price: 1602700, note: "Chu vi Package: dài + 2 x (rộng + cao) nằm trong [300, 399]" },
        { code: "OMS", price: 6580000, note: ["Package trên 70KG bạn vui lòng liên hệ sales EbayExpress để được hướng dẫn gửi hàng", "Chu vi Package: dài + 2 x (rộng + cao) >= 400", "Package có chiều dài từ 274CM"] }
    ];

    const quoteRef = useRef(null);

    const scrollContainer = (direction) => {
        if (quoteRef.current) {
            const scrollAmount = window.innerWidth < 640 ? 240 : 300;
            quoteRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    const quaKhoMap = quaKho.reduce((map, item) => {
        map.set(item.code, {
            price: item.price,
            note: item.note
        });
        return map;
    }, new Map());

    const noteOverSize = (pkg) => {
        const overSizeItem = quaKhoMap.get(pkg.total?.OverSize);
        if (!overSizeItem) return "Không xác định";

        const { note } = overSizeItem;

        if (typeof note === 'string') {
            return note;
        }

        if (Array.isArray(note)) {
            const { length, width, height, weight } = pkg;
            const totalSize = length + 2 * (width + height);
            if (length >= 274) {
                return note[2];
            }

            if (weight >= 70) {
                return note[0];
            }
            if (totalSize >= 400) {
                return note[1];
            }

            return note[0];
        }

        return "Không có thông tin";
    };

    const overSize = (l, w, h, weight) => {
        const TotalOverSize = l + 2 * (w + h);
        if (TotalOverSize >= 300 && TotalOverSize <= 399) {
            return quaKho[2].code;
        }
        if (TotalOverSize >= 400) {
            return quaKho[3].code;
        }
        if (weight >= 25) {
            return quaKho[1].code;
        }
        return quaKho[0].code;
    };
    const handleGetQuote = async () => {

        if (!validateInputs()) {
            setShowQuote(false);
            setIsChangeCountry(true);
            return;
        }

        let dummyQuotes = [];

        const dataRequest = {
            nameCountry: initialNameCountry, // Tên quốc gia
            weight: total.realVolume, // Tổng cân nặng thực tế
            packages: packages.map(pkg => ({
                weight: parseFloat(pkg.weight) || 0,
                width: parseFloat(pkg.width) || 0,
                length: parseFloat(pkg.length) || 0,
                height: parseFloat(pkg.height) || 0, // Chiều cao của kiện
            })),
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

    const getLable = (field) => {
        switch (field) {
            case "LENGTH":
                return "Dài";
            case "WIDTH":
                return "Rộng";
            case "HEIGHT":
                return "Cao";
            case "WEIGHT":
                return "Cân nặng";
        }
        return "Trọng lượng theo chiều";
    };

    const validateInputs = () => {
        const newErrors = {};
        let isValid = true;

        packages.forEach((pkg) => {
            ["length", "width", "height", "weight"].forEach((field) => {
                const val = pkg[field];
                const key = `${pkg.id}-${field}`;

                if (val === "" || isNaN(val) || parseFloat(val) <= 0) {
                    newErrors[key] = "Vui lòng nhập số lớn hơn 0";
                    isValid = false;
                }
            });
        });

        setErrors(newErrors);
        return isValid;
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
            totalPrice: (quote.priceNet + (quote.overSize ? quote.overSize.price : 0)) * (1 + quote.constPPXD / 100) * (1 + quote.constVAT / 100)
        };
        console.log("selectedServiceInfo", selectedServiceInfo);
        setSelectedService(selectedServiceInfo);
        handleService();
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            {/* Header Section */}
            <div
                onClick={() => {
                    setIsOpenFormPackage(!isOpenFormPackage);
                    setShowQuote(false);
                }}
                className="flex items-center cursor-pointer mb-6"
            >
                <h2 className="text-xl sm:text-2xl font-bold text-purple-700 mr-2">Thông Tin Kiện Hàng</h2>
                <motion.span
                    className="text-purple-700 text-xl"
                    animate={{ rotate: isOpenFormPackage ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    ▼
                </motion.span>
            </div>

            <AnimatePresence>
                {isOpenFormPackage && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={slideDown}
                        className="space-y-6"
                    >
                        {packages.map((pkg, index) => (
                            <motion.div
                                key={pkg.id}
                                className="bg-gray-50 rounded-lg p-5 border border-gray-200"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        Kiện {index + 1}/{packages.length}
                                    </h3>
                                    {packages.length > 1 && (
                                        <button
                                            onClick={() => removePackage(pkg.id)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 mb-4">
                                    {["length", "width", "height", "weight", "dim"].map((field) => {
                                        const errorKey = `${pkg.id}-${field}`;
                                        return (
                                            <div key={field} className="relative">
                                                <label
                                                    htmlFor={`field-${pkg.id}-${field}`}
                                                    className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                    {getLable(field.toUpperCase())}
                                                </label>

                                                <div className="relative">
                                                    <input
                                                        id={`field-${pkg.id}-${field}`}
                                                        type="text"
                                                        inputMode="decimal"
                                                        disabled={field === "dim"}
                                                        value={pkg[field]}
                                                        onChange={(e) => handleChange(pkg.id, field, e.target.value)}
                                                        className={`w-full border rounded-md px-3 py-2 text-sm transition-all duration-200 ${errors[errorKey]
                                                            ? "border-red-500 pr-8"
                                                            : "border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                                                            } ${field === "dim" ? "bg-gray-100" : "bg-white"}`}
                                                        placeholder="0"
                                                    />
                                                    {field !== "dim" && (
                                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                                                            {field === "weight" ? "kg" : "cm"}
                                                        </span>
                                                    )}
                                                    {errors[errorKey] && (
                                                        <div className="absolute -bottom-5 left-0 text-xs text-red-500">
                                                            {errors[errorKey]}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="bg-white p-4 rounded-lg shadow-sm mt-6">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Thông tin tính toán</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500 mb-1">Cân nặng thực</span>
                                            <span className="text-sm font-semibold text-blue-600">
                                                {pkg.total?.totalWeight || 0} kg
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500 mb-1">Cân nặng theo chiều</span>
                                            <span className="text-sm font-semibold text-blue-600">
                                                {pkg.dim || 0} kg
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500 mb-1">Cân nặng tính phí</span>
                                            <span className="text-sm font-semibold text-blue-600">
                                                {pkg.total?.realVolume || 0} kg
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        <div className="flex flex-wrap gap-4 mt-6">
                            <motion.button
                                type="button"
                                onClick={addPackage}
                                className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Thêm Kiện
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Summary Section */}
            <motion.div
                className="mt-6 bg-gray-50 p-5 rounded-lg border border-gray-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Tổng Hợp
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                        <div className="flex flex-col items-center">
                            <svg className="w-6 h-6 mb-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span className="text-sm font-medium text-gray-600 mb-1">Tổng kiện</span>
                            <p className="text-lg font-semibold text-purple-700">
                                {total.totalPackage}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                        <div className="flex flex-col items-center">
                            <svg className="w-6 h-6 mb-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                            <span className="text-sm font-medium text-gray-600 mb-1">Cân nặng tính phí</span>
                            <p className="text-lg font-semibold text-purple-700">
                                {total.realVolume} kg
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="flex justify-center sm:justify-end mt-6">
                <motion.button
                    type="button"
                    onClick={async () => await handleGetQuote()}
                    className="flex items-center bg-purple-700 text-white px-6 py-3 rounded-md hover:bg-purple-800 shadow-md"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {isOpenFormPackage ? "Chọn Dịch Vụ" : "Kiểm tra Kiện hàng"}
                </motion.button>
            </div>

            {/* Quote Section */}
            <AnimatePresence>
                {showQuote && isChangeCountry && (
                    <motion.div
                        className="mt-8 p-4 relative"
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <h3 className="text-xl font-semibold mb-6 text-gray-800">
                            Bảng giá dịch vụ
                        </h3>

                        <motion.button
                            onClick={() => scrollContainer("left")}
                            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10 hover:bg-gray-100"
                            whileHover={{ scale: 1.1, x: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </motion.button>

                        <motion.button
                            onClick={() => scrollContainer("right")}
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10 hover:bg-gray-100"
                            whileHover={{ scale: 1.1, x: 2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </motion.button>

                        <div
                            ref={quoteRef}
                            className="flex space-x-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-1 py-2"
                            style={{ minWidth: "100%" }}
                        >
                            {quoteData.map((quote, index) => (
                                <motion.div
                                    key={index}
                                    className="snap-start flex-shrink-0 w-72 bg-white rounded-lg shadow-md border border-gray-200 flex flex-col"
                                    variants={cardAnimation}
                                    initial="hidden"
                                    animate="visible"
                                    custom={index}
                                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                >
                                    <div className="p-4 border-b">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h2 className="text-base font-bold text-gray-800 flex items-center">
                                                    {(() => {
                                                        const [carrierName] = quote.nameService.split(" ");
                                                        return carrierName;
                                                    })()}
                                                </h2>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {(() => {
                                                        const parts = quote.nameService.split(" ");
                                                        return parts.slice(1).join(" ");
                                                    })()}
                                                </p>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {quote.zone}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 flex-grow">
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Phí cơ bản:</span>
                                                <span className="text-sm font-medium">{formatCurrency(quote.priceNet)} đ</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Phí xăng dầu ({quote.constPPXD}%):</span>
                                                <span className="text-sm font-medium">{formatCurrency(quote.priceNet * quote.constPPXD / 100)} đ</span>
                                            </div>
                                            {quote.overSize && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Phí quá khổ:</span>
                                                    <span className="text-sm font-medium">{formatCurrency(quote.overSize.price)} đ</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">VAT ({quote.constVAT}%):</span>
                                                <span className="text-sm font-medium">{formatCurrency((quote.priceNet + (quote.overSize ? quote.overSize.price : 0)) * quote.constVAT / 100)} đ</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 border-t">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-base font-bold text-gray-800">
                                                    Tổng: {formatCurrency((quote.priceNet + (quote.overSize ? quote.overSize.price : 0)) * (1 + quote.constPPXD / 100) * (1 + quote.constVAT / 100))} đ
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={() => handleSelectService(quote)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1.5 px-3 rounded transition-colors mt-2 sm:mt-0"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Đặt ngay
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FormPackage;
