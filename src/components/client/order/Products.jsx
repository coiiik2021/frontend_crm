import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";
import favoriteProducts from '../../../data/favoriteProducts.json';

const Products = ({
    products,
    setProducts,
    productsTotal,
    setProductsTotal,
    productsErrors,
    setProductsErrors
}) => {
    const [isOpenFormPackage, setIsOpenFormPackage] = useState(true);
    const [favorites, setFavorites] = useState(favoriteProducts.favorites);
    const [showSavedPopup, setShowSavedPopup] = useState(false);
    const [saveErrors, setSaveErrors] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const popupRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        setProductsErrors({});
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showSavedPopup &&
                popupRef.current &&
                !popupRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)) {
                setShowSavedPopup(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSavedPopup]);

    const formatCurrency = (amount) => {
        const num = parseFloat(String(amount).replace(/[^0-9.]/g, ''));

        if (isNaN(num)) return '0';

        return new Intl.NumberFormat('vi-VN', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
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

    const addPackage = () => {
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

        setProducts(prev => [

            {
                id: newId,
                description: "",
                quantity: 0,
                origin: "",
                unit: "",
                price: 0,
                totalPrice: 0,
                unitPrice: 0,
            }, ...prev
        ]);

        setProductsTotal(prev => ({ ...prev, quantity: prev.quantity + 1 }));
    };

    const removePackage = (id) => {
        if (products.length <= 1) return;

        setProducts(prevProducts => {
            const productToRemove = prevProducts.find(pkg => pkg.id === id);
            if (!productToRemove) return prevProducts;
            setProductsTotal(prev => ({
                quantity: prev.quantity - 1 / 2,
                priceProduct: prev.priceProduct - (productToRemove.totalPrice / 2 || 0),
            }));

            return prevProducts.filter(pkg => pkg.id !== id);
        });
    };

    const handleChange = (id, field, value) => {
        setProducts((prevProducts) => {
            const updatedProducts = prevProducts.map((pkg) => {
                if (pkg.id !== id) return pkg;
                const updatedPkg = { ...pkg, [field]: value };
                if (field === "Số lượng" || field === "Giá trên 1 sản phẩm") {
                    const quantity = field === "Số lượng" ? Number(value) : Number(pkg["Số lượng"]);
                    const price = field === "Giá trên 1 sản phẩm" ? Number(value) : Number(pkg["Giá trên 1 sản phẩm"]);
                    updatedPkg["Giá Trị"] = quantity * price;
                    updatedPkg.totalPrice = quantity * price;
                }
                return updatedPkg;
            });

            const newTotal = updatedProducts.reduce((acc, pkg) => ({
                priceProduct: acc.priceProduct + (pkg["Giá Trị"] || 0),
                quantity: products.length
            }), {
                priceProduct: 0,
                quantity: 0
            });

            setProductsTotal(newTotal);

            return updatedProducts;
        });

        setProductsErrors((prev) => ({
            ...prev,
            [`${id}-${field}`]: "",
        }));
    };

    const handleImportExcel = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = evt.target.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            const productRows = jsonData.slice(1).filter(row => row.length >= 8);

            let importedProducts = productRows
                .filter(row => row.length >= 4)
                .map((row, idx) => ({
                    id: idx + 1,
                    "Mô tả sản phẩm": row[1] || "",
                    "Xuất xứ": row[4] || "",
                    "Số lượng": Number(row[6]) || 0,
                    "Kiểu đơn vị": row[7] || "",
                    "Giá trên 1 sản phẩm": Number(row[8]) || 0,
                    "Giá Trị": (Number(row[6]) || 0) * (Number(row[8]) || 0),
                    totalPrice: (Number(row[6]) || 0) * (Number(row[8]) || 0),
                }));

            if (importedProducts.length > 0) {
                importedProducts.pop();
            }

            setProducts(importedProducts);
            setProductsTotal({
                quantity: importedProducts.length,
                priceProduct: importedProducts.reduce((sum, p) => sum + p.totalPrice, productsTotal.priceProduct),
            });
        };
        reader.readAsBinaryString(file);
    };

    const isProductComplete = (product) => {
        const requiredFields = ["Mô tả sản phẩm", "Xuất xứ", "Số lượng", "Kiểu đơn vị", "Giá trên 1 sản phẩm"];
        return requiredFields.every(field => {
            const value = product[field];
            return value !== undefined && value !== null && value !== '';
        });
    };

    const isProductDuplicate = (product) => {
        return favorites.some(fav =>
            fav["Mô tả sản phẩm"].toLowerCase() === product["Mô tả sản phẩm"].toLowerCase() &&
            fav["Xuất xứ"].toLowerCase() === product["Xuất xứ"].toLowerCase()
        );
    };

    const saveToFavorites = (product) => {
        if (isProductDuplicate(product)) {
            setSaveErrors(prev => ({
                ...prev,
                [product.id]: "Sản phẩm này đã tồn tại trong danh sách yêu thích"
            }));
            setTimeout(() => {
                setSaveErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[product.id];
                    return newErrors;
                });
            }, 3000);
            return;
        }

        const newFavorite = {
            id: Date.now(),
            ...product
        };

        const updatedFavorites = [...favorites, newFavorite];
        setFavorites(updatedFavorites);
        localStorage.setItem("savedProducts", JSON.stringify(updatedFavorites));

        // Clear error for this product if exists
        setSaveErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[product.id];
            return newErrors;
        });
    };

    const loadFromFavorites = (favoriteProduct) => {
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

        const newProduct = {
            id: newId,
            "Mô tả sản phẩm": favoriteProduct["Mô tả sản phẩm"],
            "Xuất xứ": favoriteProduct["Xuất xứ"],
            "Số lượng": favoriteProduct["Số lượng"],
            "Kiểu đơn vị": favoriteProduct["Kiểu đơn vị"],
            "Giá trên 1 sản phẩm": favoriteProduct["Giá trên 1 sản phẩm"],
            "Giá Trị": favoriteProduct["Giá Trị"],
            totalPrice: favoriteProduct.totalPrice
        };

        setProducts(prev => [newProduct, ...prev]);
        setProductsTotal(prev => ({
            quantity: prev.quantity + 1,
            priceProduct: prev.priceProduct + newProduct.totalPrice
        }));
        setShowSavedPopup(false);
    };

    const handleDeleteSaved = (id) => {
        const newFavorites = favorites.filter(fav => fav.id !== id);
        setFavorites(newFavorites);
        localStorage.setItem("savedProducts", JSON.stringify(newFavorites));
    };

    useEffect(() => {
        const savedProducts = localStorage.getItem("savedProducts");
        if (savedProducts) {
            setFavorites(JSON.parse(savedProducts));
        }
    }, []);

    const filteredFavorites = favorites.filter(fav =>
        fav["Mô tả sản phẩm"].toLowerCase().includes(searchQuery.toLowerCase())
    );

    const truncateDescription = (description) => {
        if (!description) return "";
        return description.length > 40 ? `${description.substring(0, 40)}...` : description;
    };

    return (
        <>
            <div className="mb-6">
                <div className="flex items-center justify-between cursor-pointer mb-2">
                    <div className="flex items-center" onClick={() => setIsOpenFormPackage(!isOpenFormPackage)}>
                        <h2 className="text-xl sm:text-2xl font-bold text-purple-700 mr-2">Danh sách sản phẩm</h2>
                        <motion.span
                            className="text-purple-700 text-xl"
                            animate={{ rotate: isOpenFormPackage ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            ▼
                        </motion.span>
                    </div>
                    <button
                        ref={buttonRef}
                        onClick={() => setShowSavedPopup(prev => !prev)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                        {showSavedPopup ? "Đóng danh sách đã lưu" : "Sản phẩm đã lưu"}
                    </button>
                </div>

                <AnimatePresence>
                    {showSavedPopup && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mb-4 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-4"
                        >
                            <h4 className="text-base font-semibold mb-3">Danh sách sản phẩm đã lưu</h4>

                            {/* Search Input */}
                            <div className="mb-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Tìm kiếm theo mô tả sản phẩm..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {filteredFavorites.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4 col-span-full">
                                        {searchQuery ? "Không tìm thấy sản phẩm phù hợp" : "Chưa có sản phẩm nào được lưu."}
                                    </p>
                                ) : (
                                    filteredFavorites.map((fav) => (
                                        <div key={fav.id} className="border rounded-md p-3 bg-gray-50 dark:bg-gray-700">
                                            <div className="font-medium mb-2" title={fav["Mô tả sản phẩm"]}>
                                                {truncateDescription(fav["Mô tả sản phẩm"])}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                                Xuất xứ: {fav["Xuất xứ"]}<br />
                                                Số lượng: {fav["Số lượng"]} {fav["Kiểu đơn vị"]}<br />
                                                Giá: {formatCurrency(fav["Giá trên 1 sản phẩm"])} VND
                                            </div>
                                            <div className="mt-2 flex gap-2">
                                                <button
                                                    onClick={() => loadFromFavorites(fav)}
                                                    className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                                                >
                                                    Sử dụng
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSaved(fav.id)}
                                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                                >
                                                    Xoá
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isOpenFormPackage && (

                        <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={slideDown}
                        >

                            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-center space-x-2">
                                        <label className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                                            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <span className="text-sm font-medium text-gray-700">Chọn file Excel</span>
                                            <input
                                                type="file"
                                                accept=".xlsx,.xls"
                                                onChange={handleImportExcel}
                                                className="hidden"
                                            />
                                        </label>
                                        <span className="text-sm text-gray-500">(.xlsx, .xls)</span>
                                    </div>

                                </div>
                                <p className="mt-2 text-sm text-gray-500">
                                    Tải mẫu Excel để nhập dữ liệu sản phẩm theo định dạng chuẩn
                                </p>
                            </div>
                            <motion.button
                                type="button"
                                onClick={addPackage}
                                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full sm:w-auto"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                            >
                                + Thêm Sản phẩm
                            </motion.button>
                            {products.map((pkg, index) => (
                                <motion.div
                                    key={pkg.id}
                                    className="mb-6 border-t pt-4"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg sm:text-xl font-semibold">
                                            Sản phẩm {index + 1}/{products.length}
                                        </h3>
                                        <div className="flex flex-col items-end">
                                            {saveErrors[pkg.id] && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="text-red-500 text-sm mb-2"
                                                >
                                                    {saveErrors[pkg.id]}
                                                </motion.p>
                                            )}
                                            {isProductComplete(pkg) && (
                                                <motion.button
                                                    type="button"
                                                    onClick={() => saveToFavorites(pkg)}
                                                    className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                    </svg>
                                                    Lưu vào yêu thích
                                                </motion.button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-12 gap-3 sm:gap-5 items-end">
                                        {["Mô tả sản phẩm", "Xuất xứ", "Số lượng", "Kiểu đơn vị", "Giá trên 1 sản phẩm", "Giá Trị"].map((field) => {
                                            const errorKey = `${pkg.id}-${field}`;
                                            let columnClass = "";
                                            if (field === "Tên") {
                                                columnClass = "md:col-span-3";
                                            } else if (field === "Mô tả sản phẩm") {
                                                columnClass = "md:col-span-4";
                                            } else if (["Số lượng", "Giá trên 1 sản phẩm", "Giá Trị"].includes(field)) {
                                                columnClass = "md:col-span-1";
                                            }
                                            return (
                                                <div key={field} className={columnClass}>
                                                    <label
                                                        htmlFor={`field-${pkg.id}-${field}`}
                                                        className="block text-sm font-medium mb-1"
                                                    >
                                                        {field.toUpperCase()}
                                                    </label>
                                                    {field === "Mô tả sản phẩm" ? (
                                                        <textarea
                                                            id={`field-${pkg.id}-${field}`}
                                                            value={pkg[field]}
                                                            onChange={(e) => handleChange(pkg.id, field, e.target.value)}
                                                            onFocus={(e) => e.target.style.height = '250px'}
                                                            onBlur={(e) => e.target.style.height = '80px'}
                                                            className={`w-full border rounded px-3 py-2 transition-all duration-300 resize-y min-h-[80px] ${productsErrors[errorKey]
                                                                ? "border-red-500"
                                                                : "border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-200"
                                                                }`}
                                                            placeholder="Nhập mô tả sản phẩm"
                                                        />

                                                    ) : (
                                                        <input
                                                            id={`field-${pkg.id}-${field}`}
                                                            type={field === "Số lượng" || field === "Giá trên 1 sản phẩm" ? "number" : "text"}
                                                            min="0"
                                                            disabled={field === "Giá Trị"}
                                                            value={pkg[field]}
                                                            onChange={(e) =>
                                                                handleChange(pkg.id, field, e.target.value)
                                                            }
                                                            className={`w-full border rounded px-3 py-2 transition-colors duration-200 ${productsErrors[errorKey]
                                                                ? "border-red-500"
                                                                : "border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-200"
                                                                }`}
                                                            placeholder={field !== "Giá Trị" ? "Nhập" : "Giá"}
                                                        />
                                                    )}
                                                    <AnimatePresence>
                                                        {productsErrors[errorKey] && (
                                                            <motion.p
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: "auto" }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="text-red-500 text-sm mt-1"
                                                            >
                                                                {productsErrors[errorKey]}
                                                            </motion.p>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        })}

                                        <div className="flex items-center mt-3 sm:mb-2 sm:border-t sm:pt-4">
                                            <motion.button
                                                type="button"
                                                onClick={() => removePackage(pkg.id)}
                                                className="text-red-500 hover:text-red-700"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                🗑️
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}


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
                    {/* Total Packages */}
                    <div className="bg-white p-2 rounded-lg shadow-xs text-center">
                        <div className="flex flex-col items-center">
                            <svg className="w-4 h-4 mb-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span className="text-xs font-medium text-gray-600">Tổng Sản Phẩm</span>
                            <p className="text-sm font-semibold text-purple-600 mt-1">
                                {productsTotal.quantity}
                            </p>
                        </div>
                    </div>

                    {/* Total Trucking - Icon mới được thiết kế lại */}
                    <div className="bg-white p-2 rounded-lg shadow-xs text-center">
                        <div className="flex flex-col items-center">
                            <svg className="w-4 h-4 mb-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15.5 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9h13v9H3V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 9l3-3 3 3" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 15h5.5" />
                            </svg>
                            <span className="text-xs font-medium text-gray-600">Phí vận chuyển</span>
                            <p className="text-sm font-semibold text-purple-600 mt-1">
                                {formatCurrency(productsTotal.price)} VND
                            </p>
                        </div>
                    </div>

                    {/* Total Volume */}
                    <div className="bg-white p-2 rounded-lg shadow-xs text-center">
                        <div className="flex flex-col items-center">
                            <svg className="w-4 h-4 mb-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                            <span className="text-xs font-medium text-gray-600">Tổng Giá Trị</span>
                            <p className="text-sm font-semibold text-purple-600 mt-1">
                                {productsTotal.priceProduct} USD
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    )
}
export default Products;