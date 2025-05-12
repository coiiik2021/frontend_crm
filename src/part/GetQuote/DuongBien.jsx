import React, { useEffect, useState } from "react";
import { GetPriceNetSeaNoTrucking, GetPriceNetSeaTrucking } from "../../service/api.service.jsx";
import { AnimatePresence, motion } from "framer-motion";

const DuongBien = (prop) => {

  const { setIsOpenFormPackage, isOpenFormPackage,
    setShowQuote, showQuote,
    quoteRef,
    ppXangDau, phanTramVAT,
    formatCurrency, dollar,
    loiNhuan
  } = prop;
  const [errors, setErrors] = useState({});
  const [quoteData, setQuoteData] = useState([]);
  const [codeTieuBang, setCodeTieuBang] = useState("");
  const [netPriceTrucking, setNetPriceTrucking] = useState({});
  const [netPriceNoTrucking, setNetPriceNoTrucking] = useState({});

  const [total, setTotal] = useState({
    totalPackage: 1,
    realVolume: 0
  });
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
    if (codeTieuBang === "" || isNaN(codeTieuBang) || parseFloat(codeTieuBang) <= 0 || codeTieuBang.length !== 5) {
      newErrors["codeTieuBang"] = "Lớn hơn 0 và có 5 chữ số";
      isValid = false;

    }


    setErrors(newErrors);
    return isValid;
  };

  const [packages, setPackages] = useState([
    {
      id: 1,
      length: "",
      width: "",
      height: "",
      weight: "",
      dim: 0,
      total: {
        total: {
          totalWeight: 0,
          realVolume: 0
        }
      }
    },
  ]);

  useEffect(() => {
    async function loadData() {
      const resTrucking = await GetPriceNetSeaTrucking();

      setNetPriceTrucking(resTrucking.data.values);
      const resNotrucking = await GetPriceNetSeaNoTrucking();

      setNetPriceNoTrucking(resNotrucking.data.values);


    }
    loadData();

  }, []);

  const addPackage = () => {
    const newId = packages.length > 0 ? Math.max(...packages.map(p => p.id)) + 1 : 1;

    setPackages(prev => [
      ...prev,
      {
        id: newId,
        length: "",
        width: "",
        height: "",
        weight: "",
        dim: 0,
        total: {
          totalWeight: 0,
          realVolume: 0
        }
      }
    ]);

    setTotal(prev => ({ ...prev, totalPackage: prev.totalPackage + 1 }));
    setShowQuote(false);
  };
  const removePackage = (id) => {
    if (packages.length <= 1) return;

    setPackages(prevPackages => {
      const packageToRemove = prevPackages.find(pkg => pkg.id === id);
      if (!packageToRemove) return prevPackages;

      // Cập nhật total
      setTotal(prev => ({
        totalPackage: prev.totalPackage - 1,
        realVolume: prev.realVolume - (packageToRemove.total?.realVolume || 0),
        // totalOverSize: prev.totalOverSize - (quaKhoMap.get(packageToRemove.total?.OverSize)?.price || 0)
      }));

      return prevPackages.filter(pkg => pkg.id !== id);
    });

    setShowQuote(false);
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

  const handleChange = (id, field, value) => {
    setPackages((prevPackages) => {
      const updatedPackages = prevPackages.map((pkg) => {
        if (pkg.id !== id) return pkg;

        const updatedPkg = { ...pkg, [field]: value };

        const { length, width, height } = updatedPkg;
        let dimValue = (parseFloat(length) || 0) *
          (parseFloat(width) || 0) *
          (parseFloat(height) || 0) / 6000;

        const decimalPart = dimValue % 1;
        if (decimalPart > 0 && decimalPart < 0.5) {
          dimValue = Math.floor(dimValue) + 0.5;
        } else if (decimalPart >= 0.5) {
          dimValue = Math.ceil(dimValue);
        }
        updatedPkg.dim = dimValue;


        let realVolumePkg = Math.max(dimValue, parseFloat(updatedPkg.weight) || 0);
        if (realVolumePkg > 20) {
          realVolumePkg = Math.ceil(realVolumePkg);
        }

        updatedPkg.total = {
          realVolume: realVolumePkg,

          totalPackage: parseFloat(updatedPkg.quantity) || 0,
          totalWeight: parseFloat(updatedPkg.weight) || 0
        };
        updatedPkg.isTrucking = updatedPkg.total.realVolume >= 22 ? 1 : 0;

        return updatedPkg;
      });

      // Tính toán lại tổng sau khi cập nhật packages
      const newTotal = updatedPackages.reduce((acc, pkg) => ({
        realVolume: acc.realVolume + (pkg.total?.realVolume || 0),
        // totalOverSize: acc.totalOverSize + (quaKhoMap.get(pkg.total?.OverSize)?.price || 0),
        totalPackage: packages.length
      }), {
        realVolume: 0,
        totalPackage: 0
      });

      // Cập nhật state total một lần duy nhất
      setTotal(newTotal);

      return updatedPackages;
    });

    setErrors((prev) => ({
      ...prev,
      [`${id}-${field}`]: "",
    }));

    // setShowQuote(false);
    setIsOpenFormPackage(true);
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



  const indexPriceNoTrucking = [100, 70, 50, 0];

  const getPriceNoTrucking = () => {

    let indexPrice = 0;
    for (let i = 0; i < indexPriceNoTrucking.length; ++i) {

      if (total.realVolume >= indexPriceNoTrucking[i]) {
        indexPrice = i;
        break;
      }
    }

    const prefix2 = (codeTieuBang.substring(0, 2));

    if (parseInt(prefix2) >= 90 && parseInt(prefix2) <= 93) {
      return parseInt(total.realVolume) >= 300
        ? netPriceNoTrucking[0][indexPrice] * total.realVolume
        :
        netPriceNoTrucking[0][indexPrice] * total.realVolume;
    }
    const prefix1 = prefix2[0];

    switch (prefix1) {
      case "9":
      case "8":
        return netPriceNoTrucking[1][indexPrice] * total.realVolume;
      case "7":
        return netPriceNoTrucking[2][indexPrice] * total.realVolume;


      case "5":
      case "6":
        return netPriceNoTrucking[3][indexPrice] * total.realVolume;

      case "3":
      case "4":
        return netPriceNoTrucking[4][indexPrice] * total.realVolume;

      case "0":
      case "1":
      case "2":
        return netPriceNoTrucking[5][indexPrice] * total.realVolume;

      default:
        console.warn("Prefix không khớp với nhóm nào");
        return 0;
    }

  };
  const indexTrucking = [249, 499, 750, 999, 1249, 1499, 1749, 1999];

  const getPriceTrucking = () => {
    let indexFeeTrucking = 0;

    for (let i = 0; i < indexTrucking.length; ++i) {
      if (indexTrucking[i] > total.realVolume) {
        indexFeeTrucking = i + 2;
        break;
      }
    }

    const prefix2 = (codeTieuBang.substring(0, 2));

    if (parseInt(prefix2) >= 90 && parseInt(prefix2) <= 93) {
      return parseInt(total.realVolume) >= 300
        ? {
          priceIncludeTrucking: netPriceTrucking[0][1] * total.realVolume,
          fee: netPriceTrucking[0][indexFeeTrucking]
        }

        : {
          priceIncludeTrucking: netPriceTrucking[0][0] * total.realVolume,
          fee: netPriceTrucking[0][indexFeeTrucking]
        };
    }
    const prefix1 = prefix2[0];

    switch (prefix1) {
      case "9":
      case "8":
        return parseInt(total.realVolume) >= 300
          ? {
            priceIncludeTrucking: netPriceTrucking[1][1] * total.realVolume,
            fee: netPriceTrucking[1][indexFeeTrucking]
          }
          : {
            priceIncludeTrucking: netPriceTrucking[1][0] * total.realVolume,
            fee: netPriceTrucking[1][indexFeeTrucking]
          };

      case "7":
        return parseInt(total.realVolume) >= 300
          ? {
            priceIncludeTrucking: netPriceTrucking[2][1] * total.realVolume,
            fee: netPriceTrucking[2][indexFeeTrucking]
          }
          : {
            priceIncludeTrucking: netPriceTrucking[2][0] * total.realVolume,
            fee: netPriceTrucking[2][indexFeeTrucking]
          };

      case "5":
      case "6":
        return parseInt(total.realVolume) >= 300
          ? {
            priceIncludeTrucking: netPriceTrucking[3][1] * total.realVolume,
            fee: netPriceTrucking[3][indexFeeTrucking]
          }
          : {
            priceIncludeTrucking: netPriceTrucking[3][0] * total.realVolume,
            fee: netPriceTrucking[3][indexFeeTrucking]
          };

      case "3":
      case "4":
        return parseInt(total.realVolume) >= 300
          ? {
            priceIncludeTrucking: netPriceTrucking[4][1] * total.realVolume,
            fee: netPriceTrucking[4][indexFeeTrucking]
          }
          : {
            priceIncludeTrucking: netPriceTrucking[4][0] * total.realVolume,
            fee: netPriceTrucking[4][indexFeeTrucking]
          };

      case "0":
      case "1":
      case "2":
        return parseInt(total.realVolume) >= 300
          ? {
            priceIncludeTrucking: netPriceTrucking[5][1] * total.realVolume,
            fee: netPriceTrucking[5][indexFeeTrucking]
          }
          : {
            priceIncludeTrucking: netPriceTrucking[5][0] * total.realVolume,
            fee: netPriceTrucking[5][indexFeeTrucking]
          };

      default:
        console.warn("Prefix không khớp với nhóm nào");
        return {
          price: 0,
          priceIncludeTrucking: 0
        };
    }
  };




  const handleGetQuote = () => {

    if (!validateInputs()) {
      setShowQuote(false);
      return;
    }
    let dummyQuotes = [];

    const { priceIncludeTrucking, fee } = getPriceTrucking();
    const today = new Date();
    const dateBegin = new Date();
    dateBegin.setDate(today.getDate() + 12);
    const dateEnd = new Date();
    dateEnd.setDate(today.getDate() + 17);



    let includeTrucking = {
      name: "Bao gồm phí",
      price: priceIncludeTrucking * 1000 * loiNhuan,
      pricePPXD: priceIncludeTrucking * 1000 * loiNhuan * ppXangDau,
      trucking: fee * dollar,
      deliveryDateBegin: dateBegin.toLocaleDateString('vi-VN'),
      deliveryDateEnd: dateEnd.toLocaleDateString('vi-VN')

    };
    includeTrucking = { ...includeTrucking, VAT: (includeTrucking.price + includeTrucking.pricePPXD) * phanTramVAT };

    const priceNoTrucking = getPriceNoTrucking() * loiNhuan;


    let noTrucking =
    {
      price: priceNoTrucking,
      pricePPXD: priceNoTrucking * ppXangDau,
      name: "Tối ưu nhất",
      trucking: 0,
      deliveryDateBegin: dateBegin.toLocaleDateString('vi-VN'),
      deliveryDateEnd: dateEnd.toLocaleDateString('vi-VN')
    };
    noTrucking = { ...noTrucking, VAT: (noTrucking.price + noTrucking.pricePPXD) * phanTramVAT };


    for (let i = 0; i < packages.length; ++i) {
      if (packages[i].total.realVolume >= 22) {
        dummyQuotes.push(includeTrucking);

        break;
      }
    }

    dummyQuotes.push(noTrucking);

    setQuoteData(dummyQuotes);
    setShowQuote(!showQuote);
    setIsOpenFormPackage(!isOpenFormPackage);

  };

  const cardAnimation = {
    hidden: { y: 20, opacity: 0 },
    visible: (i) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.3
      }
    })
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between cursor-pointer mb-2">
          <div className="flex items-center" onClick={() => setIsOpenFormPackage(!isOpenFormPackage)}>
            <h2 className="text-xl sm:text-2xl font-bold text-purple-700 mr-2">Kiện hàng</h2>
            <motion.span
              className="text-purple-700 text-xl"
              animate={{ rotate: isOpenFormPackage ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              ▼
            </motion.span>
          </div>

          <div>
            <input
              type="number"
              placeholder="Mã bưu điện"
              className={
                `border border-gray-300 rounded px-2 py-1 w-41
    ${errors["codeTieuBang"]
                  ? "border-red-500"
                  : "border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-200"
                }
    
    `
              } // bạn có thể điều chỉnh kích thước tùy ý
              onChange={(e) => {
                setCodeTieuBang(e.target.value);
                setIsOpenFormPackage(true);
                setShowQuote(false);
              }} // để không trigger toggle khi click vào input
            />
            <AnimatePresence>
              {errors["codeTieuBang"] && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors["codeTieuBang"]}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
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

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-5 items-end">
                    {["length", "width", "height", "weight", "dim"].map((field) => {
                      const errorKey = `${pkg.id}-${field}`;
                      return (
                        <div key={field}>
                          <label
                            htmlFor={`field-${pkg.id}-${field}`}
                            className="block text-sm font-medium mb-1"
                          >
                            {field.toUpperCase()}
                          </label>
                          <input
                            id={`field-${pkg.id}-${field}`}
                            type="number"
                            min="0"
                            disabled={field === "dim"}
                            value={pkg[field]}
                            onChange={(e) =>
                              handleChange(pkg.id, field, e.target.value)
                            }
                            className={`w-full border rounded px-3 py-2 transition-colors duration-200 ${errors[errorKey]
                                ? "border-red-500"
                                : "border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-200"
                              }`}
                            placeholder="Nhập số"
                          />
                          <AnimatePresence>
                            {errors[errorKey] && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-red-500 text-sm mt-1"
                              >
                                {errors[errorKey]}
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

                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mt-4 bg-gray-100 p-3 rounded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <div className="text-center py-2">
                      <p className="text-sm font-medium">Total Weight</p>
                      <p className="text-blue-500 font-semibold">
                        {pkg.total?.totalWeight || 0}
                      </p>
                    </div>

                    <div className="text-center py-2 border-t sm:border-t-0 sm:border-l sm:border-r border-gray-200">
                      <p className="text-sm font-medium">Trucking</p>
                      <p className="text-blue-500 font-semibold">
                        {pkg.isTrucking === 1 ? "YES" : "NO"}

                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {/* {noteOverSize(pkg)} Fee */}
                      </p>
                    </div>

                    <div className="text-center py-2 border-t sm:border-t-0">
                      <p className="text-sm font-medium">Real Volume</p>
                      <p className="text-blue-500 font-semibold">
                        {pkg.total?.realVolume || 0}
                      </p>
                    </div>
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
        className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-center mb-4">
          <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-semibold text-purple-800">Tổng</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Total Packages */}
          <div className="bg-white p-3 rounded-lg shadow-xs flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-xs font-medium text-gray-600">Total Packages</span>
            </div>
            <span className="text-sm font-semibold text-purple-600">
              {total.totalPackage}
            </span>
          </div>

          {/* Total Trucking */}
          <div className="bg-white p-3 rounded-lg shadow-xs flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
              <span className="text-xs font-medium text-gray-600">Total Trucking</span>
            </div>
            <span className="text-sm font-semibold text-purple-600">
              {formatCurrency()} VND
            </span>
          </div>

          {/* Total Volume */}
          <div className="bg-white p-3 rounded-lg shadow-xs flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              <span className="text-xs font-medium text-gray-600">Total Volume</span>
            </div>
            <span className="text-sm font-semibold text-purple-600">
              {total.realVolume}
            </span>
          </div>
        </div>
      </motion.div>
      <div className="flex justify-center sm:justify-end mt-4">
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
          {isOpenFormPackage ? "Kiểm tra giá" : "Kiểm tra kiện hàng"}
        </motion.button>
      </div>


      <AnimatePresence>
        {showQuote && (
          <motion.div
            className="mt-6 p-2 sm:p-4 relative pb-5"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center">Bảng giá của các hãng</h3>

            <div className="flex justify-center">
              <div
                className="flex overflow-x-hidden pb-4"
                ref={quoteRef}
                style={{ width: 'fit-content' }} // Giới hạn chiều rộng theo nội dung
              >
                <div className="flex space-x-6 sm:space-x-8"> {/* Tăng khoảng cách giữa các card */}
                  {quoteData.map((quote, index) => (
                    <motion.div
                      key={index}
                      className="flex-shrink-0 w-80 sm:w-96 bg-white rounded-lg shadow-md border border-gray-200 flex flex-col" // Tăng kích thước card
                      variants={cardAnimation}
                      initial="hidden"
                      animate="visible"
                      custom={index}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                      <div className="p-4 border-b"> {/* Tăng padding */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center"> {/* Tăng kích thước font */}
                              {quote.name}
                              <span className="ml-2 text-sm font-normal bg-green-100 text-green-800 px-2 py-1 rounded"> {/* Tăng kích thước badge */}
                                {quote.trucking === 0 ? "NO TRUCKING" : "TRUCKING"}
                              </span>
                            </h2>
                          </div>
                          <div className="text-right"></div>
                        </div>
                      </div>

                      <div className="p-4 flex-grow"> {/* Tăng padding */}
                        <div className="mb-3">
                          <h3 className="text-sm font-semibold text-gray-700">Dự kiến giao hàng</h3> {/* Tăng kích thước font */}
                          <p className="text-base text-blue-600 font-medium"> {/* Tăng kích thước font */}
                            {quote.deliveryDateBegin || "17-04-2025"} ↦ {quote.deliveryDateEnd || "17-04-2025"}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Lấy hàng trong 2h - 36h</p> {/* Tăng kích thước font */}
                        <p className="text-sm text-gray-400 mb-4">Hiệu lực đến: 31-12-2025</p> {/* Tăng kích thước font */}
                      </div>

                      <div className="p-4 bg-gray-50 border-t"> {/* Tăng padding */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">NET: {formatCurrency(quote.price)} VND</p> {/* Tăng kích thước font */}
                            <p className="text-sm text-gray-500">PPXD: {formatCurrency(quote.pricePPXD)} VND</p>
                            {total.feeTrucking !== 0 && (
                              <p className="text-sm text-gray-500">
                                Total Trucking: {formatCurrency(quote.trucking)} VND
                              </p>
                            )}

                            <p className="text-sm text-gray-500">VAT(8%): {formatCurrency(quote.VAT)} VND</p>

                            <p className="text-lg sm:text-xl font-bold text-gray-800">
                              {formatCurrency(quote.price + quote.VAT + quote.pricePPXD + quote.trucking)} VND
                            </p>
                          </div>
                          <motion.button
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Đặt ngay
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
};

export default DuongBien;