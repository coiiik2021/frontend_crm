import { GetCodeByCompany, GetPriceNetDHLSin, GetPriceNetDHLVN, GetPriceNetFedEx, GetPriceNetSF, GetPriceNetViettel } from "../../../service/api.service.jsx";
import { motion, AnimatePresence } from "framer-motion"; // Thêm framer-motion
import React, { useEffect, useRef, useState } from "react";
import Button from "../../admin/ui/button/Button.jsx";
import { GetAPriceNet, GetPriceNet, GetZoneCountry } from "../../../service/api.admin.service.jsx";

const FormPackage = ({ packages, setPackages, nameCountry: initialNameCountry, zone, handleService, setSelectedService, isChangeCountry, setIsChangeCountry }) => {
    const ppXangDau = 0.2825;

    const phanTramVAT = 0.08;

    const dollar = 26000;
    const loiNhuan = 1;

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
        // Chỉ cho phép nhập số và dấu chấm
        const numericValue = value.replace(/[^\d.]/g, '');

        setPackages(packages.map(pkg => {
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

            let realVolumePkg = Math.max(dimValue, parseFloat(updatedPkg.weight) || 0);
            if (realVolumePkg > 20) {
                realVolumePkg = Math.ceil(realVolumePkg);
            }

            updatedPkg.total = {
                realVolume: overSizeUpdate === "LPS" || overSizeUpdate === "OMS" ?
                    Math.max(40, realVolumePkg) : realVolumePkg,
                totalPackage: parseFloat(updatedPkg.quantity) || 0,
                OverSize: overSizeUpdate,
                totalWeight: parseFloat(updatedPkg.weight) || 0
            };

            return updatedPkg;
        }));

        // Cập nhật total sau khi packages thay đổi
        setTotal(prev => {
            const newTotal = packages.reduce((acc, pkg) => ({
                realVolume: acc.realVolume + (pkg.total?.realVolume || 0),
                totalOverSize: acc.totalOverSize + (quaKhoMap.get(pkg.total?.OverSize)?.price || 0),
                totalPackage: packages.length
            }), {
                totalOverSize: 0,
                realVolume: 0,
                totalPackage: 0
            });
            console.log("Updated Total:", newTotal);
            return newTotal;
        });

        setErrors(prev => ({
            ...prev,
            [`${id}-${field}`]: "",
        }));

        setShowQuote(false);
        setIsOpenFormPackage(true);
    };

    const [countryCode, setCountryCode] = useState({});
    const [codeCountrySelect, setCodeCountrySelect] = useState({
        dhleco: "Zone 5",
        dhlvn: 7,
        ups: 5,
        fedex: "D",
        sf: '',
    });


    useEffect(() => {
        async function loadCountry() {
            const resCodeCompany = await GetCodeByCompany();
            const rawData = resCodeCompany.data.values;

            const countryDataMap = rawData.reduce((acc, item) => {
                const originalName = item[0].trim();
                acc[originalName] = {
                    dhlsin: item[1] || '',
                    dhlvn: item[2] ? item[2].replace(',', '.') : '',
                    ups: item[3] || '',
                    fedex: item[4] || '',
                    sf: item[5] || '',
                    countryCode: (originalName.match(/\(([A-Z]{2})\)/) || [])[1] || ''
                };
                return acc;
            }, {});

            setCountryCode(countryDataMap);

            console.log("zone" + zone, "countryCode", countryCode);



            // Set codeCountrySelect based on the selected country
            // const selectedCountryData = countryDataMap[nameCountry];
            // if (selectedCountryData) {
            //     console.log("Setting codeCountrySelect for:", nameCountry, selectedCountryData);
            //     setCodeCountrySelect({
            //         dhlsin: selectedCountryData.dhlsin,
            //         dhlvn: selectedCountryData.dhlvn,
            //         ups: selectedCountryData.ups,
            //         fedex: selectedCountryData.fedex,
            //         sf: selectedCountryData.sf
            //     });
            // }
        }
        loadCountry();
    }, [nameCountry]);

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

    // useEffect(() => {
    //     async function fetchData() {
    //         try {
    //             // Xử lý dữ liệu từ GetPriceNetViettel()
    //             const resNetUps = await GetPriceNet("ups-vt");
    //             const processedDataUps = resNetUps.map(row => ({
    //                 weight: row[0],
    //                 prices: row.slice(1).map(price => loiNhuan * parseFloat(price.replace(/\./g, '').replace(',', '.')))
    //             }));
    //             console.log("Net UPS Data:", processedDataUps);
    //             setNetUps(processedDataUps);

    //             const resNetDHLVN = await GetPriceNetDHLVN();
    //             const processedDataDHLVN = resNetDHLVN.data.values.map(row => ({
    //                 weight: row[0],
    //                 prices: row.slice(1).map(price => loiNhuan * parseFloat(price.replace(/\./g, '').replace(',', '.')))
    //             }));
    //             setNetDHLVN(processedDataDHLVN);

    //             const resNetFedEx = await GetPriceNetFedEx();
    //             const processedDataFedEx = resNetFedEx.data.values.map(row => ({
    //                 weight: row[0],
    //                 prices: row.slice(1).map(price => loiNhuan * parseFloat(price.replace(/\./g, '').replace(',', '.')))
    //             }));
    //             setNetFedEx(processedDataFedEx);

    //             const resNetDHLSin = await GetPriceNetDHLSin();
    //             const processedDataDHLSin = resNetDHLSin.data.values.map(row => ({
    //                 weight: row[0],
    //                 prices: row.slice(1).map(price => loiNhuan * dollar * parseFloat(price.replace(/\./g, '').replace(',', '.')))
    //             }));
    //             setNetDHLSIN(processedDataDHLSin);

    //             const resNetSF = await GetPriceNetSF();
    //             const processedDataSF = resNetSF.data.values.map(row => ({
    //                 weight: row[0],
    //                 prices: row.slice(1).map(price => loiNhuan * parseFloat(price.replace(/\./g, '').replace(',', '.')))
    //             }));
    //             setNetSF(processedDataSF);

    //             // Xử lý dữ liệu từ GetCodeByCompany()
    //             const resCodeCompany = await GetCodeByCompany();
    //             const rawData = resCodeCompany.data.values;

    //             // Tạo object với originalName làm key chính
    //             const countryDataMap = rawData.reduce((acc, item) => {
    //                 const originalName = item[0].trim(); // Giữ nguyên tên gốc làm key

    //                 acc[originalName] = {
    //                     dhlsin: item[1] || '',
    //                     dhlvn: item[2] ? item[2].replace(',', '.') : '',
    //                     ups: item[3] || '',
    //                     fedex: item[4] || '',
    //                     sf: item[5] || '',
    //                     // Lấy country code từ tên
    //                     countryCode: (originalName.match(/\(([A-Z]{2})\)/) || [])[1] || ''
    //                 };

    //                 return acc;
    //             }, {});

    //             setCountryCode(countryDataMap);
    //         } catch (error) {
    //             console.error("Error fetching data:", error);
    //         }
    //     }

    //     fetchData();
    // }, []);

    // const [netUps, setNetUps] = useState([]);
    // const [netDHLVN, setNetDHLVN] = useState([]);
    // const [netFedEx, setNetFedEx] = useState([]);
    // const [netDHLSIN, setNetDHLSIN] = useState([]);
    // const [netSF, setNetSF] = useState([]);

    const handleGetQuote = async () => {
        const today = new Date();
        const dateBegin = new Date();
        const dateEnd = new Date();
        const countryInfo = countryCode[initialNameCountry];

        console.log(zone);

        if (countryInfo) {
            setCodeCountrySelect(countryInfo);
        }

        console.log("Country Code Data:", countryInfo);

        if (!validateInputs()) {
            setShowQuote(false);
            return;
        }

        let dummyQuotes = [];

        if (codeCountrySelect.dhleco !== '') {
            const price = getPriceDHLECO();
            console.log("DHL eci Price:", price);
            const pricePPXD = price * ppXangDau;
            const VAT = (price + pricePPXD) * phanTramVAT;

            dateBegin.setDate(today.getDate() + 3);
            dateEnd.setDate(today.getDate() + 5);

            dummyQuotes.push({
                company: "DHL SIN",
                price,
                endDate: "2 - 4 ngày làm việc",
                deliveryDateBegin: dateBegin.toLocaleDateString('vi-VN'),
                deliveryDateEnd: dateEnd.toLocaleDateString('vi-VN'),
                code: "DHL",
                VAT,
                pricePPXD,
                zone: codeCountrySelect.dhlsin
            });
        }

        if (codeCountrySelect.ups !== '') {
            const price = await getPriceUPS(codeCountrySelect.ups);
            const pricePPXD = price * ppXangDau;
            const VAT = (price + pricePPXD) * phanTramVAT;

            dateBegin.setDate(today.getDate() + 3);
            dateEnd.setDate(today.getDate() + 5);

            dummyQuotes.push({
                company: "UPS",
                price,
                code: 'Tiết Kiệm',
                endDate: "2 – 4 ngày làm việc",
                deliveryDateBegin: dateBegin.toLocaleDateString('vi-VN'),
                deliveryDateEnd: dateEnd.toLocaleDateString('vi-VN'),
                VAT,
                pricePPXD,
                zone: codeCountrySelect.ups
            });
            dummyQuotes.push({
                company: "UPS",
                price,
                code: "UPS",
                endDate: "2 – 4 ngày làm việc",
                deliveryDateBegin: dateBegin.toLocaleDateString('vi-VN'),
                deliveryDateEnd: dateEnd.toLocaleDateString('vi-VN'),
                VAT,
                pricePPXD,
                zone: codeCountrySelect.ups
            });
        }

        if (codeCountrySelect.dhlvn !== '') {
            const price = getPriceDHLVN();
            const pricePPXD = price * ppXangDau;
            const VAT = (price + pricePPXD) * phanTramVAT;

            dateBegin.setDate(today.getDate() + 3);
            dateEnd.setDate(today.getDate() + 5);

            dummyQuotes.push({
                company: "DHL VN",
                price,
                endDate: "3 - 5 ngày làm việc",
                deliveryDateBegin: dateBegin.toLocaleDateString('vi-VN'),
                deliveryDateEnd: dateEnd.toLocaleDateString('vi-VN'),
                VAT,
                code: "DHL",
                pricePPXD,
                zone: codeCountrySelect.dhlvn
            });
        }

        // if (codeCountrySelect.fedex !== '') {
        //     const price = getPriceFedEx();
        //     const pricePPXD = price * ppXangDau;
        //     const VAT = (price + pricePPXD) * phanTramVAT;

        //     dateBegin.setDate(today.getDate() + 3);
        //     dateEnd.setDate(today.getDate() + 5);

        //     dummyQuotes.push({
        //         company: "FedEx",
        //         price,
        //         endDate: "4 - 5 ngày",
        //         deliveryDateBegin: dateBegin.toLocaleDateString('vi-VN'),
        //         deliveryDateEnd: dateEnd.toLocaleDateString('vi-VN'),
        //         VAT,
        //         pricePPXD,
        //         code: "FEDEX",
        //         zone: codeCountrySelect.fedex
        //     });
        // }

        // if (codeCountrySelect.sf !== '') {
        //     const price = getPriceSF();
        //     const pricePPXD = price * ppXangDau;
        //     const VAT = (price + pricePPXD) * phanTramVAT;

        //     dateBegin.setDate(today.getDate() + 3);
        //     dateEnd.setDate(today.getDate() + 5);

        //     dummyQuotes.push({
        //         company: "SF",
        //         price,
        //         endDate: "5 – 7 ngày làm việc",
        //         deliveryDateBegin: dateBegin.toLocaleDateString('vi-VN'),
        //         deliveryDateEnd: dateEnd.toLocaleDateString('vi-VN'),
        //         VAT,
        //         pricePPXD,
        //         zone: codeCountrySelect.sf
        //     });
        // }

        setQuoteData(dummyQuotes);
        setShowQuote(!showQuote);
        setIsOpenFormPackage(!isOpenFormPackage);
    };








    const getPriceUPS = async () => {
        const inputWeight = total.realVolume;
        const weightToFind = parseFloat(inputWeight.toString().replace(',', '.'));

        console.log("Weight to find:", weightToFind);
        console.log(codeCountrySelect.ups);
        const price = await GetAPriceNet("ups-vt", "0" + codeCountrySelect.ups, weightToFind);
        console.log(price);
        return price;
    };


    const getPriceDHLECO = async () => {
        const inputWeight = total.realVolume;
        const weightToFind = parseFloat(inputWeight.toString().replace(',', '.'));

        console.log("Weight to find:", weightToFind);
        console.log(codeCountrySelect.ups);
        const price = await GetAPriceNet("dhl-eco", + codeCountrySelect.dhleco, weightToFind);
        console.log(price);
        return price;
    };

    const getPriceDHLVN = async () => {
        const inputWeight = total.realVolume;
        const weightToFind = parseFloat(inputWeight.toString().replace(',', '.'));

        console.log("Weight to find:", weightToFind);
        console.log(codeCountrySelect.ups);
        const price = await GetAPriceNet("dhl-vn", + codeCountrySelect.dhlvn, weightToFind);
        console.log(price);
        return price;
    };

    const getPriceSF = async () => {
        const inputWeight = total.realVolume;
        const weightToFind = parseFloat(inputWeight.toString().replace(',', '.'));

        console.log("Weight to find:", weightToFind);
        console.log(codeCountrySelect.ups);
        const price = await GetAPriceNet("sf", + codeCountrySelect.sf, weightToFind);
        console.log(price);
        return price;
    };

    const getPriceFedex = async () => {
        const inputWeight = total.realVolume;
        const weightToFind = parseFloat(inputWeight.toString().replace(',', '.'));

        console.log("Weight to find:", weightToFind);
        console.log(codeCountrySelect.ups);
        const price = await GetAPriceNet("fedex", + codeCountrySelect.fedex, weightToFind);
        console.log(price);
        return price;
    };




    // Animation variants
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
        const selectedServiceInfo = {
            carrier: quote.company,
            service: quote.code,
            price: quote.price,
            pricePPXD: quote.pricePPXD,
            oversizeFee: quote.code === "Tiết Kiệm" ? 0 : total.totalOverSize,
            VAT: quote.VAT,
            totalPrice: quote.price + quote.VAT + quote.pricePPXD + (quote.code === "Tiết Kiệm" ? 0 : total.totalOverSize),
            deliveryTime: quote.endDate,
            deliveryDateBegin: quote.deliveryDateBegin,
            deliveryDateEnd: quote.deliveryDateEnd,
            zone: quote.zone
        };
        setSelectedService(selectedServiceInfo);
        handleService();
    };

    return (
        <>
            {/* Packages Section */}
            <div className="mb-6">
                <div
                    onClick={() => {
                        setIsOpenFormPackage(!isOpenFormPackage);
                        setShowQuote(false);
                    }}
                    className="flex items-center cursor-pointer mb-2"
                >
                    <h2 className="text-xl sm:text-2xl font-bold text-purple-700 mr-2">Các Kiện</h2>
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
                        >
                            {packages.map((pkg, index) => (
                                <motion.div
                                    key={pkg.id}
                                    className="mb-6 border-t pt-4"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h3 className="text-lg sm:text-xl font-semibold mb-4">
                                        Kiện {index + 1}/{packages.length}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 sm:gap-5 items-end">
                                        {["length", "width", "height", "weight", "dim"].map((field) => {
                                            const errorKey = `${pkg.id}-${field}`;
                                            return (
                                                <div key={field} className="relative">
                                                    <label
                                                        htmlFor={`field-${pkg.id}-${field}`}
                                                        className="block text-xs sm:text-sm font-medium mb-1"
                                                    >
                                                        {getLable(field.toUpperCase())}
                                                    </label>

                                                    <div className="relative">
                                                        <input
                                                            id={`field-${pkg.id}-${field}`}
                                                            type="number"
                                                            inputMode="decimal"
                                                            min="0"
                                                            step={field === "weight" ? "0.1" : "1"}
                                                            disabled={field === "dim"}
                                                            value={pkg[field]}
                                                            onChange={(e) => handleChange(pkg.id, field, e.target.value)}
                                                            className={`w-full border rounded px-3 py-2 text-sm sm:text-base transition-all duration-200 ${errors[errorKey]
                                                                ? "border-red-500 pr-8"
                                                                : "border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                                                                } ${field === "dim" ? "bg-gray-100" : "bg-white"}`}
                                                            placeholder="0"
                                                        />

                                                        {errors[errorKey] && (
                                                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                                                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <AnimatePresence>
                                                        {errors[errorKey] && (
                                                            <motion.p
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: "auto" }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="text-red-500 text-xs mt-1"
                                                            >
                                                                {errors[errorKey]}
                                                            </motion.p>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        })}

                                        <div className="col-span-2 sm:col-span-1 flex justify-end sm:justify-center items-center mt-2 sm:mt-0">
                                            <motion.button
                                                type="button"
                                                onClick={() => removePackage(pkg.id)}
                                                className="text-red-500 hover:text-red-700 p-2"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                aria-label="Remove package"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </motion.button>
                                        </div>
                                    </div>

                                    <motion.div
                                        className="space-y-3 mt-4 bg-gray-50 p-3 rounded-lg"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2, duration: 0.3 }}
                                    >
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-white p-3 rounded-lg shadow-xs flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                                    </svg>
                                                    <span className="text-xs font-medium text-gray-600">Weight</span>
                                                </div>
                                                <span className="text-sm font-semibold text-blue-600">
                                                    {pkg.total?.totalWeight || 0}<span className="text-xxs text-gray-400 ml-0.5">KG</span>
                                                </span>
                                            </div>

                                            <div className="bg-white p-3 rounded-lg shadow-xs flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                    </svg>
                                                    <span className="text-xs font-medium text-gray-600"> Real Volume</span>
                                                </div>
                                                <span className="text-sm font-semibold text-blue-600">
                                                    {pkg.total?.realVolume || 0}<span className="text-xxs text-gray-400 ml-0.5">KG</span>
                                                </span>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {noteOverSize(pkg) && quaKhoMap.get(pkg.total?.OverSize)?.price !== 0 && (
                                                <motion.div
                                                    className="bg-white p-3 rounded-lg shadow-xs"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <div className="flex items-center mb-2">
                                                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                                        </svg>
                                                        <h3 className="text-xs font-medium text-gray-600">OverSize</h3>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="flex flex-col">
                                                            <span className="text-xxs text-gray-500 mb-1">Loại quá khổ</span>
                                                            <span className="text-xs font-semibold text-blue-600">
                                                                {pkg.total?.OverSize || "N/A"}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xxs text-gray-500 mb-1">Phụ phí</span>
                                                            <span className="text-xs font-semibold text-blue-600">
                                                                {formatCurrency(quaKhoMap.get(pkg.total?.OverSize)?.price || 0)} VND
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 flex items-start space-x-2 p-2 bg-amber-50 rounded-lg text-xs text-amber-700">
                                                        <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-amber-100 text-amber-600 mt-0.5">
                                                            !
                                                        </span>
                                                        <div className="flex-1">
                                                            <span className="font-medium">Chú ý: </span> {noteOverSize(pkg)}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                </motion.div>
                            ))}

                            <motion.button
                                type="button"
                                onClick={addPackage}
                                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full sm:w-auto"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                            >
                                + Thêm Kiện
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <motion.div
                className="mt-6 bg-gray-50 p-3 rounded-lg border border-gray-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-lg font-semibold text-purple-800">Tổng</h3>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white p-2 rounded-lg shadow-xs text-center">
                        <div className="flex flex-col items-center">
                            <svg className="w-4 h-4 mb-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span className="text-xs font-medium text-gray-600">Tổng kiện</span>
                            <p className="text-sm font-semibold text-purple-600 mt-1">
                                {total.totalPackage}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-2 rounded-lg shadow-xs text-center">
                        <div className="flex flex-col items-center">
                            <svg className="w-4 h-4 mb-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                            <span className="text-xs font-medium text-gray-600">Phí quá khổ</span>
                            <p className="text-sm font-semibold text-purple-600 mt-1">
                                {formatCurrency(total.totalOverSize)}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-2 rounded-lg shadow-xs text-center">
                        <div className="flex flex-col items-center">
                            <svg className="w-4 h-4 mb-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                            <span className="text-xs font-medium text-gray-600">Cân nặng</span>
                            <p className="text-sm font-semibold text-purple-600 mt-1">
                                {total.realVolume} KG
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="flex justify-center sm:justify-end mt-4 pb-5">
                <motion.button
                    type="button"
                    onClick={() => {
                        handleGetQuote();
                    }}
                    className="bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded hover:bg-purple-800 w-full sm:w-auto"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                >
                    {isOpenFormPackage ? "Chọn Dịch Vụ" : "Kiểm tra Kiện hàng"}
                </motion.button>
            </div>

            <AnimatePresence>
                {showQuote && isChangeCountry && (
                    <motion.div
                        className="mt-6 p-2 sm:p-4 relative pb-5"
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <h3 className="text-lg sm:text-xl font-semibold mb-4">
                            Bảng giá của các hãng
                        </h3>

                        <motion.button
                            onClick={() => scrollContainer("left")}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10 hover:bg-gray-100"
                            whileHover={{ scale: 1.1, x: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            ◀
                        </motion.button>

                        <motion.button
                            onClick={() => scrollContainer("right")}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10 hover:bg-gray-100"
                            whileHover={{ scale: 1.1, x: 2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            ▶
                        </motion.button>

                        <div
                            ref={quoteRef}
                            className="flex space-x-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-1 sm:px-0"
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
                                    <div className="p-3 border-b">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h2 className="text-sm font-bold text-gray-800 flex items-center">
                                                    {quote.company} Saver®
                                                    <span className="ml-1 text-xs font-normal bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                                                        {quote.code || "JD"}
                                                    </span>
                                                </h2>
                                                <p className="text-xs text-gray-500 mt-1">{quote.endDate}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">Zone: {quote.zone}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 flex-grow">
                                        <div className="mb-2">
                                            <h3 className="text-xs font-semibold text-gray-700">Dự kiến giao hàng</h3>
                                            <p className="text-sm text-blue-600 font-medium">
                                                {quote.deliveryDateBegin || "17-04-2025"} ↦ {quote.deliveryDateEnd || "17-04-2025"}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2">Lấy hàng trong 2h - 36h</p>
                                        <p className="text-xs text-gray-400 mb-2">Hiệu lực đến: 31-12-2025</p>
                                    </div>

                                    <div className="p-3 bg-gray-50 border-t">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500">NET: {formatCurrency(quote.price)} VND</p>
                                                <p className="text-xs text-gray-500">PPXD: {formatCurrency(quote.pricePPXD)} VND</p>
                                                {total.totalOverSize !== 0 && (
                                                    <p className="text-xs text-gray-500">
                                                        Oversize: {formatCurrency((quote.code === "Tiết Kiệm" ? 0 : total.totalOverSize))} VND
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500">VAT(8%): {formatCurrency(quote.VAT)} VND</p>

                                                <p className="text-base font-bold text-gray-800 mt-1">
                                                    {formatCurrency(quote.price + quote.VAT + quote.pricePPXD + (quote.code === "Tiết Kiệm" ? 0 : total.totalOverSize))} VND
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
        </>
    );
};

export default FormPackage;
