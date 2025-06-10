"use client";

import { useState, useMemo, useEffect, useRef } from "react";

import { NavLink } from "react-router";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import PaginationWithIcon from "../tables/DataTables/TableOne/PaginationWithIcon";
import { Modal } from "../ui/modal/index.js";
import { useModal } from "../../../hooks/useModal.js";
import { DeletePriceOrder, GetAllBaseUser, GetAllPriceOrder, GetPaymentDetails, PostBaseUser, PostPriceOrder, PutPriceOrder, UpdateBillAccountant, UpdatePaymentDetails } from "../../../service/api.admin.service.jsx";
import { PlusIcon, XIcon, PencilIcon, Delete } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import ExcelJS from 'exceljs';

export default function ContentTable(props) {
    const { dataBill } = props;
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortKey, setSortKey] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");
    const [searchTerm, setSearchTerm] = useState("");
    const [authorities, setAuthorities] = useState([]);

    const [priceOrders, setPriceOrders] = useState([]);
    const [billEdit, setBillEdit] = useState({});

    const formatCurrency = (amount) => {
        const num = parseFloat(String(amount).replace(/[^0-9.]/g, ''));
        if (isNaN(num)) return '0';
        return new Intl.NumberFormat('vi-VN', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    function StatusBadge({ status }) {
        const safeStatus = status ? status.toLowerCase() : '';

        const statusColors = {
            completed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
            processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
            unknown: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        };

        const colorClass = statusColors[safeStatus] || statusColors.default;

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
                {status || 'Unknown'}
            </span>
        );
    }
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = jwtDecode(token);
            setAuthorities(decoded.authorities);
        }
    }, [])

    // Icons (giả định sử dụng Heroicons hoặc similar)
    function ChevronUpIcon({ className }) {
        return (
            <svg className={className} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
        );
    }

    function ChevronDownIcon({ className }) {
        return (
            <svg className={className} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 111.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 010-1.414z" clipRule="evenodd" />
            </svg>
        );
    }

    function ArrowsUpDownIcon({ className }) {
        return (
            <svg className={className} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 111.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 010-1.414zM10 3a1 1 0 011 1v10a1 1 11-2 0V4a1 1 011-1z" clipRule="evenodd" />
            </svg>
        );
    }

    // Add this function to check if a date is today
    function isToday(dateString) {
        // Parse the input date string (format: "10:44:19 07:06:2025")
        const parts = dateString.split(' ');
        if (parts.length !== 2) return false;

        const timePart = parts[0];
        const datePart = parts[1];

        const [day, month, year] = datePart.split(':');

        // Create date object from the parsed components
        const inputDate = new Date(year, month - 1, day);

        // Get today's date with time set to 00:00:00
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Compare the dates (ignoring time)
        return inputDate.getDate() === today.getDate() &&
            inputDate.getMonth() === today.getMonth() &&
            inputDate.getFullYear() === today.getFullYear();
    }

    const filteredAndSortedData = useMemo(() => {
        return dataBill
            .filter((item) =>
                item.bill_house.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                if (sortKey === "bill_house") {
                    return sortOrder === "asc"
                        ? a.fullName.localeCompare(b.fullName)
                        : b.fullName.localeCompare(a.fullName);
                }

                if (sortKey === "total_price") {
                    const salaryA = Number.parseInt(a[sortKey]);
                    const salaryB = Number.parseInt(b[sortKey]);
                    return sortOrder === "asc" ? salaryA - salaryB : salaryB - salaryA;
                }

                return sortOrder === "asc"
                    ? String(a[sortKey]).localeCompare(String(b[sortKey]))
                    : String(b[sortKey]).localeCompare(String(a[sortKey]));
            });
    }, [dataBill, sortKey, sortOrder, searchTerm]);

    const totalItems = filteredAndSortedData.length;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    const currentData = (filteredAndSortedData.slice(startIndex, endIndex));

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortOrder("asc");
        }
    };

    const { isOpen, openModal, closeModal } = useModal();

    // Thêm state để lưu thông tin thanh toán
    const [paymentDetails, setPaymentDetails] = useState({
        cash: 0,
        banking: 0
    });

    // Hàm để lấy thông tin thanh toán từ backend
    const fetchPaymentDetails = async (billId) => {
        try {
            const response = await GetPaymentDetails(billId);
            console.log("Payment details:", response);

            // Cập nhật state với dữ liệu từ API
            setPaymentDetails({
                cash: response.priceCash || 0,
                banking: response.priceCard || 0
            });
        } catch (error) {
            console.error("Error fetching payment details:", error);
            // Nếu có lỗi, đặt giá trị mặc định
            setPaymentDetails({
                cash: 0,
                banking: 0
            });
        }
    };

    // Hàm xử lý khi người dùng bấm vào nút xem chi tiết thanh toán
    const handleViewPaymentDetails = (item) => {
        setBillEdit(item);
        fetchPaymentDetails(item.bill_house);
        setIsOpenFormPayment(true);
    };

    // Hàm xử lý khi người dùng bấm Save
    const handleUpdatePayment = async () => {
        try {


            const dataRequest = {
                bill_id: billEdit.bill_house,
                priceCash: paymentDetails.cash,
                priceCard: paymentDetails.banking
            }

            const dataResponse = await UpdatePaymentDetails(dataRequest);


            console.log("Payment updated:", dataResponse);

            // Đánh dấu dữ liệu đã thay đổi


            // Đóng modal
            setIsOpenFormPayment(false);

            // Thông báo thành công
            alert("Cập nhật thanh toán thành công!");
            window.location.reload();

        } catch (error) {
            console.error("Error updating payment:", error);
            alert("Lỗi khi cập nhật thanh toán!");
        }
    };

    // Hàm gọi API lấy dữ liệu priceOrders
    const fetchPriceOrders = async (billHouse) => {
        try {
            const response = await GetAllPriceOrder(billEdit.bill_house);

            // Sắp xếp danh sách theo ngày tạo
            const sortedOrders = sortPriceOrdersByDate(response);

            setPriceOrders(sortedOrders); // Cập nhật dữ liệu priceOrders
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu priceOrders:", error);
        }
    };

    // Gọi API khi modal mở và billEdit.bill_house thay đổi
    useEffect(() => {
        if (isOpen && billEdit.bill_house) {
            fetchPriceOrders(billEdit.bill_house);
        }
    }, [isOpen, billEdit.bill_house]);

    const handleConfirm = (order) => {
        // Xử lý xác nhận order tại đây
        console.log("Xác nhận order:", order);
        // Bạn có thể thêm logic để lưu trữ hoặc xử lý order đã xác nhận
    }

    const handleCreatePriceOrder = async (dataRequest) => {
        try {
            const dataResponse = await PostPriceOrder(dataRequest);

            setPriceOrders((prevOrders) => {
                const filteredOrders = prevOrders.filter((order) => order.id !== "");
                const updatedOrders = [...filteredOrders, dataResponse];
                setIsDataChanged(true);
                return updatedOrders;
            });
        } catch (error) {
            console.error("Lỗi khi tạo price order:", error);
        }
    };

    const handleDeletePriceOrder = async (orderId, index) => {
        try {
            await DeletePriceOrder(orderId);

            setPriceOrders((prevOrders) => {
                const updatedOrders = prevOrders.filter((_, i) => i !== index);
                setIsDataChanged(true); // Đánh dấu dữ liệu đã thay đổi
                return updatedOrders;
            });
        } catch (error) {
            console.error("Lỗi khi xóa price order:", error);
        }
    };

    const parseCustomDateTime = (dateTimeString) => {
        const [time, date] = dateTimeString.split(" ");
        const [hours, minutes, seconds] = time.split(":").map(Number);
        const [day, month, year] = date.split(":").map(Number);

        return new Date(year, month - 1, day, hours, minutes, seconds);
    };

    const sortPriceOrdersByDate = (orders) => {
        return orders.sort((a, b) => {
            const dateA = parseCustomDateTime(a.created_at);
            const dateB = parseCustomDateTime(b.created_at);
            return dateA - dateB; // Sắp xếp tăng dần (sớm nhất trước)
        });
    };



    const handleUpdatePriceOrder = async (orderId, updatedData) => {
        try {
            await PutPriceOrder(orderId, updatedData);

            setPriceOrders((prevOrders) => {
                const updatedOrders = prevOrders.map((order) =>
                    order.id === orderId ? { ...order, ...updatedData } : order
                );
                setIsDataChanged(true);
                return updatedOrders;
            });
        } catch (error) {
            console.error("Lỗi khi cập nhật price order:", error);
        }
    };

    const [isDataChanged, setIsDataChanged] = useState(false);


    const [isOpenFormPayment, setIsOpenFormPayment] = useState(false);

    // Cập nhật hàm xử lý thay đổi giá trị input
    const handlePaymentInputChange = (field, value) => {
        // Chuyển đổi giá trị thành số
        let numericValue = Number(value);

        // Nếu người dùng xóa hết và để trống, đặt giá trị là 0
        if (value === '') {
            numericValue = 0;
        }

        // Cập nhật state
        setPaymentDetails(prev => ({
            ...prev,
            [field]: numericValue
        }));
    };


    const handleUpdateStatus = async (billId, newStatus) => {
        try {
            const dataRequest = {
                bill_id: billId,
                status_payment: newStatus
            };

            await UpdateBillAccountant(dataRequest);

            // Cập nhật UI
            const updatedData = currentData.map(item => {
                if (item.bill_house === billId) {
                    return { ...item, status_payment: newStatus };
                }
                return item;
            });


            // Thông báo thành công
            alert("Cập nhật trạng thái thành công!");
            window.location.reload();
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Lỗi khi cập nhật trạng thái!");
        }
    };

    // Thêm các trạng thái có thể có
    const availableStatuses = [
        { value: "completed", label: "Hoàn thành" },
        { value: "processing", label: "Đang xử lý" },
        { value: "cancelled", label: "Đã hủy" }
    ];

    const statusPopoverRef = useRef(null);

    // Thêm state để quản lý các cột hiển thị
    const [visibleColumns, setVisibleColumns] = useState({
        house_bill: true,
        Date: true,
        bill_employee: true,
        awb: true,
        company_service: true,
        payment_bill_real: true,
        price_order: true,
        payment_bill_fake: true,
        payments_cash: true,
        payments_banking: true,
        status: true
    });

    // Thêm state để quản lý hiển thị dropdown
    const [showColumnSelector, setShowColumnSelector] = useState(false);

    // Thêm useRef để theo dõi dropdown
    const columnSelectorRef = useRef(null);
    const columnButtonRef = useRef(null);

    // Thêm useEffect để xử lý click bên ngoài
    useEffect(() => {
        function handleClickOutside(event) {
            if (showColumnSelector &&
                columnSelectorRef.current &&
                !columnSelectorRef.current.contains(event.target) &&
                columnButtonRef.current &&
                !columnButtonRef.current.contains(event.target)) {
                setShowColumnSelector(false);
            }
        }

        // Thêm event listener
        document.addEventListener("mousedown", handleClickOutside);

        // Cleanup event listener khi component unmount
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showColumnSelector]);

    const exportToExcel = async () => {
        const dataToExport = currentData;

        if (!dataToExport || dataToExport.length === 0) {
            alert('Không có dữ liệu để xuất!');
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Shipment Report');

        workbook.creator = 'Shipment Management System';
        workbook.created = new Date();

        const columnMapping = {
            house_bill: { header: 'HOUSE BILL', width: 5 },
            Date: { header: 'NGÀY TẠO', width: 15 },
            bill_employee: { header: 'BILL PHỤ', width: 15 },
            awb: { header: 'AWB', width: 15 },
            company_service: { header: 'DỊCH VỤ', width: 15 },
            payment_bill_real: { header: 'THÀNH TIỀN (TẠM TÍNH)', width: 24 },
            price_order: { header: 'TIỀN ORDER', width: 38 },
            payment_bill_fake: { header: 'THÀNH TIỀN (CHỐT)', width: 25 },
            payments_cash: { header: 'THANH TOÁN TIỀN MẶT', width: 25 },
            payments_banking: { header: 'THANH TOÁN BANKING', width: 25 },
            status: { header: 'TRẠNG THÁI', width: 15 }
        };

        const columnsToExport = Object.keys(columnMapping).filter(key =>
            key === 'house_bill' || visibleColumns[key]
        );

        worksheet.columns = columnsToExport.map(key => ({
            key: key,
            width: columnMapping[key].width,
        }));

        // Thêm tiêu đề
        const titleRow = worksheet.insertRow(1, ['BÁO CÁO SHIPMENT']);
        worksheet.mergeCells(1, 1, 1, columnsToExport.length);
        titleRow.height = 60;

        const titleCell = worksheet.getCell(1, 1);
        titleCell.font = { size: 30, bold: true, color: { argb: 'FF000000' }, name : 'Arial' };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };


        // Thêm thông tin ngày xuất
        const dateRow = worksheet.insertRow(2, [`Ngày xuất: ${new Date().toLocaleString('vi-VN')}`]);
        worksheet.mergeCells(2, 1, 2, columnsToExport.length);
        dateRow.height = 20;

        const dateCell = worksheet.getCell(2, 1);
        dateCell.font = { size: 14, italic: true };
        dateCell.alignment = { horizontal: 'center', vertical: 'middle' };

        const headerRow = worksheet.getRow(4);
        headerRow.height = 45;

        columnsToExport.forEach((key, index) => {
            const cell = headerRow.getCell(index + 1);
            cell.value = columnMapping[key].header;
            cell.font = { bold: true, color: { argb: 'FF000000' } , size: 12};
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFA6A6A7' }
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Thêm dữ liệu
        dataToExport.forEach((item, rowIndex) => {
            const rowData = {};

            columnsToExport.forEach(key => {
                switch (key) {
                    case 'house_bill':
                        rowData[key] = `EB${item.bill_house.substring(0, 5)}`;
                        break;
                    case 'Date':
                        rowData[key] = item.date_create;
                        break;
                    case 'bill_employee':
                        rowData[key] = item?.bill_employee || '';
                        break;
                    case 'awb':
                        rowData[key] = item?.awb || '';
                        break;
                    case 'company_service':
                        rowData[key] = item.company_service;
                        break;
                    case 'payment_bill_real':
                        rowData[key] = `${formatCurrency(item.total_real)} VNĐ`;
                        break;
                    case 'price_order':
                        // Xuất cả 2 giá trị: complete và process
                        rowData[key] = `Hoàn thành: ${formatCurrency(item.priceOrder.total_complete)} VNĐ | Đang xử lý: ${formatCurrency(item.priceOrder.total_process)} VNĐ`;
                        break;
                    case 'payment_bill_fake':
                        rowData[key] = `${formatCurrency(item.total_fake)} VNĐ`;
                        break;
                    case 'payments_cash':
                        rowData[key] = `${formatCurrency(item.pricePayment.payment_cash)} VNĐ`;
                        break;
                    case 'payments_banking':
                        rowData[key] = `${formatCurrency(item.pricePayment.payment_banking)} VNĐ`;
                        break;
                    case 'status':
                        // Chuyển đổi status thành text dễ hiểu
                        const statusText = {
                            'pending': 'Chờ xử lý',
                            'processing': 'Đang xử lý',
                            'completed': 'Hoàn thành',
                            'cancelled': 'Đã hủy'
                        };
                        rowData[key] = statusText[item.status_payment] || item.status_payment;
                        break;
                    default:
                        rowData[key] = item[key] || '';
                }
            });

            const dataRow = worksheet.addRow(rowData);
            dataRow.height = 35;

            // Định dạng cho từng cell trong dòng dữ liệu
            dataRow.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                    left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                    bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                    right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
                };

                if (rowIndex % 2 === 0) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF9FAFB' }
                    };
                }

                // Căn giữa cho một số cột
                if (columnsToExport[colNumber - 1] === 'Date' ||
                    columnsToExport[colNumber - 1] === 'status' ||
                    columnsToExport[colNumber - 1] === 'company_service') {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                } else if (columnsToExport[colNumber - 1].includes('payment') ||
                    columnsToExport[colNumber - 1].includes('price')) {
                    // Căn phải cho các cột tiền
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    cell.font = { bold: true };
                } else {
                    cell.alignment = { vertical: 'middle' };
                }
            });
        });

        // Thêm tổng kết ở cuối (nếu có dữ liệu số)
        if (dataToExport.length > 0) {
            // Thêm dòng trống
            worksheet.addRow([]);

            // Tính tổng các giá trị tiền
            let totalReal = 0;
            let totalFake = 0;
            let totalCash = 0;
            let totalBanking = 0;
            let totalComplete = 0;
            let totalProcess = 0;

            dataToExport.forEach(item => {
                totalReal += item.total_real || 0;
                totalFake += item.total_fake || 0;
                totalCash += item.pricePayment?.payment_cash || 0;
                totalBanking += item.pricePayment?.payment_banking || 0;
                totalComplete += item.priceOrder?.total_complete || 0;
                totalProcess += item.priceOrder?.total_process || 0;
            });

            // Thêm dòng tổng kết
            const summaryData = {};
            columnsToExport.forEach((key, index) => {
                if (index === 0) {
                    summaryData[key] = 'TỔNG CỘNG';
                } else if (key === 'payment_bill_real' && visibleColumns[key]) {
                    summaryData[key] = `${formatCurrency(totalReal)} VNĐ`;
                } else if (key === 'payment_bill_fake' && visibleColumns[key]) {
                    summaryData[key] = `${formatCurrency(totalFake)} VNĐ`;
                } else if (key === 'payments_cash' && visibleColumns[key]) {
                    summaryData[key] = `${formatCurrency(totalCash)} VNĐ`;
                } else if (key === 'payments_banking' && visibleColumns[key]) {
                    summaryData[key] = `${formatCurrency(totalBanking)} VNĐ`;
                } else if (key === 'price_order' && visibleColumns[key]) {
                    summaryData[key] = `HT: ${formatCurrency(totalComplete)} | XL: ${formatCurrency(totalProcess)} VNĐ`;
                } else {
                    summaryData[key] = '';
                }
            });

            const summaryRow = worksheet.addRow(summaryData);
            summaryRow.height = 35;


            summaryRow.eachCell((cell, colNumber) => {

                cell.font = { bold: true, size: 13 };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFDBEAFE' }
                };
                cell.border = {
                    top: { style: 'medium' },
                    left: { style: 'thin' },
                    bottom: { style: 'medium' },
                    right: { style: 'thin' }
                };

                if (colNumber === 1) {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                } else {
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                }
            });

            let mergeEndColumn = 1;
            for (let i = 1; i <= columnsToExport.length; i++) {
                // const key = columnsToExport[i - 1];
                const value = summaryRow.getCell(i).value;
                if (typeof value === 'string' && value.trim() !== 'TỔNG CỘNG' && value.trim() !== '') {
                    mergeEndColumn = i - 1;
                    break;
                }
            }
            if (mergeEndColumn < 2) {
                mergeEndColumn = columnsToExport.length;
                worksheet.spliceRows(summaryRow.number, 1)
            }

            worksheet.mergeCells(summaryRow.number, 1, summaryRow.number, mergeEndColumn);
        }


        // Xuất file
        try {
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Tạo tên file với timestamp
            const timestamp = new Date().toISOString().slice(0, 10);
            a.download = `shipment_report_${timestamp}.xlsx`;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            // Thông báo thành công
            console.log('Xuất Excel thành công!');

        } catch (error) {
            console.error('Lỗi khi xuất Excel:', error);
            alert('Có lỗi xảy ra khi xuất file Excel!');
        }
    };

    return (
        <div className="overflow-hidden bg-white dark:bg-white/[0.03] rounded-xl">

            <div className="flex flex-col gap-2 px-4 py-4 border border-b-0 border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-gray-500 dark:text-gray-400"> Show </span>
                    <div className="relative z-20 bg-transparent">
                        <select
                            className="w-full py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 bg-none shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        >
                            {[5, 8, 10].map((value) => (
                                <option
                                    key={value}
                                    value={value}
                                    className="text-gray-500 dark:bg-gray-900 dark:text-gray-400"
                                >
                                    {value}
                                </option>
                            ))}
                        </select>
                        <span className="absolute z-30 text-gray-500 -translate-y-1/2 right-2 top-1/2 dark:text-gray-400">
                            <svg
                                className="stroke-current"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165"
                                    stroke=""
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400"> entries </span>


                    {/* Thêm nút tùy chỉnh cột */}
                    <button
                        ref={columnButtonRef}
                        onClick={() => setShowColumnSelector(!showColumnSelector)}
                        className="ml-4 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Tùy chỉnh cột
                    </button>

                    <button
                        ref={columnButtonRef}
                        onClick={() => exportToExcel()}
                        className="ml-4 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-100 rounded-md hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 flex items-center transition-all duration-200"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                        >
                            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                            <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
                        </svg>
                        Xuất Excel
                    </button>



                    {/* Dropdown tùy chỉnh cột */}
                    {showColumnSelector && (
                        <div
                            ref={columnSelectorRef}
                            className="absolute z-50 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 top-16 dark:bg-gray-800 dark:border-gray-700"
                        >
                            <h3 className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Hiển thị cột</h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {Object.keys(visibleColumns).map((column) => (
                                    <div key={column} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`col-${column}`}
                                            checked={visibleColumns[column]}
                                            onChange={() => {
                                                // Nếu là house_bill thì không cho phép thay đổi
                                                if (column === "house_bill") return;

                                                setVisibleColumns({
                                                    ...visibleColumns,
                                                    [column]: !visibleColumns[column]
                                                });
                                            }}
                                            disabled={column === "house_bill"} // Disable checkbox nếu là house_bill
                                            className={`w-4 h-4 ${column === "house_bill"
                                                ? "bg-blue-600 text-blue-600 cursor-not-allowed opacity-70"
                                                : "text-blue-600 bg-gray-100"} border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600`}
                                        />
                                        <label htmlFor={`col-${column}`} className={`ml-2 text-sm ${column === "house_bill"
                                            ? "text-gray-800 font-medium dark:text-gray-200"
                                            : "text-gray-600 dark:text-gray-400"}`}>
                                            {column === "house_bill" ? "HOUSE BILL" :
                                                column === "Date" ? "NGÀY TẠO" :
                                                    column === "bill_employee" ? "BILL PHỤ" :
                                                        column === "awb" ? "AWB" :
                                                            column === "company_service" ? "DỊCH VỤ" :
                                                                column === "payment_bill_real" ? "THÀNH TIỀN (TẠM TÍNH)" :
                                                                    column === "price_order" ? "TIỀN ORDER" :
                                                                        column === "payment_bill_fake" ? "THÀNH TIỀN (CHỐT)" :
                                                                            column === "payments_cash" ? "THANH TOÁN TIỀN MẶT" :
                                                                                column === "payments_banking" ? "THANH TOÁN BANKING" :
                                                                                    column === "status" ? "TRẠNG THÁI" : column}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative">
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none left-4 top-1/2 dark:text-gray-400">
                        <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                                fill=""
                            />
                        </svg>
                    </span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search By house bill"
                        className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-11 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
                    />
                </div>
            </div>

            <div className="max-w-full overflow-x-auto custom-scrollbar">
                <div>
                    <Table className="w-full rounded-lg overflow-hidden shadow-sm">
                        <TableHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <TableRow>
                                {[
                                    { key: "house_bill", label: "HOUSE BILL" },
                                    { key: "Date", label: "Ngày tạo" },
                                    { key: "bill_employee", label: "BILL PHỤ" },
                                    { key: "awb", label: "AWB " },
                                    { key: "company_service", label: "DỊCH VỤ" },
                                    { key: "payment_bill_real", label: "Thành tiền (Tạm tính)" },
                                    { key: "price_order", label: "Tiền order" },
                                    { key: "payment_bill_fake", label: "Thành tiền (chốt)" },
                                    { key: "payments_cash", label: "Thanh toán Tiền mặt" },
                                    { key: "payments_banking", label: "Thanh toán banking" },
                                    { key: "status", label: "TRẠNG THÁI" },
                                ].filter(column => column.key === "house_bill" || visibleColumns[column.key]).map(({ key, label }) => (
                                    <TableCell
                                        key={key}
                                        isHeader
                                        className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-xs"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{label}</span>
                                            <button
                                                onClick={() => handleSort(key)}
                                                className="ml-2 text-gray-400 hover:text-brand-500 transition-colors"
                                            >
                                                {sortKey === key ? (
                                                    sortOrder === "asc" ? (
                                                        <ChevronUpIcon className="h-4 w-4 text-brand-500" />
                                                    ) : (
                                                        <ChevronDownIcon className="h-4 w-4 text-brand-500" />
                                                    )
                                                ) : (
                                                    <ArrowsUpDownIcon className="h-3 w-3" />
                                                )}
                                            </button>
                                        </div>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                            {currentData.map((item, i) => (
                                <TableRow
                                    key={i + 1}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    {/* House Bill - luôn hiển thị */}
                                    <TableCell className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <NavLink
                                                to="/profile"
                                                className="font-medium text-brand-600 dark:text-brand-400 hover:underline"
                                            >
                                                EB{item.bill_house.substring(0, 5)}
                                            </NavLink>

                                            {isToday(item.date_create) && (
                                                <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-md animate-pulse">
                                                    NEW
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Các cột khác chỉ hiển thị khi được chọn */}
                                    {visibleColumns.Date && (
                                        <TableCell className="px-6 py-4 whitespace-nowrap">
                                            {item.date_create}
                                        </TableCell>
                                    )}

                                    {visibleColumns.bill_employee && (
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                            {item?.bill_employee || "..."}
                                        </TableCell>
                                    )}

                                    {visibleColumns.awb && (
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                            {item?.awb || "..."}
                                        </TableCell>
                                    )}

                                    {visibleColumns.company_service && (
                                        <TableCell className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                                {item.company_service}
                                            </span>
                                        </TableCell>
                                    )}

                                    {visibleColumns.payment_bill_real && (
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {formatCurrency(item.total_real)} VNĐ
                                        </TableCell>
                                    )}

                                    {visibleColumns.price_order && (
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <div className="relative flex flex-col items-start space-y-2">
                                                {
                                                    (authorities.includes("ADMIN") || authorities.includes("CS") || authorities.includes("TRANSPORTER")) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                openModal();
                                                                setBillEdit(item);
                                                            }}
                                                            className="absolute top-0 right-0 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                        >
                                                            <PencilIcon className="w-5 h-5" />
                                                        </button>)
                                                }

                                                {/* Giá trị tiền order */}
                                                <div className="flex flex-col space-y-1 pt-6">
                                                    {/* Giá trị xanh */}
                                                    <div className="flex items-center space-x-2">
                                                        <span className="px-2 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-md dark:bg-green-900/50 dark:text-green-300">
                                                            {formatCurrency(item.priceOrder.total_complete)} VNĐ
                                                        </span>
                                                    </div>

                                                    {/* Giá trị đỏ */}
                                                    <div className="flex items-center space-x-2">
                                                        <span className="px-2 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-md dark:bg-red-900/50 dark:text-red-300">
                                                            {formatCurrency(item.priceOrder.total_process)} VNĐ
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                    )}

                                    {visibleColumns.payment_bill_fake && (
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {formatCurrency(item.total_fake)} VNĐ
                                        </TableCell>
                                    )}

                                    {visibleColumns.payments_cash && (
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <div className="relative flex flex-col items-start space-y-2">
                                                {/* Nút để mở modal thanh toán */}
                                                {
                                                    (authorities.includes("ADMIN") || authorities.includes("CS") || authorities.includes("TRANSPORTER")) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleViewPaymentDetails(item)}
                                                            className="absolute top-0 right-0 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                        >
                                                            <PencilIcon className="w-5 h-5" />
                                                        </button>)
                                                }

                                                {/* Giá trị tiền order */}
                                                <div className="flex flex-col space-y-1 pt-6">
                                                    {/* Giá trị xanh */}
                                                    <div className="flex items-center space-x-2">
                                                        <span className="px-2 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-md dark:bg-green-900/50 dark:text-green-300">
                                                            {formatCurrency(item.pricePayment.payment_cash)} VNĐ
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                    )}

                                    {visibleColumns.payments_banking && (
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <div className="relative flex flex-col items-start space-y-2">
                                                {/* Nút để mở modal thanh toán */}
                                                {
                                                    (authorities.includes("ADMIN") || authorities.includes("CS") || authorities.includes("TRANSPORTER")) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleViewPaymentDetails(item)}
                                                            className="absolute top-0 right-0 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                        >
                                                            <PencilIcon className="w-5 h-5" />
                                                        </button>)
                                                }

                                                {/* Giá trị tiền order */}
                                                <div className="flex flex-col space-y-1 pt-6">
                                                    {/* Giá trị xanh */}
                                                    <div className="flex items-center space-x-2">
                                                        <span className="px-2 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-md dark:bg-blue-900/50 dark:text-blue-300">
                                                            {formatCurrency(item.pricePayment.payment_banking)} VNĐ
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                    )}

                                    {visibleColumns.status && (
                                        <TableCell className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <StatusBadge status={item.status_payment} />

                                                {authorities.includes("ADMIN") || authorities.includes("CS") || authorities.includes("TRANSPORTER") ? (
                                                    <select
                                                        value={item.status_payment || "pending"}
                                                        onChange={(e) => handleUpdateStatus(item.bill_house, e.target.value)}
                                                        className="ml-2 text-xs border border-gray-300 rounded p-1 bg-white dark:bg-gray-700 dark:border-gray-600"
                                                    >
                                                        {availableStatuses.map((status) => (
                                                            <option key={status.value} value={status.value}>
                                                                {status.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : null}
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div >

            <div className="border border-t-0 rounded-b-xl border-gray-100 py-4 pl-[18px] pr-4 dark:border-white/[0.05]">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between">
                    {/* Left side: Showing entries */}
                    <div className="pb-3 xl:pb-0">
                        <p className="pb-3 text-sm font-medium text-center text-gray-500 border-b border-gray-100 dark:border-gray-800 dark:text-gray-400 xl:border-b-0 xl:pb-0 xl:text-left">
                            Showing {startIndex + 1} to {endIndex} of {totalItems} entries
                        </p>
                    </div>
                    <PaginationWithIcon
                        totalPages={totalPages}
                        initialPage={currentPage}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>

            <Modal
                isOpen={isOpen}
                onClose={() => {
                    closeModal();
                    if (isDataChanged) {
                        window.location.reload(); // Chỉ reload nếu dữ liệu đã thay đổi
                    }
                }}
                className="max-w-[800px] m-4"
            >
                <div className="relative w-full p-6 bg-white rounded-2xl dark:bg-gray-800 shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            Hóa đơn: HB{billEdit.bill_house?.substring(0, 5)}
                        </h3>
                        <button
                            onClick={() => {
                                closeModal();
                                if (isDataChanged) {
                                    window.location.reload(); // Chỉ reload nếu dữ liệu đã thay đổi
                                }
                            }

                            }
                            className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        >
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form className="space-y-6">


                        {/* Package Section */}
                        {
                            (authorities.includes("ADMIN")) && (
                                <div className="space-y-6">
                                    {/* Header */}
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                                            Quản lý Price Orders
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const currentDate = new Date();
                                                const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
                                                const newPriceOrder = {
                                                    id: "",
                                                    name: "",
                                                    price: "",
                                                    description: "",
                                                    date: formattedDate,
                                                };
                                                setPriceOrders([...priceOrders, newPriceOrder]);
                                            }}
                                            className="flex items-center px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                        >
                                            <PlusIcon className="w-4 h-4 mr-1" />
                                            Thêm Price Order
                                        </button>
                                    </div>

                                    {/* Price Order List */}
                                    <div className="space-y-4">
                                        {(priceOrders || []).map((order, index) => (
                                            <div
                                                key={index}
                                                className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                                            >
                                                {/* STT */}
                                                <div className="w-1/12 text-center">
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {index + 1}
                                                    </p>
                                                </div>

                                                {/* Name */}
                                                <div className="w-full sm:w-1/4">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Tên
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={order.name}
                                                        onChange={(e) => {
                                                            const updatedOrders = [...priceOrders];
                                                            updatedOrders[index].name = e.target.value;
                                                            setPriceOrders(updatedOrders);
                                                        }}
                                                        className="w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                                                    />
                                                </div>

                                                {/* Price */}
                                                <div className="w-full sm:w-1/4">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Giá
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={order.price}
                                                        onChange={(e) => {
                                                            const updatedOrders = [...priceOrders];
                                                            updatedOrders[index].price = e.target.value;
                                                            setPriceOrders(updatedOrders);
                                                        }}
                                                        className="w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                                                    />
                                                </div>

                                                {/* Description */}
                                                <div className="w-full sm:w-1/4">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Mô tả
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={order.description}
                                                        onChange={(e) => {
                                                            const updatedOrders = [...priceOrders];
                                                            updatedOrders[index].description = e.target.value;
                                                            setPriceOrders(updatedOrders);
                                                        }}
                                                        className="w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                                                    />
                                                </div>

                                                {/* DateTime */}
                                                <div className="w-full sm:w-1/4">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Ngày tạo
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={order.created_at || "Chưa có ngày tạo"} // Hiển thị ngày tạo nếu có, nếu không hiển thị placeholder
                                                        readOnly // Chỉ đọc, không cho phép chỉnh sửa
                                                        className="w-full px-3 py-2 text-sm border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                                                    />
                                                </div>

                                                {/* Buttons */}
                                                <div className="flex items-center gap-2">
                                                    {order.id === "" ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const dataRequest = {
                                                                    id: order.id,
                                                                    name: order.name,
                                                                    price: order.price,
                                                                    description: order.description,
                                                                    bill_id: billEdit.bill_house,
                                                                };
                                                                handleCreatePriceOrder(dataRequest);
                                                                setIsDataChanged(true);

                                                            }}
                                                            className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                                                        >
                                                            Lưu
                                                        </button>
                                                    ) : (
                                                        (!order.active &&
                                                            <button
                                                                type="button"
                                                                onClick={async () => {
                                                                    await PutPriceOrder(order.id);
                                                                    order.active = true;
                                                                    const updatedOrders = [...priceOrders];
                                                                    updatedOrders[index] = order;
                                                                    setPriceOrders(updatedOrders);
                                                                    setIsDataChanged(true);
                                                                }
                                                                }
                                                                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                                            >
                                                                Xác nhận
                                                            </button>
                                                        )
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            const updatedOrders = priceOrders.filter((_, i) => i !== index);
                                                            setPriceOrders(updatedOrders);

                                                            await DeletePriceOrder(order.id);
                                                            setIsDataChanged(true);



                                                            props.setDataBill(updatedDataBill); // Giả sử bạn có hàm `setDataBill` để cập nhật `dataBill`
                                                        }}
                                                        className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        }


                        {/* Action Buttons */}
                        <div className="flex justify-end pt-4 space-x-3 border-t dark:border-gray-700">
                            <button
                                type="button"
                                onClick={
                                    () => {
                                        closeModal();
                                        if (isDataChanged) {
                                            window.location.reload();
                                        }
                                    }
                                }
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                            >
                                Đóng
                            </button>

                        </div>
                    </form>
                </div>
            </Modal>


            <Modal
                isOpen={isOpenFormPayment}
                onClose={() => {
                    setIsOpenFormPayment(false);
                    if (isDataChanged) {
                        window.location.reload();
                    }
                }}
                className="max-w-[800px] m-4"
            >
                <div className="relative w-full p-6 bg-white rounded-2xl dark:bg-gray-800 shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            Chi tiết thanh toán: HB{billEdit.bill_house?.substring(0, 5)}
                        </h3>
                        {
                            authorities.includes("ADMIN") || authorities.includes("CS") && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsOpenFormPayment(false);
                                        if (isDataChanged) {
                                            window.location.reload();
                                        }
                                    }}
                                    className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                                >
                                    <XIcon className="w-5 h-5" />
                                </button>)
                        }
                    </div>

                    {/* Form */}
                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        {/* Package Section */}
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                                    Quản lý thanh toán
                                </h4>
                            </div>

                            {/* Payment Form */}
                            <div className="space-y-4">
                                {/* Tiền mặt */}
                                <div className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                    <div className="w-1/12 text-center">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            1
                                        </p>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Tiền mặt (VNĐ)
                                        </label>
                                        <input
                                            type="text"
                                            value={paymentDetails.cash === 0 && document.activeElement === document.getElementById('cash-input') ? '' : paymentDetails.cash}
                                            onChange={(e) => handlePaymentInputChange('cash', e.target.value)}
                                            onFocus={(e) => {
                                                if (paymentDetails.cash === 0) {
                                                    e.target.value = '';
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === '') {
                                                    handlePaymentInputChange('cash', '0');
                                                }
                                            }}
                                            id="cash-input"
                                            className="w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                                        />
                                    </div>
                                </div>

                                {/* Tiền chuyển khoản */}
                                <div className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                    <div className="w-1/12 text-center">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            2
                                        </p>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Tiền chuyển khoản (VNĐ)
                                        </label>
                                        <input
                                            type="text"
                                            value={paymentDetails.banking === 0 && document.activeElement === document.getElementById('banking-input') ? '' : paymentDetails.banking}
                                            onChange={(e) => handlePaymentInputChange('banking', e.target.value)}
                                            onFocus={(e) => {
                                                if (paymentDetails.banking === 0) {
                                                    e.target.value = '';
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === '') {
                                                    handlePaymentInputChange('banking', '0');
                                                }
                                            }}
                                            id="banking-input"
                                            className="w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                                        />
                                    </div>
                                </div>

                                {/* Tổng tiền */}
                                <div className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-md bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                                    <div className="w-1/12 text-center">
                                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                            Σ
                                        </p>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block mb-1 text-sm font-medium text-blue-700 dark:text-blue-300">
                                            Tổng tiền thanh toán (VNĐ)
                                        </label>
                                        <div className="w-full px-3 py-2 text-sm font-bold border rounded-md bg-white dark:bg-gray-800 dark:text-blue-300 dark:border-blue-800">
                                            {formatCurrency(paymentDetails.cash + paymentDetails.banking)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end pt-4 space-x-3 border-t dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpenFormPayment(false);
                                    if (isDataChanged) {
                                        window.location.reload();
                                    }
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                            >
                                Đóng
                            </button>

                            <button
                                type="button"
                                onClick={handleUpdatePayment}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div >
    );
}