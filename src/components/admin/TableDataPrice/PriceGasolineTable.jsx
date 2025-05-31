import { useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { DeletePriceGasonline, PostPriceGasoline, PutPriceGasoline } from "../../../service/api.admin.service";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Modal } from "../ui/modal";

const PriceGasolineTable = ({ priceGasoline, setPriceGasoline, name }) => {
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedRow, setEditedRow] = useState({});
    const [isCreating, setIsCreating] = useState(false);
    // Thêm state cho modal xác nhận xóa
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [rowToDeleteIndex, setRowToDeleteIndex] = useState(null);


    const handleEdit = (index) => {
        setEditingIndex(index);
        setEditedRow({
            date: priceGasoline[index]?.date || "",
            price: priceGasoline[index]?.price || 0,
            id: priceGasoline[index]?.id || null,
        });
        console.log(priceGasoline[index]);
    };

    const handleSave = async () => {
        const updatedData = [...priceGasoline];
        updatedData[editingIndex] = { ...editedRow };
        setPriceGasoline(updatedData);
        setEditingIndex(null);

        const data = {
            id: editedRow.id || null,
            name: name,
            date: editedRow.date,
            price: editedRow.price,
        };

        if (isCreating) {
            console.log("Creating new data:", data);
            await PostPriceGasoline(data);
        } else {
            console.log("Updating existing data:", data);
            await PutPriceGasoline(data);
        }

        setIsCreating(false);
    };

    const handleInputChange = (field, value) => {
        const sanitizedValue = field === "price" ? value.replace(/^0+/, "") : value;

        setEditedRow((prev) => ({
            ...prev,
            [field]: sanitizedValue,
        }));
    };

    const handleAddRow = () => {
        const newRow = { date: "", price: 0 };
        setPriceGasoline((prev) => [...prev, newRow]);
        setEditingIndex(priceGasoline.length);
        setEditedRow(newRow);
        setIsCreating(true);
    };

    // Thay đổi hàm handleDelete để mở modal xác nhận
    const handleDeleteClick = (index) => {
        setRowToDeleteIndex(index);
        setDeleteConfirmOpen(true);
    };

    // Hàm xử lý khi người dùng xác nhận xóa
    const confirmDelete = async () => {
        if (rowToDeleteIndex === null) return;

        await DeletePriceGasonline(priceGasoline[rowToDeleteIndex].id);
        const updatedData = priceGasoline.filter((_, rowIndex) => rowIndex !== rowToDeleteIndex);
        console.log(priceGasoline[rowToDeleteIndex]);
        setPriceGasoline(updatedData);

        // Đóng modal xác nhận
        setDeleteConfirmOpen(false);
        setRowToDeleteIndex(null);
    };

    // Hàm hủy xóa
    const cancelDelete = () => {
        setDeleteConfirmOpen(false);
        setRowToDeleteIndex(null);
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
            {
                priceGasoline?.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-gray-500">Không có dữ liệu nào để hiển thị.</p>
                    </div>)
                    :
                    (
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
                                                    value={editedRow.price || ""}
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
                                                    className={`px-3 py-1 text-sm text-white ${isCreating ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"
                                                        } rounded focus:outline-none focus:ring-2 ${isCreating ? "focus:ring-blue-400" : "focus:ring-green-400"
                                                        }`}
                                                >
                                                    {isCreating ? "Tạo mới" : "Lưu"}
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
                                                onClick={() => handleDeleteClick(rowIndex)}
                                                className="ml-2 px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                                            >
                                                Xóa
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )
            }

            {/* Modal xác nhận xóa */}
            <Modal
                isOpen={deleteConfirmOpen}
                onClose={cancelDelete}
                className="max-w-[400px] mx-auto p-0 rounded-3xl bg-white shadow-lg dark:bg-gray-900"
            >
                <div className="w-full">
                    <div className="p-6">
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-xl font-medium text-gray-900 dark:text-white">Xác nhận xóa</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Bạn có chắc chắn muốn xóa mục này không? Hành động này không thể hoàn tác.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-center space-x-3">
                        <button
                            onClick={cancelDelete}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800"
                        >
                            Xóa
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PriceGasolineTable;
