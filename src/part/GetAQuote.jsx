import React, { useEffect, useState } from "react";

import HangKhong from "./GetQuote/HangKhong";
import DuongBien from "./GetQuote/DuongBien";
import TMDT from "./GetQuote/TMDT";
import { GetCodeByCompany } from "../service/api.service.jsx";

const GetAQuote = () => {
  const ppXangDau = 0.2825;

  const phanTramVAT = 0.08;

  const dollar = 26000;
  const [show, setShow] = useState(0);
  const loiNhuan = 1.4;

  const [nameCountry, setNameCountry] = useState("USA (US)");


  const formatCurrency = (amount) => {
    const num = parseFloat(String(amount).replace(/[^0-9.]/g, ''));

    if (isNaN(num)) return '0';

    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const [isOpenFormPackage, setIsOpenFormPackage] = useState(true);


  const [countryCode, setCountryCode] = useState({});
  const [codeCountrySelect, setCodeCountrySelect] = useState({
    dhlsin: "Zone 5",
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
      console.log(countryCode);
    }
    loadCountry();

  },
    []

  );
  const [selectService, setSelectService] = useState("flight");

  const [showQuote, setShowQuote] = useState(false);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="w-full sm:w-auto">
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-0 sm:mr-2">
            Dịch vụ
          </label>
          <select
            id="region"
            className="w-full sm:w-auto border border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            value={selectService}
            onChange={(e) => {
              setSelectService(e.target.value);
              if (e.target.value === "flight") {
                setShow(0);
              } else if (e.target.value === "sea") {
                setShow(1);
              } else {
                setShow(2);
              }
              setNameCountry("");
            }}
          >
            <option value="flight">Hàng Không</option>
            <option value="sea">Biển</option>
            <option value="ecom">Thương mại điện tử</option>
          </select>
        </div>

        {/* Destination Country Input - Right Corner (Conditional) */}
        {show !== 2 && (
          <div className="w-full sm:w-auto ml-auto">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-0 sm:mr-2">
              Nước đến
            </label>
            <div className="relative">
              <input
                list="country-list"
                id="country"
                name="country"
                className="w-full sm:w-auto min-w-[200px] border border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Nhập quốc gia"
                value={nameCountry}
                onChange={(e) => {
                  const selectedCountry = e.target.value;
                  setNameCountry(selectedCountry);
                  const countryInfo = countryCode[selectedCountry];

                  if (countryInfo) {
                    setCodeCountrySelect(countryInfo);
                  }
                  setShowQuote(false);
                  setIsOpenFormPackage(true);
                }}
              />
              <datalist id="country-list">
                {show === 1 ? (
                  <option value="USA (US)" />
                ) : (
                  Object.keys(countryCode).map((country, index) => (
                    <option key={index} value={country} />
                  ))
                )}
              </datalist>
            </div>
          </div>
        )}
      </div>

      {
        (show === 0)
        &&
        <HangKhong ppXangDau={ppXangDau}
          loiNhuan={loiNhuan}
          phanTramVAT={phanTramVAT}
          dollar={dollar}
          formatCurrency={formatCurrency}
          setCountryCode={setCountryCode}
          codeCountrySelect={codeCountrySelect}
          showQuote={showQuote}
          setShowQuote={setShowQuote}
          isOpenFormPackage={isOpenFormPackage}
          setIsOpenFormPackage={setIsOpenFormPackage}
        />
      }
      {(show === 1)
        &&
        <DuongBien
          loiNhuan={loiNhuan}

          ppXangDau={ppXangDau}
          phanTramVAT={phanTramVAT}
          dollar={dollar}
          formatCurrency={formatCurrency}
          setCountryCode={setCountryCode}
          codeCountrySelect={codeCountrySelect}
          showQuote={showQuote}
          setShowQuote={setShowQuote}
          isOpenFormPackage={isOpenFormPackage}
          setIsOpenFormPackage={setIsOpenFormPackage}
        />
      }
      {
        (show === 2)
        &&
        <TMDT
          loiNhuan={loiNhuan}

          ppXangDau={ppXangDau}
          phanTramVAT={phanTramVAT}
          dollar={dollar}
          formatCurrency={formatCurrency}
          setCountryCode={setCountryCode}
          codeCountrySelect={codeCountrySelect}
          showQuote={showQuote}
          setShowQuote={setShowQuote}
          isOpenFormPackage={isOpenFormPackage}
          setIsOpenFormPackage={setIsOpenFormPackage}
        />
      }

    </div>
  );
};


export default GetAQuote;