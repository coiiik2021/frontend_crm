import { useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { DeletePriceGasonline, PostPriceGasoline, PutPriceGasoline } from "../../../service/api.admin.service";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Modal } from "../ui/modal";
import { CalenderIcon } from "../../../icons";
import Notification from "../ui/notification/Notfication";
import { useLoading } from "../../../hooks/useLoading";
import { Spin } from "antd";

const PriceGasolineTable = ({ priceGasoline, setPriceGasoline, name }) => {
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedRow, setEditedRow] = useState({});
    const [isCreating, setIsCreating] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [rowToDeleteIndex, setRowToDeleteIndex] = useState(null);
    const { loading, withLoading } = useLoading();

    // Thêm state cho thông báo
    const [notification, setNotification] = useState({
        show: false,
        type: "",
        message: "",
    });

    // Hàm hiển thị thông báo
    const showNotification = (type, message) => {
        setNotification({
            show: true,
            type,
            message,
        });

        // Tự động ẩn thông báo sau 3 giây
        setTimeout(() => {
            setNotification({ show: false, type: "", message: "" });
        }, 3000);
    };

    // Chuyển đổi định dạng ngày từ dd/MM/yyyy sang yyyy-MM-dd (định dạng ISO cho LocalDate trong Java)
    const formatDateForBackend = (dateString) => {
        if (!dateString) return "";

        // Nếu đã đúng định dạng yyyy-MM-dd thì giữ nguyên
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }

        // Nếu định dạng là dd/MM/yyyy
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
            const [day, month, year] = dateString.split('/');
            return `${year}-${month}-${day}`;
        }

        // Xử lý các trường hợp khác
        try {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            }
        } catch (error) {
            console.error("Error formatting date for backend:", error);
        }

        return dateString;
    };

    // Chuyển đổi định dạng ngày từ yyyy-MM-dd sang dd/MM/yyyy (định dạng hiển thị)
    const formatDisplayDate = (dateString) => {
        if (!dateString) return "";

        // Nếu đã đúng định dạng dd/MM/yyyy thì giữ nguyên
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
            return dateString;
        }

        // Nếu định dạng là yyyy-MM-dd
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        }

        // Xử lý các định dạng khác
        try {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
            }
        } catch (error) {
            console.error("Error formatting display date:", error);
        }

        return dateString;
    };

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
        await withLoading(
            async () => {
                // Kiểm tra dữ liệu đầu vào
                if (!editedRow.date) {
                    throw new Error("Vui lòng chọn ngày hiệu lực");
                }

                if (!editedRow.price || isNaN(editedRow.price) || editedRow.price <= 0) {
                    throw new Error("Vui lòng nhập giá trị phụ phí hợp lệ");
                }

                const updatedData = [...priceGasoline];
                updatedData[editingIndex] = { ...editedRow };

                const data = {
                    id: editedRow.id || null,
                    name: name,
                    date: formatDateForBackend(editedRow.date),
                    price: editedRow.price,
                };

                let response;
                if (isCreating) {
                    console.log("Creating new data:", data);
                    response = await PostPriceGasoline(data);
                    if (response) {
                        showNotification("success", "Thêm dữ liệu thành công");
                        // Cập nhật ID từ response nếu có
                        if (response.id) {
                            updatedData[editingIndex].id = response.id;
                        }
                    } else {
                        showNotification("error", "Thêm dữ liệu thất bại");
                        return;
                    }
                } else {
                    console.log("Updating existing data:", data);
                    response = await PutPriceGasoline(data);
                    if (response) {
                        showNotification("success", "Cập nhật dữ liệu thành công");
                    } else {
                        showNotification("error", "Cập nhật dữ liệu thất bại");
                        return;
                    }
                }

                // Cập nhật state chỉ khi API thành công
                setPriceGasoline(updatedData);
                setEditingIndex(null);
                setIsCreating(false);
            },
            isCreating ? "Thêm dữ liệu thành công" : "Cập nhật dữ liệu thành công",
            isCreating ? "Thêm dữ liệu thất bại" : "Cập nhật dữ liệu thất bại"
        );
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

    const handleDeleteClick = (index) => {
        setRowToDeleteIndex(index);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (rowToDeleteIndex === null) return;

        await withLoading(
            async () => {
                const response = await DeletePriceGasonline(priceGasoline[rowToDeleteIndex].id);
                if (response) {
                    const updatedData = priceGasoline.filter((_, rowIndex) => rowIndex !== rowToDeleteIndex);
                    setPriceGasoline(updatedData);
                    showNotification("success", "Xóa dữ liệu thành công");
                } else {
                    showNotification("error", "Xóa dữ liệu thất bại");
                }
            },
            "Xóa dữ liệu thành công",
            "Xóa dữ liệu thất bại"
        );

        setDeleteConfirmOpen(false);
        setRowToDeleteIndex(null);
    };

    const cancelDelete = () => {
        setDeleteConfirmOpen(false);
        setRowToDeleteIndex(null);
    };

    if (loading) {
        return <Spin size="large" />;
    }

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md relative">
            {/* Hiển thị thông báo */}
            {notification.show && (
                <div className="fixed top-30 right-5 z-50">
                    <Notification
                        variant={notification.type}
                        title={notification.type === "success" ? "Thành công!" : "Lỗi!"}
                        description={notification.message}
                    />
                </div>
            )}

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
                    <div className="flex items-center justify-center h-64 top-5">
                        <p className="text-gray-500">Không có dữ liệu nào để hiển thị.</p>
                    </div>)
                    :
                    (
                        <Table className="w-full border border-gray-200 rounded-lg shadow-md mt-[100px]">
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
                                                <div className="relative">
                                                    <DatePicker
                                                        selected={
                                                            editedRow.date
                                                                ? new Date(formatDateForBackend(editedRow.date).replace(/-/g, '/'))
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
                                                        className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                        placeholderText="Chọn ngày"
                                                        customInput={
                                                            <input
                                                                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                            />
                                                        }
                                                    />
                                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
                                                        <CalenderIcon className="size-5" />
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center">
                                                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md font-medium dark:bg-blue-900/30 dark:text-blue-300">
                                                        {formatDisplayDate(row.date)}
                                                    </span>
                                                </div>
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
                                                    className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                />
                                            ) : (
                                                <span className="font-medium">
                                                    {row.price.toLocaleString("en-US")}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell
                                            className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                                        >
                                            {editingIndex === rowIndex ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleSave}
                                                        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                                                    >
                                                        Lưu
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingIndex(null);
                                                            setIsCreating(false);
                                                        }}
                                                        className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(rowIndex)}
                                                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(rowIndex)}
                                                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            )}
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
                            <div className="w-16 h-16 mb-4 rounded-full bg-red-100 flex items-center justify-center dark:bg-red-900/30">
                                <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </div>
                            <h3 className="mb-2 text-xl font-medium text-gray-900 dark:text-white">Xác nhận xóa</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Bạn có chắc chắn muốn xóa dữ liệu này không? Hành động này không thể hoàn tác.
                            </p>
                            <div className="flex mt-6 space-x-3">
                                <button
                                    onClick={cancelDelete}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PriceGasolineTable;
