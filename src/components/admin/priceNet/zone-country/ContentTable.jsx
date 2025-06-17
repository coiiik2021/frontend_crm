"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx"; // Import thư viện xlsx
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../ui/table";
import { GetZoneCountry, PostZoneCountry } from "../../../../service/api.admin.service";
import { useLoading } from "../../../../hooks/useLoading";
import { Spin } from "antd";

export default function ContentTable() {
    const [zoneCountry, setZoneCountry] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); // State để lưu giá trị tìm kiếm

    const [isImported, setIsImported] = useState(false); // State để kiểm tra xem dữ liệu đã được import hay chưa

    const { loading, withLoading } = useLoading();

    useEffect(() => {
        const fetchData = async () => {
            await withLoading(
                async () => {
                    const data = await GetZoneCountry();
                    console.log("Dữ liệu từ API:", data);
                    setZoneCountry(data);
                },
                "Lấy dữ liệu thành công",
                "Không thể lấy dữ liệu"
            );
        };
        fetchData();
    }, []);

    const filteredData = zoneCountry.filter((row) =>
        row.nameCountry?.toLowerCase().includes(searchTerm.toLowerCase())
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
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            console.log("Raw Excel Data:", jsonData);

            if (jsonData.length < 1) {
                alert("File Excel không chứa dữ liệu hợp lệ.");
                return;
            }

            const headers = jsonData[0]; // Dòng đầu tiên là tiêu đề
            const formattedData = jsonData.slice(1).filter((row) => row.length > 1).map((row) => ({
                nameCountry: row[0] || "", // Cột đầu tiên là tên quốc gia
                values: headers.slice(1).map((name, index) => ({
                    nameCompany: name, // Tên dịch vụ từ tiêu đề
                    zone: row[index + 1] !== undefined ? row[index + 1] : "", // Giá trị zone
                })),
            }));

            console.log("Formatted Data:", formattedData);
            setZoneCountry(formattedData); // Lưu dữ liệu vào state
        };
        reader.readAsArrayBuffer(file);
        setIsImported(true);
    };

    // Hàm xử lý lưu trữ dữ liệu
    const handleSaveData = async () => {
        await withLoading(
            async () => {
                console.log("Dữ liệu đã được lưu:", zoneCountry);
                await PostZoneCountry(zoneCountry);
                setIsImported(false);
            },
            "Lưu dữ liệu thành công",
            "Không thể lưu dữ liệu"
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spin size="large" />
            </div>
        );
    }

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
                    {isImported && (
                        <button
                            onClick={handleSaveData}
                            className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
                        >
                            Lưu trữ
                        </button>
                    )}
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
                                {zoneCountry.length > 0 &&
                                    zoneCountry[0].values.map((item, index) => (
                                        <TableCell
                                            key={index}
                                            isHeader
                                            className="px-4 py-3 text-xs font-medium border border-gray-100 dark:border-white/[0.05]"
                                        >
                                            {item.nameCompany}
                                        </TableCell>
                                    ))}
                            </TableRow>
                        </TableHeader>

                        {/* Table Body */}
                        <TableBody>
                            {filteredData.length > 0 ? (
                                filteredData.map((row, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        <TableCell
                                            className="px-4 py-3 text-xs border border-gray-100 dark:border-white/[0.05] bg-white dark:bg-dark-900 sticky left-0 z-10"
                                        >
                                            {row.nameCountry}
                                        </TableCell>
                                        {row.values.map((item, index) => (
                                            <TableCell
                                                key={index}
                                                className="px-4 py-3 text-xs border border-gray-100 dark:border-white/[0.05]"
                                            >
                                                {item.zone}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={zoneCountry[0]?.values.length + 1 || 1}
                                        className="px-4 py-3 text-center text-xs text-gray-500"
                                    >
                                        Không tìm thấy kết quả phù hợp.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}