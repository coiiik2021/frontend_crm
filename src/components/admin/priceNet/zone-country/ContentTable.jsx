"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx"; // Import thư viện xlsx
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../ui/table";
import { GetZoneCountry, PostZoneCountry } from "../../../../service/api.admin.service";

export default function ContentTable() {
    const [zoneCountry, setZoneCountry] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); // State để lưu giá trị tìm kiếm

    const [isImported, setIsImported] = useState(false); // State để kiểm tra xem dữ liệu đã được import hay chưa

    useEffect(() => {
        // Dữ liệu mặc định ban đầu
        const fetchData = async () => {
            const data = await GetZoneCountry();
            setZoneCountry(data);
        }
        fetchData();
    }, []);

    // Lọc dữ liệu dựa trên giá trị tìm kiếm
    const filteredData = zoneCountry.filter((row) =>
        row.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Hàm xử lý khi import file Excel
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

            // Chuyển đổi dữ liệu từ Excel thành định dạng phù hợp
            const headers = jsonData[0]; // Dòng đầu tiên là header
            const formattedData = jsonData.slice(1).map((row) => ({
                name: row[0] || "", // Cột đầu tiên là tên quốc gia
                dhleco: row[1] || "",
                dhlvn: row[2] || "",
                ups: row[3] || "",
                fedex: row[4] || "",
                sf: row[5] || "",
            }));

            setZoneCountry(formattedData); // Cập nhật dữ liệu vào state
        };
        reader.readAsArrayBuffer(file);
        setIsImported(true); // Đánh dấu là đã import dữ liệu
    };

    // Hàm xử lý lưu trữ dữ liệu
    const handleSaveData = async () => {
        console.log("Dữ liệu đã được lưu:", zoneCountry);
        await PostZoneCountry(zoneCountry);
        alert("Dữ liệu đã được lưu thành công!");
        setIsImported(false);
    };

    return (
        <div className="overflow-hidden bg-white dark:bg-white/[0.03] rounded-xl">
            <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Zone Country Table
                </h2>
                {/* Thanh công cụ */}
                <div className="mt-4 flex items-center gap-4">
                    {/* Ô tìm kiếm */}
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {/* Nút import file */}
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
                    {/* Nút lưu trữ */}
                    {
                        isImported &&

                        <button
                            onClick={handleSaveData}
                            className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
                        >
                            Lưu trữ
                        </button>
                    }

                </div>
            </div>

            <div className="max-w-full overflow-x-auto custom-scrollbar">
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-gray-200 rounded-lg shadow-md">
                    <Table className="min-w-full">
                        {/* Table Header */}
                        <TableHeader className="border-t border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 text-xs font-medium border border-gray-100 dark:border-white/[0.05] bg-white dark:bg-dark-900 sticky left-0 z-10"
                                >
                                    Name
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 text-xs font-medium border border-gray-100 dark:border-white/[0.05]"
                                >
                                    DHLSIN
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 text-xs font-medium border border-gray-100 dark:border-white/[0.05]"
                                >
                                    DHLVN
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 text-xs font-medium border border-gray-100 dark:border-white/[0.05]"
                                >
                                    UPS
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 text-xs font-medium border border-gray-100 dark:border-white/[0.05]"
                                >
                                    FEDEX
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 text-xs font-medium border border-gray-100 dark:border-white/[0.05]"
                                >
                                    SF
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        {/* Table Body */}
                        <TableBody>
                            {filteredData.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    <TableCell
                                        className="px-4 py-3 text-xs border border-gray-100 dark:border-white/[0.05] bg-white dark:bg-dark-900 sticky left-0 z-10"
                                    >
                                        {row.name}
                                    </TableCell>
                                    <TableCell
                                        className="px-4 py-3 text-xs border border-gray-100 dark:border-white/[0.05]"
                                    >
                                        {row.dhleco}
                                    </TableCell>
                                    <TableCell
                                        className="px-4 py-3 text-xs border border-gray-100 dark:border-white/[0.05]"
                                    >
                                        {row.dhlvn}
                                    </TableCell>
                                    <TableCell
                                        className="px-4 py-3 text-xs border border-gray-100 dark:border-white/[0.05]"
                                    >
                                        {row.ups}
                                    </TableCell>
                                    <TableCell
                                        className="px-4 py-3 text-xs border border-gray-100 dark:border-white/[0.05]"
                                    >
                                        {row.fedex}
                                    </TableCell>
                                    <TableCell
                                        className="px-4 py-3 text-xs border border-gray-100 dark:border-white/[0.05]"
                                    >
                                        {row.sf}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}