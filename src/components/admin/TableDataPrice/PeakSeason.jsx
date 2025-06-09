import { GetAllByServiceCompany, DeletePeakSeason } from "../../../service/api.admin.service";
import { useEffect, useState, useRef } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Modal } from "../ui/modal";

const PeakSeason = ({ nameHang }) => {
    const [zoneCompany, setZoneCompany] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [peakSeasons, setPeakSeasons] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        startDate: new Date(),
        endDate: new Date(),
        zoneValues: {}
    });

    // Thêm state cho popup xác nhận xóa
    const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null);
    const confirmPopupRef = useRef(null);

    // Hàm xử lý khi click nút xóa
    const handleDeleteClick = (index) => {
        setConfirmDeleteIndex(index);
    };

    // Hàm xử lý khi xác nhận xóa
    const confirmDelete = async (index) => {
        try {
            const seasonToDelete = peakSeasons[index];

            // Nếu có ID, gọi API xóa
            if (seasonToDelete.id) {
                await DeletePeakSeason(seasonToDelete.id);
            }

            // Cập nhật state
            const updatedSeasons = [...peakSeasons];
            updatedSeasons.splice(index, 1);
            setPeakSeasons(updatedSeasons);

            // Đóng popup xác nhận
            setConfirmDeleteIndex(null);
        } catch (error) {
            console.error("Lỗi khi xóa Peak Season:", error);
            alert("Có lỗi xảy ra khi xóa Peak Season");
        }
    };

    // Hàm hủy xóa
    const cancelDelete = () => {
        setConfirmDeleteIndex(null);
    };

    // Xử lý click bên ngoài để đóng popup
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (confirmPopupRef.current && !confirmPopupRef.current.contains(event.target)) {
                setConfirmDeleteIndex(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const dataResponse = await GetAllByServiceCompany(nameHang);
                console.log("dataResponse", dataResponse);
                if (dataResponse) {
                    setZoneCompany(dataResponse);

                    // Initialize zoneValues with "0" values for each zone
                    const initialZoneValues = {};
                    dataResponse.forEach(zone => {
                        initialZoneValues[zone] = "0";
                    });
                    setFormData(prev => ({
                        ...prev,
                        zoneValues: initialZoneValues
                    }));
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [nameHang]);

    const handleOpenModal = (index = null) => {
        if (index !== null) {
            // Edit existing peak season
            const peakSeason = peakSeasons[index];

            // Chuyển đổi từ chuỗi số sang Date
            const parseStringToDate = (dateString) => {
                if (!dateString) return new Date();

                // Giả sử dateString có định dạng "DDMMYYYY"
                const day = parseInt(dateString.substring(0, 2));
                const month = parseInt(dateString.substring(2, 4)) - 1; // Tháng trong JS bắt đầu từ 0
                const year = parseInt(dateString.substring(4, 8));

                return new Date(year, month, day);
            };

            setFormData({
                startDate: typeof peakSeason.startDate === 'string' ? parseStringToDate(peakSeason.startDate) : new Date(),
                endDate: typeof peakSeason.endDate === 'string' ? parseStringToDate(peakSeason.endDate) : new Date(),
                zoneValues: { ...peakSeason.zoneValues }
            });
            setEditingIndex(index);
        } else {
            // Add new peak season
            const initialZoneValues = {};
            zoneCompany.forEach(zone => {
                initialZoneValues[zone] = "0";
            });
            setFormData({
                startDate: new Date(),
                endDate: new Date(),
                zoneValues: initialZoneValues
            });
            setEditingIndex(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleInputChange = (zone, value) => {
        // Nếu giá trị rỗng, sử dụng "0"
        const newValue = value === "" ? "0" : value;

        setFormData(prev => ({
            ...prev,
            zoneValues: {
                ...prev.zoneValues,
                [zone]: newValue
            }
        }));
    };

    const handleSave = () => {
        // Chuyển đổi ngày tháng sang định dạng số
        const formatDateToNumber = (date) => {
            const d = new Date(date);
            const day = d.getDate().toString().padStart(2, '0');
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const year = d.getFullYear();
            return day + month + year; // Ví dụ: 09062025
        };

        const newPeakSeason = {
            nameService: nameHang,
            startDate: formatDateToNumber(formData.startDate),
            endDate: formatDateToNumber(formData.endDate),
            zoneValues: formData.zoneValues
        };

        console.log("newPeakSeason", newPeakSeason);

        if (editingIndex !== null) {
            // Update existing peak season
            const updatedPeakSeasons = [...peakSeasons];
            updatedPeakSeasons[editingIndex] = newPeakSeason;
            setPeakSeasons(updatedPeakSeasons);
        } else {
            // Add new peak season
            setPeakSeasons([...peakSeasons, newPeakSeason]);
        }

        // Close modal
        setIsModalOpen(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";

        // Nếu dateString là chuỗi số (DDMMYYYY)
        if (typeof dateString === 'string' && dateString.length === 8) {
            const day = dateString.substring(0, 2);
            const month = dateString.substring(2, 4);
            const year = dateString.substring(4, 8);
            return `${day}/${month}/${year}`;
        }

        // Nếu dateString là Date object
        if (dateString instanceof Date) {
            const d = dateString;
            const day = d.getDate().toString().padStart(2, '0');
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        }

        return dateString;
    };

    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Bảng Peak Season</h3>
                    <button
                        onClick={() => handleOpenModal()}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors">
                        Thêm Peak Season mới
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center py-4">Đang tải dữ liệu...</div>
                ) : (
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-gray-200 rounded-lg shadow-md">
                        <Table className="min-w-full">
                            <TableHeader className="border-t border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell
                                        isHeader
                                        className="px-4 py-3 text-xs font-medium border border-gray-100 dark:border-white/[0.05]"
                                    >
                                        Ngày bắt đầu
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-4 py-3 text-xs font-medium border border-gray-100 dark:border-white/[0.05]"
                                    >
                                        Ngày kết thúc
                                    </TableCell>
                                    {zoneCompany.map((zone, index) => (
                                        <TableCell
                                            key={index}
                                            isHeader
                                            className="px-4 py-3 text-xs font-medium border border-gray-100 dark:border-white/[0.05]"
                                        >
                                            {zone}
                                        </TableCell>
                                    ))}
                                    <TableCell
                                        isHeader
                                        className="px-4 py-3 text-xs font-medium border border-gray-100 dark:border-white/[0.05]"
                                    >
                                        Thao tác
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {peakSeasons.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={zoneCompany.length + 3}
                                            className="px-4 py-3 text-xs text-center border border-gray-100 dark:border-white/[0.05]"
                                        >
                                            Chưa có dữ liệu Peak Season
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    peakSeasons.map((season, seasonIndex) => (
                                        <TableRow key={seasonIndex}>
                                            <TableCell className="px-4 py-3 text-xs border border-gray-100 dark:border-white/[0.05]">
                                                {formatDate(season.startDate)}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-xs border border-gray-100 dark:border-white/[0.05]">
                                                {formatDate(season.endDate)}
                                            </TableCell>
                                            {zoneCompany.map((zone, zoneIndex) => (
                                                <TableCell
                                                    key={zoneIndex}
                                                    className="px-4 py-3 text-xs border border-gray-100 dark:border-white/[0.05]"
                                                >
                                                    {season.zoneValues[zone] || "0"}
                                                </TableCell>
                                            ))}
                                            <TableCell className="px-4 py-3 text-xs border border-gray-100 dark:border-white/[0.05]">
                                                <div className="flex items-center space-x-2 relative">
                                                    <button
                                                        onClick={() => handleOpenModal(seasonIndex)}
                                                        className="px-2 py-1 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600 transition-colors"
                                                    >
                                                        Sửa
                                                    </button>
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => handleDeleteClick(seasonIndex)}
                                                            className="px-2 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600 transition-colors"
                                                        >
                                                            Xóa
                                                        </button>

                                                        {/* Popup xác nhận xóa */}
                                                        {confirmDeleteIndex === seasonIndex && (
                                                            <div
                                                                ref={confirmPopupRef}
                                                                className="absolute right-0 top-8 z-10 bg-white shadow-lg rounded-md p-2 border border-gray-200 w-48"
                                                            >
                                                                <p className="text-xs text-gray-700 mb-2">Bạn có chắc chắn muốn xóa?</p>
                                                                <div className="flex justify-end space-x-2">
                                                                    <button
                                                                        onClick={cancelDelete}
                                                                        className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                                                                    >
                                                                        Hủy
                                                                    </button>
                                                                    <button
                                                                        onClick={() => confirmDelete(seasonIndex)}
                                                                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                                                    >
                                                                        Xóa
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Modal for adding/editing peak season */}
            {isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={editingIndex !== null ? "Chỉnh sửa Peak Season" : "Thêm Peak Season mới"}
                >
                    <div className="p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
                                <DatePicker
                                    selected={formData.startDate}
                                    onChange={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                                    dateFormat="dd/MM/yyyy"
                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
                                <DatePicker
                                    selected={formData.endDate}
                                    onChange={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                                    dateFormat="dd/MM/yyyy"
                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <h4 className="font-medium mb-2">Giá theo Zone</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {zoneCompany.map((zone, index) => (
                                    <div key={index}>
                                        <label className="block text-sm font-medium mb-1">Zone {zone}</label>
                                        <input
                                            type="number"
                                            value={formData.zoneValues[zone] || ""}
                                            onChange={(e) => handleInputChange(zone, e.target.value)}
                                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Nhập giá"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
                            >
                                {editingIndex !== null ? "Cập nhật" : "Thêm mới"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default PeakSeason;
