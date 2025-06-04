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
                                    { key: "payments", label: "Thanh toán" },
                                    { key: "status", label: "TRẠNG THÁI" },
                                ].map(({ key, label }) => (
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
                                    {/* House Bill */}
                                    <TableCell className="px-6 py-4 whitespace-nowrap">
                                        <NavLink
                                            to="/profile"
                                            className="font-medium text-brand-600 dark:text-brand-400 hover:underline"
                                        >
                                            EB{item.bill_house.substring(0, 5)}
                                        </NavLink>
                                    </TableCell>

                                    {/* Thông tin người */}
                                    <TableCell className="px-6 py-4 whitespace-nowrap">
                                        {item.date_create}
                                    </TableCell>

                                    {/* Bill phụ */}
                                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {item.bill_employee}
                                    </TableCell>

                                    {/* AWS */}
                                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {item.aws}
                                    </TableCell>

                                    {/* Dịch vụ */}
                                    <TableCell className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                            {item.company_service}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                            {formatCurrency(item.total_real)} VNĐ
                                        </span>
                                    </TableCell>

                                    {/* Thành tiền */}
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

                                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {formatCurrency(item.total_fake)} VNĐ
                                    </TableCell>



                                    {/* price payment */}
                                    <TableCell TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300" >
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

                                                {/* Giá trị đỏ */}
                                                <div className="flex items-center space-x-2">
                                                    <span className="px-2 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-md dark:bg-red-900/50 dark:text-red-300">
                                                        {formatCurrency(item.pricePayment.payment_card)} VNĐ
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Trạng thái */}
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
