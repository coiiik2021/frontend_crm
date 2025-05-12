import { useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

const PriceGasolineTable = ({ priceGasoline, setPriceGasoline }) => {
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedRow, setEditedRow] = useState({});
    const handleEdit = (index) => {
        setEditingIndex(index);
        setEditedRow({ ...priceGasoline[index] }); // Khởi tạo đầy đủ giá trị của hàng
    };
    const handleSave = () => {
        // api save 
        const updatedData = [...priceGasoline];
        updatedData[editingIndex] = { ...editedRow };
        setPriceGasoline(updatedData);
        setEditingIndex(null);
    };
    const handleInputChange = (field, value) => {
        // api update 
        setEditedRow((prev) => ({
            ...prev, // Giữ lại các giá trị hiện tại
            [field]: value, // Cập nhật trường được chỉnh sửa
        }));
    };
    const handleAddRow = () => {
        const newRow = { date: "", price: 0 };
        setPriceGasoline((prev) => [...prev, newRow]);
        setEditingIndex(priceGasoline.length); // Bắt đầu chỉnh sửa hàng mới
    };
    const handleDelete = (index) => {
        // api delete
        const updatedData = priceGasoline.filter((_, rowIndex) => rowIndex !== index);
        setPriceGasoline(updatedData);
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Bảng Giá Xăng Dầu
                </h2>
                <button
                    onClick={handleAddRow}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    Thêm dữ liệu mới
                </button>
            </div>
            <Table className="w-full border border-gray-200 rounded-lg shadow-md">
                <TableHeader className="bg-gray-100 dark:bg-gray-700">
                    <TableRow>
                        <TableCell
                            isHeader
                            className="px-4 py-3 text-sm font-semibold text-center text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                        >
                            Các ngày hiệu lực
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-4 py-3 text-sm font-semibold text-center text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                        >
                            Phụ phí
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-4 py-3 text-sm font-semibold text-center text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                        >
                            Hành động
                        </TableCell>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {priceGasoline?.map((row, rowIndex) => (
                        <TableRow
                            key={rowIndex}
                            className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                            <TableCell
                                className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                            >
                                {editingIndex === rowIndex ? (
                                    <input
                                        type="date"
                                        value={editedRow.date}
                                        onChange={(e) => handleInputChange("date", e.target.value)}
                                        className="px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    row.date
                                )}
                            </TableCell>
                            <TableCell
                                className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                            >
                                {editingIndex === rowIndex ? (
                                    <input
                                        type="number"
                                        value={editedRow.price}
                                        onChange={(e) => handleInputChange("price", e.target.value)}
                                        className="px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    row.price.toLocaleString("en-US")
                                )}
                            </TableCell>
                            <TableCell
                                className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                            >
                                {editingIndex === rowIndex ? (
                                    <button
                                        onClick={handleSave}
                                        className="px-3 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                                    >
                                        Lưu
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleEdit(rowIndex)}
                                        className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    >
                                        Chỉnh sửa
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(rowIndex)}
                                    className="ml-2 px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                                >
                                    Xóa
                                </button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default PriceGasolineTable;