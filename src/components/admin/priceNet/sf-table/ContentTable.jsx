"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import PriceNetTable from "../../TableDataPrice/PriceNetTable";
import PriceGasolineTable from "../../TableDataPrice/PriceGasolineTable";
import { DeleteServiceCompany, GetConstNet, GetNameService, GetPriceAllGasoline, GetPriceNet, GetShipperServiceCompany, PostNameService, PostPriceNet, PutService } from "../../../../service/api.admin.service";
import Button from "../../../../elements/Button";
import { useModal } from "../../../../hooks/useModal";
import { Modal } from "../../ui/modal";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import OverSizeTable from "../../TableDataPrice/OverSizeTable.jsx";
import PeakSeason from "../../TableDataPrice/PeakSeason";


export default function ContentTable({ isPriceNetPackage, setIsPriceNetPackage }) {
    // Existing states
    const [dataByDate, setDataByDate] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [tableType, setTableType] = useState("");
    const [priceGasoline, setPriceGasoline] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [isImported, setIsImported] = useState(false);
    const [newShipper, setNewShipper] = useState({});
    const [newNameService, setNewNameService] = useState("");
    const [newCurrency, setNewCurrency] = useState("VND");
    const [serviceCompany, setServiceCompany] = useState([]);
    const [zone, setZone] = useState([]);
    const [constNet, setConstNet] = useState({});

    // New states for edit functionality
    const [isEditMode, setIsEditMode] = useState(false);
    const [editShipper, setEditShipper] = useState({});
    const [editNameService, setEditNameService] = useState("");

    const nameHang = "sf";

    // Add modals for add and edit
    const { isOpen: isAddModalOpen, openModal: openAddModal, closeModal: closeAddModal } = useModal();
    const { isOpen: isEditModalOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("Đang lấy dữ liệu với isPriceNetPackage:", isPriceNetPackage);
                const dataGasOline = await GetPriceAllGasoline(nameHang);
                setPriceGasoline(dataGasOline);

                const dataServiceCompany = await GetNameService(nameHang);
                if (dataServiceCompany && Array.isArray(dataServiceCompany.nameService) && dataServiceCompany.nameService.length > 0) {
                    setServiceCompany(dataServiceCompany.nameService);

                    const firstService = dataServiceCompany.nameService[0];
                    setTableType(firstService);
                    // Đảm bảo truyền isPriceNetPackage vào đây
                    const dataNet = await GetPriceNet(nameHang, firstService, isPriceNetPackage);
                    if (dataNet) {
                        setDataByDate(dataNet);

                        const firstDate = Object.keys(dataNet)[0];
                        setSelectedDate(firstDate);
                    }

                    const dataConstNet = await GetConstNet(nameHang + firstService);
                    setConstNet(dataConstNet);
                } else {
                    console.warn("Không tìm thấy dịch vụ nào trong GetNameService");
                    setServiceCompany([]);
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
            }
        };

        fetchData();
    }, [isPriceNetPackage]); // Đảm bảo isPriceNetPackage nằm trong mảng dependencies

    const handleCreateService = async () => {
        const dataRequest = {
            name: nameHang,
            nameService: newNameService,
            currency: newCurrency,
            shipperCompany: {
                companyName: newShipper.companyName,
                address: newShipper.address,
                areaCode: newShipper.areaCode,
                country: newShipper.country,
                contactName: newShipper.contactName,
                phone: newShipper.phone,
                tax: newShipper.tax
            }
        };

        const newService = await PostNameService(dataRequest);

        setServiceCompany((prev) => {
            if (!Array.isArray(prev)) {
                console.error("serviceCompany is not an array:", prev);
                return [newNameService];
            }
            return [newNameService, ...prev];
        });
        setTableType(newNameService);

        setConstNet({
            dim: 5000,
            ppxd: 100,
            vat: 8,
            overSize: 100,
            peakSeason: 100
        });
        setDataByDate({});

        // Reset form
        setNewNameService("");
        setNewShipper({});
        closeAddModal();
    };

    const handleEditService = async () => {

        const dataRequest = {
            name: nameHang,
            nameService: tableType,
            newNameService: editNameService,
            shipperCompany: {
                companyName: editShipper.companyName,
                address: editShipper.address,
                areaCode: editShipper.areaCode,
                country: editShipper.country,
                contactName: editShipper.contactName,
                phone: editShipper.phone,
                tax: editShipper.tax
            }
        };

        await PutService(dataRequest);

        // Update service list
        setServiceCompany((prev) => {
            return prev.map(service => service === tableType ? editNameService : service);
        });

        setTableType(editNameService);
        closeEditModal();
    };

    const handleEditButtonClick = async () => {

        console.log(nameHang + " " + tableType);
        try {
            setEditNameService(tableType);

            const dataShipper = await GetShipperServiceCompany(nameHang, tableType);

            setEditShipper(dataShipper);

            openEditModal();

            // Sau đó lấy dữ liệu chi tiết (không chờ đợi)
            GetNameService(nameHang, tableType)
                .then(serviceDetails => {
                    console.log("Service details:", serviceDetails);
                    if (serviceDetails && serviceDetails.shipperCompany) {
                        setEditShipper(serviceDetails.shipperCompany);
                    }
                })
                .catch(error => {
                    console.error("Error fetching service details:", error);
                });
        } catch (error) {
            console.error("Error in edit button click:", error);
        }
    };

    const handleTableTypeChange = async (type) => {
        setTableType(type);

        // Thêm isPriceNetPackage vào cuộc gọi API
        const data = await GetPriceNet(nameHang, type, isPriceNetPackage);
        console.log("Dữ liệu từ API:", data);
        setDataByDate(data);
        const firstDate = Object.keys(data)[0];
        setSelectedDate(firstDate);

        const dataConstNet = await GetConstNet(nameHang + type);
        setConstNet(dataConstNet);
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
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            if (jsonData.length < 1) {
                alert("File Excel không chứa dữ liệu hợp lệ.");
                return;
            }

            const headers = jsonData[0];
            setZone(headers.slice(1));

            const now = new Date();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const year = now.getFullYear();
            const formattedDate = `${month}/${day}/${year}`;

            const formattedData = jsonData.slice(1).map((row) => ({
                weight: row[0]?.toString(),
                values: headers.slice(1).map((zone, index) => ({
                    zone: zone,
                    price: Math.trunc(row[index + 1] || 0),
                })),
            }));

            setDataByDate((prevData) => ({
                ...prevData,
                [formattedDate]: formattedData,
            }));
            setSelectedDate(formattedDate);
            setIsImported(true);
        };
        reader.readAsArrayBuffer(file);
    };

    const handleSaveData = async () => {
        await PostPriceNet(nameHang, tableType, dataByDate, isPriceNetPackage);
        alert("Thông tin đã được lưu thành công!");
        setIsImported(false);
    };

    return (
        <div className="overflow-hidden bg-white dark:bg-white/[0.03] rounded-xl shadow-lg">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                {/* Tabs and controls - responsive layout */}
                <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:justify-between lg:items-center">
                    {/* Tabs section */}
                    <div className="flex flex-wrap gap-2 sm:gap-4">
                        <button
                            onClick={() => setCurrentPage(1)}
                            className={`px-3 py-2 sm:px-4 rounded-lg font-medium transition-all ${currentPage === 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"}`}
                        >
                            Giá Net
                        </button>

                        <button
                            onClick={() => setCurrentPage(2)}
                            className={`px-3 py-2 sm:px-4 rounded-lg font-medium transition-all ${currentPage === 2 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"}`}
                        >
                            Giá xăng dầu
                        </button>

                        <button
                            onClick={() => setCurrentPage(3)}
                            className={`px-3 py-2 sm:px-4 rounded-lg font-medium transition-all ${currentPage === 3 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"}`}
                        >
                            Phụ phí quá khổ
                        </button>

                        <button
                            onClick={() => setCurrentPage(4)}
                            className={`px-3 py-2 sm:px-4 rounded-lg font-medium transition-all ${currentPage === 4 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"}`}
                        >
                            Phụ phí mùa cao điểm
                        </button>

                        {currentPage === 1 && (
                            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                                <select
                                    value={selectedDate || ""}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                                >
                                    <option value="" disabled>
                                        Chọn ngày
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
                                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                                >
                                    {serviceCompany?.map((name) => (
                                        <option key={name} value={name}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Action buttons - responsive layout */}
                    {currentPage === 1 && (
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <Button
                                type="button"
                                className="px-3 py-2 text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600 transition-all text-sm sm:text-base"
                                onClick={openAddModal}
                            >
                                <span className="flex items-center gap-1 sm:gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                                    </svg>
                                    <span className="hidden sm:inline">Thêm dịch vụ</span>
                                    <span className="sm:hidden">Thêm</span>
                                </span>
                            </Button>

                            {serviceCompany.length > 0 && (
                                <>
                                    <Button
                                        type="button"
                                        className="px-3 py-2 text-white bg-yellow-500 rounded-lg shadow hover:bg-yellow-600 transition-all text-sm sm:text-base"
                                        onClick={handleEditButtonClick}
                                    >
                                        <span className="flex items-center gap-1 sm:gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
                                            </svg>
                                            <span className="hidden sm:inline">Chỉnh sửa</span>
                                            <span className="sm:hidden">Sửa</span>
                                        </span>
                                    </Button>

                                    <Button
                                        type="button"
                                        className="px-3 py-2 text-white bg-red-500 rounded-lg shadow hover:bg-red-600 transition-all text-sm sm:text-base"
                                        onClick={async () => {
                                            if (confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${tableType}"?`)) {
                                                await DeleteServiceCompany(tableType);
                                                const updatedServices = serviceCompany.filter((item) => item !== tableType);
                                                setServiceCompany(updatedServices);
                                                if (updatedServices.length > 0) {
                                                    setTableType(updatedServices[0]);
                                                    handleTableTypeChange(updatedServices[0]);
                                                } else {
                                                    setTableType("");
                                                    setDataByDate({});
                                                }
                                            }
                                        }}
                                    >
                                        <span className="flex items-center gap-1 sm:gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                                <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                                            </svg>
                                            <span className="hidden sm:inline">Xóa</span>
                                        </span>
                                    </Button>

                                    <label
                                        htmlFor="file-upload"
                                        className="px-3 py-2 text-white bg-green-500 rounded-lg shadow cursor-pointer hover:bg-green-600 transition-all flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                                            <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
                                        </svg>
                                        <span className="hidden sm:inline">Import Excel</span>
                                        <span className="sm:hidden">Import</span>
                                    </label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept=".xlsx, .xls"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </>
                            )}

                            {isImported && (
                                <button
                                    onClick={handleSaveData}
                                    className="px-3 py-2 text-white bg-indigo-500 rounded-lg shadow hover:bg-indigo-600 transition-all flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v7.293l2.646-2.647a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L7.5 9.293V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h2.5a.5.5 0 0 1 0 1H2z" />
                                    </svg>
                                    <span className="hidden sm:inline">Lưu thông tin</span>
                                    <span className="sm:hidden">Lưu</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Table content */}
            <div className="max-w-full overflow-x-auto custom-scrollbar">
                {currentPage === 1 ? (
                    <PriceNetTable
                        dataByDate={dataByDate}
                        selectedDate={selectedDate}
                        constNet={constNet}
                        setConstNet={setConstNet}
                        isPriceNetPackage={isPriceNetPackage}
                        setIsPriceNetPackage={setIsPriceNetPackage}
                    />
                ) : currentPage === 2 ? (
                    <PriceGasolineTable
                        priceGasoline={priceGasoline}
                        setPriceGasoline={setPriceGasoline}
                        name={nameHang}
                    />
                ) : currentPage === 3 ? (
                    <OverSizeTable />
                ) : (
                    <PeakSeason
                        nameHang={nameHang}
                    />
                )}
            </div>

            {/* Add Service Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={closeAddModal}
                className="max-w-[600px] m-4"
                showCloseButton={true}
            >
                <div className="relative w-full p-5 overflow-y-auto bg-white no-scrollbar rounded-xl dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
                    <div className="mb-4 border-b pb-3 border-gray-200 dark:border-gray-700">
                        <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                            Thêm dịch vụ mới
                        </h4>
                    </div>
                    <form className="flex flex-col">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Thông tin cơ bản - đặt trên cùng một hàng */}
                            <div>
                                <Label>Tên dịch vụ <span className="text-red-500">*</span></Label>
                                <Input
                                    type="text"
                                    value={newNameService}
                                    onChange={(e) => setNewNameService(e.target.value)}
                                    placeholder="Nhập tên dịch vụ"
                                />
                            </div>

                            <div>
                                <Label>Loại tiền<span className="text-red-500">*</span></Label>
                                <select
                                    value={newCurrency}
                                    onChange={(e) => setNewCurrency(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                >
                                    <option>VND</option>
                                    <option>USD</option>
                                </select>
                            </div>

                            {/* Thông tin công ty */}
                            <div>
                                <Label>Tên Công ty</Label>
                                <Input
                                    type="text"
                                    value={newShipper.companyName || ""}
                                    onChange={(e) => setNewShipper({ ...newShipper, companyName: e.target.value })}
                                    placeholder="Nhập tên công ty"
                                />
                            </div>

                            <div>
                                <Label>Số điện thoại</Label>
                                <Input
                                    type="text"
                                    value={newShipper.phone || ""}
                                    onChange={(e) => setNewShipper({ ...newShipper, phone: e.target.value })}
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <Label>Địa chỉ</Label>
                                <Input
                                    type="text"
                                    value={newShipper.address || ""}
                                    onChange={(e) => setNewShipper({ ...newShipper, address: e.target.value })}
                                    placeholder="Nhập địa chỉ"
                                />
                            </div>

                            <div>
                                <Label>Mã số thuế</Label>
                                <Input
                                    type="text"
                                    value={newShipper.tax || ""}
                                    onChange={(e) => setNewShipper({ ...newShipper, tax: e.target.value })}
                                    placeholder="Nhập mã số thuế"
                                />
                            </div>

                            <div>
                                <Label>Nước</Label>
                                <Input
                                    type="text"
                                    value={newShipper.country || ""}
                                    onChange={(e) => setNewShipper({ ...newShipper, country: e.target.value })}
                                    placeholder="Nhập nước"
                                />
                            </div>
                            <div>
                                <Label>Area Code(Town)</Label>
                                <Input
                                    type="text"
                                    value={newShipper.areaCode || ""}
                                    onChange={(e) => setNewShipper({ ...newShipper, areaCode: e.target.value })}
                                    placeholder="Nhập Area Code(Town)"
                                />
                            </div>
                            <div>
                                <Label>Người liên hệ</Label>
                                <Input
                                    type="text"
                                    value={newShipper.contactName || ""}
                                    onChange={(e) => setNewShipper({ ...newShipper, contactName: e.target.value })}
                                    placeholder="Nhập tên liên hệ"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-5 justify-end border-t pt-3 border-gray-200 dark:border-gray-700">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={closeAddModal}
                                className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleCreateService}
                                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                disabled={!newNameService}
                            >
                                Lưu thông tin
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                className="max-w-[600px] m-4"
                showCloseButton={true}
            >
                <div className="relative w-full p-5 overflow-y-auto bg-white no-scrollbar rounded-xl dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
                    <div className="mb-4 border-b pb-3 border-gray-200 dark:border-gray-700">
                        <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                            Chỉnh sửa dịch vụ
                        </h4>
                    </div>
                    <form className="flex flex-col">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Thông tin cơ bản */}
                            <div className="sm:col-span-2">
                                <Label>Tên dịch vụ <span className="text-red-500">*</span></Label>
                                <Input
                                    type="text"
                                    value={editNameService}
                                    onChange={(e) => setEditNameService(e.target.value)}
                                    placeholder="Nhập tên dịch vụ"
                                />
                            </div>





                            {/* Thông tin công ty */}
                            <div>
                                <Label>Tên Công ty</Label>
                                <Input
                                    type="text"
                                    value={editShipper.companyName || ""}
                                    onChange={(e) => setEditShipper({ ...editShipper, companyName: e.target.value })}
                                    placeholder="Nhập tên công ty"
                                />
                            </div>

                            <div>
                                <Label>Số điện thoại</Label>
                                <Input
                                    type="text"
                                    value={editShipper.phone || ""}
                                    onChange={(e) => setEditShipper({ ...editShipper, phone: e.target.value })}
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <Label>Địa chỉ</Label>
                                <Input
                                    type="text"
                                    value={editShipper.address || ""}
                                    onChange={(e) => setEditShipper({ ...editShipper, address: e.target.value })}
                                    placeholder="Nhập địa chỉ"
                                />
                            </div>

                            <div>
                                <Label>Mã số thuế</Label>
                                <Input
                                    type="text"
                                    value={editShipper.tax || ""}
                                    onChange={(e) => setEditShipper({ ...editShipper, tax: e.target.value })}
                                    placeholder="Nhập mã số thuế"
                                />
                            </div>

                            <div>
                                <Label>Nước</Label>
                                <Input
                                    type="text"
                                    value={editShipper.country || ""}
                                    onChange={(e) => setEditShipper({ ...editShipper, country: e.target.value })}
                                    placeholder="Nhập nước"
                                />
                            </div>
                            <div>
                                <Label>Area Code(Town)</Label>
                                <Input
                                    type="text"
                                    value={editShipper.areaCode || ""}
                                    onChange={(e) => setEditShipper({ ...editShipper, areaCode: e.target.value })}
                                    placeholder="Nhập Area Code(Town)"
                                />
                            </div>

                            <div>
                                <Label>Người liên hệ</Label>
                                <Input
                                    type="text"
                                    value={editShipper.contactName || ""}
                                    onChange={(e) => setEditShipper({ ...editShipper, contactName: e.target.value })}
                                    placeholder="Nhập tên liên hệ"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-5 justify-end border-t pt-3 border-gray-200 dark:border-gray-700">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={closeEditModal}
                                className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleEditService}
                                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                disabled={!editNameService}
                            >
                                Lưu thông tin
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}
