"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import PriceNetTable from "../../TableDataPrice/PriceNetTable";
import PriceGasolineTable from "../../TableDataPrice/PriceGasolineTable";
import priceGasOline from "../../../../data/priceGasoline.json";
import { GetPriceNet, PostPriceNet } from "../../../../service/api.admin.service";

export default function ContentTable() {
    const [dataByDate, setDataByDate] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [tableType, setTableType] = useState("priceVT");
    const [priceSS, setPriceSS] = useState({});
    const [priceVT, setPriceVT] = useState({});
    const [priceGasoline, setPriceGasoline] = useState({});
    const [isPriceNet, setIsPriceNet] = useState(true);
    const [isImported, setIsImported] = useState(false);

    const [zone, setZone] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const dataVT = await GetPriceNet("ups-vt");
            const dataSS = await GetPriceNet("ups-ss");

            setPriceVT(dataVT);
            setPriceSS(dataSS);

            setDataByDate(dataVT);
            const firstDate = Object.keys(dataVT)[0];

            setSelectedDate(firstDate);
            setPriceGasoline(priceGasOline);

        };

        fetchData();
    }, []);

    const handleTableTypeChange = (type) => {
        setTableType(type);

        if (type === "priceVT") {
            setDataByDate(priceVT);
            const firstDate = Object.keys(priceVT)[0];
            setSelectedDate(firstDate);
        } else if (type === "priceSS") {
            setDataByDate(priceSS);
            const firstDate = Object.keys(priceSS)[0];
            setSelectedDate(firstDate);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Lấy dữ liệu dạng mảng

            console.log("Raw Excel Data:", jsonData); // Kiểm tra dữ liệu thô từ Excel

            if (jsonData.length < 1) {
                alert("File Excel không chứa dữ liệu hợp lệ.");
                return;
            }

            const headers = jsonData[0]; // Dòng đầu tiên là header
            setZone(headers.slice(1)); // Lưu header vào state zone

            const now = new Date();

            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const year = now.getFullYear();

            const formattedDate = `${month}/${day}/${year}`;
            console.log(formattedDate); // Ví dụ: "05/11/2025"



            // Chuyển đổi dữ liệu từ Excel thành định dạng phù hợp
            const formattedData = jsonData.slice(1).map((row) => ({
                weight: row[0]?.toString(), // Cột đầu tiên là weight
                values: headers.slice(1).map((zone, index) => ({
                    zone: zone, // Lấy tên zone từ header
                    price: Math.trunc(row[index + 1] || 0), // Lấy giá trị từ cột tương ứng
                })),
            }));

            setDataByDate((prevData) => ({
                ...prevData,
                [formattedDate]: formattedData,
            }));
            setSelectedDate(formattedDate);
            setIsImported(true);

            console.log("Headers (Zone):", headers.slice(1)); // Kiểm tra danh sách zone
            console.log("Formatted Data:", formattedData); // Kiểm tra dữ liệu đã định dạng
        };
        reader.readAsArrayBuffer(file);
    };

    const handleSaveData = async () => {
        console.log("Saving data:", dataByDate);

        if (tableType === "priceVT") {
            // api VT
            await PostPriceNet("ups-vt", dataByDate);
        } else {
            await PostPriceNet("ups-ss", dataByDate);
            // api SS
        }
        alert("Thông tin đã được lưu thành công!");
        setIsImported(false);
    };

    return (
        <div className="overflow-hidden bg-white dark:bg-white/[0.03] rounded-xl">
            <div className="p-4 flex items-center gap-4">
                <button
                    onClick={() => setIsPriceNet(true)}
                    className={`px-4 py-2 rounded ${isPriceNet ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                >
                    Giá Net
                </button>

                <button
                    onClick={() => setIsPriceNet(false)}
                    className={`px-4 py-2 rounded ${!isPriceNet ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                >
                    Giá xăng dầu
                </button>

                {
                    isPriceNet &&
                    <>
                        <select
                            value={selectedDate || ""}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-4 py-2 border rounded"
                        >
                            <option value="" disabled>
                                Select a date
                            </option>
                            {Object.keys(dataByDate).map((date) => (
                                <option key={date} value={date}>
                                    {date}
                                </option>
                            ))}
                        </select>

                        <select
                            value={tableType}
                            onChange={(e) => handleTableTypeChange(e.target.value)}
                            className="px-4 py-2 border rounded"
                        >
                            <option value="priceVT">Giá VT</option>
                            <option value="priceSS">Giá SS</option>
                        </select>

                        <label
                            htmlFor="file-upload"
                            className="px-4 py-2 text-white bg-blue-500 rounded cursor-pointer hover:bg-blue-600"
                        >
                            Import Excel
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </>
                }

                {isImported && (
                    <button
                        onClick={handleSaveData}
                        className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
                    >
                        Lưu thông tin
                    </button>
                )}
            </div>

            <div className="max-w-full overflow-x-auto custom-scrollbar">
                {isPriceNet ? (
                    <PriceNetTable dataByDate={dataByDate} selectedDate={selectedDate} />
                ) : (
                    <PriceGasolineTable priceGasoline={priceGasoline} setPriceGasoline={setPriceGasoline} />
                )}
            </div>
        </div>
    );
}
