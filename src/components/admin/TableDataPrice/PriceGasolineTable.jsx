import { useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { DeletePriceGasonline, PostPriceGasoline } from "../../../service/api.admin.service";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import CSS của React DatePicker

const PriceGasolineTable = ({ priceGasoline, setPriceGasoline, name }) => {
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedRow, setEditedRow] = useState({});

    const handleEdit = (index) => {
        setEditingIndex(index);
        setEditedRow({ ...priceGasoline[index] });
    };

    const handleSave = async () => {
        const updatedData = [...priceGasoline];
        updatedData[editingIndex] = { ...editedRow };
        setPriceGasoline(updatedData);
        setEditingIndex(null);

        const data = {
            name: name,
            date: editedRow.date,
            price: editedRow.price,
        };
        console.log("data", data);
        await PostPriceGasoline(data);
    };

    const handleInputChange = (field, value) => {
        setEditedRow((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleAddRow = () => {
        const newRow = { date: "", price: 0 };
        setPriceGasoline((prev) => [...prev, newRow]);
        setEditingIndex(priceGasoline.length); // Bắt đầu chỉnh sửa hàng mới
    };

    const handleDelete = async (index) => {
        await DeletePriceGasonline(priceGasoline[index].id);
        const updatedData = priceGasoline.filter((_, rowIndex) => rowIndex !== index);
        console.log(priceGasoline[index]);
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
                                    <DatePicker
                                        selected={
                                            editedRow.date
                                                ? new Date(
                                                    editedRow.date.split("/").reverse().join("-")
                                                )
                                                : null
                                        }
                                        onChange={(date) => {
                                            const formattedDate = date
                                                ? `${String(date.getDate()).padStart(2, "0")}/${String(
                                                    date.getMonth() + 1
                                                ).padStart(2, "0")}/${date.getFullYear()}`
                                                : "";
                                            handleInputChange("date", formattedDate);
                                        }}
                                        dateFormat="dd/MM/yyyy"
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
                                        onClick={async () => await handleSave()}
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
                                    onClick={async () => await handleDelete(rowIndex)}
                                    className="ml-2 px-3 py-1 te xt-sm text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
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