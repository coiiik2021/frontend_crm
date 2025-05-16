"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import PriceNetTable from "../../TableDataPrice/PriceNetTable";
import PriceGasolineTable from "../../TableDataPrice/PriceGasolineTable";
import priceGasOline from "../../../../data/priceGasoline.json";
import { DeleteServiceCompany, GetConstNet, GetNameService, GetPriceAllGasoline, GetPriceNet, PostNameService, PostPriceNet } from "../../../../service/api.admin.service";
import Button from "../../../../elements/Button";
import { useModal } from "../../../../hooks/useModal";
import { Modal } from "../../ui/modal"; // Sửa đường dẫn import Modal
import Label from "../../form/Label";
import Input from "../../form/input/InputField";


export default function ContentTable() {
    const [dataByDate, setDataByDate] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [tableType, setTableType] = useState("");
    const [priceGasoline, setPriceGasoline] = useState({});
    const [isPriceNet, setIsPriceNet] = useState(true);
    const [isImported, setIsImported] = useState(false);

    const [newNameService, setNewNameService] = useState("");

    const [serviceCompany, setServiceCompany] = useState([]);

    const [zone, setZone] = useState([]);

    const [constNet, setConstNet] = useState({});

    const nameHang = "ups";


    useEffect(() => {
        const fetchData = async () => {
            try {
                const dataGasOline = await GetPriceAllGasoline(nameHang);
                setPriceGasoline(dataGasOline);

                const dataServiceCompany = await GetNameService(nameHang);
                if (dataServiceCompany && Array.isArray(dataServiceCompany.nameService) && dataServiceCompany.nameService.length > 0) {
                    setServiceCompany(dataServiceCompany.nameService);

                    const firstService = dataServiceCompany.nameService[0];
                    setTableType(firstService);

                    const dataNet = await GetPriceNet(nameHang, firstService);
                    if (dataNet && Object.keys(dataNet).length > 0) {
                        setDataByDate(dataNet);

                        const firstDate = Object.keys(dataNet)[0];
                        setSelectedDate(firstDate);
                    }

                    const dataConstNet = await GetConstNet(nameHang + firstService);
                    setConstNet(dataConstNet);
                } else {
                    console.warn("No services found in GetNameService");
                    setServiceCompany([]);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const handleCreateService = async () => {
        const data = {
            name: nameHang,
            nameService: newNameService,
        };

        await PostNameService(data);

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
        });
    };

    const handleTableTypeChange = async (type) => {
        setTableType(type);

        const data = await GetPriceNet(nameHang, type);
        console.log("Data from API:", data);
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

            console.log("Headers (Zone):", headers.slice(1)); // Kiểm tra danh sách zone
            console.log("Formatted Data:", formattedData); // Kiểm tra dữ liệu đã định dạng
        };
        reader.readAsArrayBuffer(file);
    };

    const { isOpen, openModal, closeModal } = useModal();
    const handleSave = () => {
        // Handle save logic here
        console.log("Saving changes...");
        closeModal();
    };

    const handleSaveData = async () => {
        console.log("Saving data:", dataByDate);
        console.log("Table type:", tableType);
        await PostPriceNet(nameHang, tableType, dataByDate);
        console.log("Dữ liệu đã được lưu:", dataByDate);
        alert("Thông tin đã được lưu thành công!");
        setIsImported(false);
    };

    return (
        <div className="overflow-hidden bg-white dark:bg-white/[0.03] rounded-xl">
            <div className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
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

                    {isPriceNet && (
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
                                {serviceCompany?.map((name) => (
                                    <option key={name} value={name}>
                                        {name}
                                    </option>
                                ))}

                            </select>
                        </>
                    )}
                </div>

                {/* Nút Thêm Dịch Vụ và Import Excel */}
                {isPriceNet &&
                    <div className="flex items-center gap-4 ml-auto">
                        <Button
                            type="button"
                            className="px-4 py-2 text-white bg-blue-500 rounded cursor-pointer hover:bg-blue-600"
                            onClick={openModal}
                        >
                            Thêm dịch vụ
                        </Button>


                        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
                            <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
                                <div className="px-2 pr-14">
                                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                                        Thêm dịch vụ
                                    </h4>

                                </div>
                                <form className="flex flex-col">
                                    <div className="px-2 overflow-y-auto custom-scrollbar">
                                        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                            <div>
                                                <Label>Tên hãng</Label>
                                                <Input type="text" value={nameHang} disabled />
                                            </div>

                                            <div>
                                                <Label>Tên dịch vụ</Label>
                                                <Input type="text" value={newNameService} onChange={(e) => setNewNameService(e.target.value)} />
                                            </div>


                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                                        <Button size="sm" variant="outline" onClick={closeModal}>
                                            Close
                                        </Button>
                                        <Button size="sm" onClick={
                                            async () => {
                                                await handleCreateService();
                                                closeModal();
                                            }
                                        }>
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </Modal>

                        <Button
                            type="button"
                            className="px-4 py-2 text-white bg-blue-500 rounded cursor-pointer hover:bg-blue-600"
                            onClick={async () => {
                                await DeleteServiceCompany(tableType);
                                serviceCompany.filter((item) => item !== tableType);
                                setTableType(serviceCompany[0]);
                                handleTableTypeChange(serviceCompany[0]);
                            }}
                        >
                            Xóa
                        </Button>
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
                        {isImported && (
                            <button
                                onClick={handleSaveData}
                                className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
                            >
                                Lưu thông tin
                            </button>
                        )}
                    </div>
                }

            </div>
            <div className="max-w-full overflow-x-auto custom-scrollbar">
                {isPriceNet ? (

                    <PriceNetTable
                        dataByDate={dataByDate}
                        selectedDate={selectedDate}
                        constNet={constNet}
                        setConstNet={setConstNet}
                    />

                ) : (
                    <PriceGasolineTable
                        priceGasoline={priceGasoline}
                        setPriceGasoline={setPriceGasoline}
                        name={nameHang}
                    />
                )}
            </div>
        </div>
    );
}
