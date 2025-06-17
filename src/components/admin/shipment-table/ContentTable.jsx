"use client";

import { useState, useMemo, useEffect, useRef } from "react";

import { NavLink } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import PaginationWithIcon from "../tables/DataTables/TableOne/PaginationWithIcon";
import { Modal } from "../ui/modal/index.js";
import { useModal } from "../../../hooks/useModal.js";
import {
  DeletePriceOrder,
  GetAllBaseUser,
  GetAllPriceOrder,
  GetPaymentDetails,
  GetShipment,
  PostBaseUser,
  PostPriceOrder,
  PutPriceOrder,
  UpdateBillAccountant,
  UpdatePaymentDetails,
} from "../../../service/api.admin.service.jsx";
import { PlusIcon, XIcon, PencilIcon, Delete } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import ExcelJS from "exceljs";
import { DatePicker } from "antd"; // import { s } from "@fullcalendar/core/internal-common";

export default function ContentTable({ data }) {
  const [dataBill, setDataBill] = useState(data || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [authorities, setAuthorities] = useState([]);

  const [priceOrders, setPriceOrders] = useState([]);
  const [billEdit, setBillEdit] = useState({});

  // State bộ lọc
  const { RangePicker } = DatePicker;
  const [filterType, setFilterType] = useState(""); // "day" | "month" | "year" | "range" | ""
  const [filterDay, setFilterDay] = useState(null);
  const [filterMonth, setFilterMonth] = useState(null);
  const [filterYear, setFilterYear] = useState(null);
  const [filterRange, setFilterRange] = useState({ from: null, to: null });
  console.log("Dữ liệu đơn hàng:", dataBill);
  const fetchBillData = async () => {
    try {
      const data = await GetShipment();
      setDataBill(data);
      console.log("Dữ liệu đơn hàng:", dataBill);
      // setState hoặc xử lý tiếp tại đây nếu cần
    } catch (error) {
      console.error("Lỗi khi gọi GetShipment:", error);
    }
  };
  useEffect(() => {
    setDataBill(data || []);
  }, [data]);
  // reset bộ lọc
  const resetAllFilters = () => {
    setFilterType("");
    setFilterDay(null);
    setFilterMonth(null);
    setFilterYear(null);
    setFilterRange({ from: null, to: null });
  };
  function formatDateTime(isoString, format = "DD/MM/YYYY HH:mm") {
    if (!isoString) return "";

    // Cắt phần microseconds nếu có
    const date = new Date(isoString.split(".")[0]);

    const pad = (n) => String(n).padStart(2, "0");

    const replacements = {
      DD: pad(date.getDate()),
      MM: pad(date.getMonth() + 1),
      YYYY: date.getFullYear(),
      HH: pad(date.getHours()),
      mm: pad(date.getMinutes()),
      ss: pad(date.getSeconds()),
    };

    // Thay thế định dạng
    return format.replace(
      /DD|MM|YYYY|HH|mm|ss/g,
      (match) => replacements[match]
    );
  }
  const [editType, setEditType] = useState("");
  const formatCurrency = (amount) => {
    const num = parseFloat(String(amount).replace(/[^0-9.-]/g, "")); // Cho phép dấu "-"
    if (isNaN(num)) return "0";

    const formatted = new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(num)); // Dùng Math.abs để bỏ dấu âm khi hiển thị

    if (num < 0) return `Dư ${formatted}`;

    return formatted;
  };

  function StatusBadge({ status }) {
    const safeStatus = status ? status.toLowerCase() : "";

    const statusColors = {
      completed:
        "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
      processing:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
      unknown: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    };

    const colorClass = statusColors[safeStatus] || statusColors.default;

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}
      >
        {status || "Unknown"}
      </span>
    );
  }
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setAuthorities(decoded.authorities);
    }
  }, []);

  // Icons (giả định sử dụng Heroicons hoặc similar)
  function ChevronUpIcon({ className }) {
    return (
      <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  function ChevronDownIcon({ className }) {
    return (
      <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 111.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  function ArrowsUpDownIcon({ className }) {
    return (
      <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 111.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 010-1.414zM10 3a1 1 0 011 1v10a1 1 11-2 0V4a1 1 011-1z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  // Add this function to check if a date is today
  function isToday(dateString) {
    // Parse the input date string (format: "10:44:19 07:06:2025")
    const parts = dateString.split(" ");
    if (parts.length !== 2) return false;

    const timePart = parts[0];
    const datePart = parts[1];

    const [day, month, year] = datePart.split(":");

    // Create date object from the parsed components
    const inputDate = new Date(year, month - 1, day);

    // Get today's date with time set to 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Compare the dates (ignoring time)
    return (
      inputDate.getDate() === today.getDate() &&
      inputDate.getMonth() === today.getMonth() &&
      inputDate.getFullYear() === today.getFullYear()
    );
  }

  const filteredAndSortedData = useMemo(() => {
    let filtered = dataBill;

    // Lọc theo house bill (search)
    filtered = filtered.filter((item) =>
      item.bill_house.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Lọc theo ngày/tháng/năm/khoảng ngày
    if (filterType === "day" && filterDay) {
      filtered = filtered.filter((item) => {
        const date = parseCustomDate(item.date_create);
        return (
          date &&
          date.getDate() === filterDay.date() &&
          date.getMonth() === filterDay.month() &&
          date.getFullYear() === filterDay.year()
        );
      });
    } else if (filterType === "month" && filterMonth) {
      filtered = filtered.filter((item) => {
        const date = parseCustomDate(item.date_create);
        return (
          date &&
          date.getMonth() === filterMonth.month() &&
          date.getFullYear() === filterMonth.year()
        );
      });
    } else if (filterType === "year" && filterYear) {
      filtered = filtered.filter((item) => {
        const date = parseCustomDate(item.date_create);
        return date && date.getFullYear() === filterYear.year();
      });
    } else if (filterType === "range" && filterRange.from && filterRange.to) {
      filtered = filtered.filter((item) => {
        const date = parseCustomDate(item.date_create);
        return (
          date &&
          date >= filterRange.from.startOf("day") &&
          date <= filterRange.to.endOf("day")
        );
      });
    }

    // Sắp xếp
    return filtered.sort((a, b) => {
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
  }, [
    dataBill,
    sortKey,
    sortOrder,
    searchTerm,
    filterType,
    filterDay,
    filterMonth,
    filterYear,
    filterRange,
  ]);

  const totalItems = filteredAndSortedData.length;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const currentData = filteredAndSortedData.slice(startIndex, endIndex);

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
    banking: 0,
    businessBanking: 0,
  });

  const [cashPayment, setCashPayment] = useState({
    price: 0,
    dateUpdate: null,
    active: false,
  });

  const [bankingPayment, setBankingPayment] = useState({
    price: 0,
    dateUpdate: null,
    active: false,
  });
  const [businessBankingPayment, setBusinessBankingPayment] = useState({
    price: 0,
    dateUpdate: null,
    active: false,
  });

  const fetchPaymentDetails = async (billId) => {
    try {
      const response = await GetPaymentDetails(billId);
      console.log("Payment details:", response);

      let cash = 0;
      let banking = 0;
      let businessBanking = 0;

      if (response && Array.isArray(response)) {
        response.forEach((payment) => {
          switch (payment.methodPayment) {
            case "CASH":
              cash += payment.price;
              setCashPayment({
                price: payment.price,
                dateUpdate: payment.updatedAt,
                active: payment.active,
              });
              console.log("Cash payment:", cashPayment);
              break;
            case "CARD":
              banking += payment.price;
              setBankingPayment({
                price: payment.price,
                dateUpdate: payment.updatedAt,
                active: payment.active,
              });
              console.log("Banking payment:", bankingPayment);
              break;
            case "BUSINESS_CARD":
              businessBanking += payment.price;
              setBusinessBankingPayment({
                price: payment.price,
                dateUpdate: payment.updatedAt,
                active: payment.active,
              });
              console.log("Business banking payment:", businessBankingPayment);
              break;
            default:
              break;
          }
        });
      }

      setPaymentDetails({
        cash,
        banking,
        businessBanking,
      });
      console.log("Payment details set:", paymentDetails);
    } catch (error) {
      console.error("Error fetching payment details:", error);
      setPaymentDetails({
        cash: 0,
        banking: 0,
        businessBanking: 0,
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
    let price = 0;
    switch (editType) {
      case "CASH":
        price = cashPayment.price;
        break;
      case "CARD":
        price = bankingPayment.price;
        break;
      case "BUSINESS_CARD":
        price = businessBankingPayment.price;
        break;
      default:
        break;
    }
    try {
      const dataRequest = {
        bill_id: billEdit.bill_house,
        active: false,
        price: price,
        methodPayment: editType,
      };

      console.log("Updating payment with data:", dataRequest);
      const dataResponse = await UpdatePaymentDetails(dataRequest);

      console.log("Payment updated:", dataResponse);

      // Đánh dấu dữ liệu đã thay đổi

      // Đóng modal
      setIsOpenFormPayment(false);

      // Thông báo thành công
      alert("Cập nhật thanh toán thành công!");
      fetchBillData(); // Cập nhật lại dữ liệu bảng
    } catch (error) {
      console.error("Error updating payment:", error);
      alert("Lỗi khi cập nhật thanh toán!");
    }
  };

  // Hàm xử lý khi người dùng bấm Save
  const handleConfirmPayment = async () => {
    let price = 0;
    switch (editType) {
      case "CASH":
        price = cashPayment.price;
        break;
      case "CARD":
        price = bankingPayment.price;
        break;
      case "BUSINESS_CARD":
        price = businessBankingPayment.price;
        break;
      default:
        break;
    }
    try {
      const dataRequest = {
        bill_id: billEdit.bill_house,
        active: true,
        price: price,
        methodPayment: editType,
      };

      console.log("Confirming payment with data:", dataRequest);
      const dataResponse = await UpdatePaymentDetails(dataRequest);

      console.log("Payment confirmed:", dataResponse);

      // Đánh dấu dữ liệu đã thay đổi

      // Đóng modal
      setIsOpenFormPayment(false);

      // Thông báo thành công
      alert("Xác nhận thanh toán thành công!");
      fetchBillData(); // Cập nhật lại dữ liệu bảng
    } catch (error) {
      console.error("Error confirming payment:", error);
      alert("Lỗi khi xac nhận thanh toán!");
    }
  };

  // Hàm xử lý khi người dùng bấm Save
  const handleCancelPayment = async () => {
    let price = 0;
    switch (editType) {
      case "CASH":
        price = cashPayment.price;
        break;
      case "CARD":
        price = bankingPayment.price;
        break;
      case "BUSINESS_CARD":
        price = businessBankingPayment.price;
        break;
      default:
        break;
    }
    try {
      const dataRequest = {
        bill_id: billEdit.bill_house,
        active: false,
        price: price,
        methodPayment: editType,
      };

      console.log("Cancelling payment with data:", dataRequest);
      const dataResponse = await UpdatePaymentDetails(dataRequest);

      console.log("Payment cancelled:", dataResponse);

      // Đánh dấu dữ liệu đã thay đổi

      // Đóng modal
      setIsOpenFormPayment(false);

      // Thông báo thành công
      alert("Hủy thanh toán thành công!");
      fetchBillData(); // Cập nhật lại dữ liệu bảng
    } catch (error) {
      console.error("Error cancelling payment:", error);
      alert("Lỗi khi hủy thanh toán!");
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
  };

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
    if (value === "") {
      numericValue = 0;
    }
    console.log("value:", value);
    switch (field) {
      case "cash":
        setCashPayment((prev) => ({
          price: value,
          dateUpdate: prev.dateUpdate,
          active: prev.active,
        }));
        break;
      case "banking":
        setBankingPayment((prev) => ({
          price: value,
          dateUpdate: prev.dateUpdate,
          active: prev.active,
        }));
        break;
      case "businessBanking":
        setBusinessBankingPayment((prev) => ({
          price: value,
          dateUpdate: prev.dateUpdate,
          active: prev.active,
        }));
        break;
      default:
        break;
    }
    console.log("Payment details set cash:", cashPayment);

    // Cập nhật state
    // setPaymentDetails((prev) => ({
    //   ...prev,
    //   [field]: numericValue,
    // }));
  };

  const handleUpdateStatus = async (billId, newStatus) => {
    try {
      const dataRequest = {
        bill_id: billId,
        status_payment: newStatus,
      };

      await UpdateBillAccountant(dataRequest);

      // Cập nhật UI
      const updatedData = currentData.map((item) => {
        if (item.bill_house === billId) {
          return { ...item, status_payment: newStatus };
        }
        return item;
      });

      // Thông báo thành công
      alert("Cập nhật trạng thái thành công!");
      fetchBillData(); // Cập nhật lại dữ liệu bảng
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Lỗi khi cập nhật trạng thái!");
    }
  };

  // Thêm các trạng thái có thể có
  const availableStatuses = [
    { value: "completed", label: "Hoàn thành" },
    { value: "processing", label: "Đang xử lý" },
    { value: "cancelled", label: "Đã hủy" },
  ];

  const statusPopoverRef = useRef(null);

  // Thêm state để quản lý hiển thị dropdown
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  // Thêm useRef để theo dõi dropdown
  const columnSelectorRef = useRef(null);
  const columnButtonRef = useRef(null);

  // Thêm useEffect để xử lý click bên ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        showColumnSelector &&
        columnSelectorRef.current &&
        !columnSelectorRef.current.contains(event.target) &&
        columnButtonRef.current &&
        !columnButtonRef.current.contains(event.target)
      ) {
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
      alert("Không có dữ liệu để xuất!");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Shipment Report");

    workbook.creator = "Shipment Management System";
    workbook.created = new Date();

    // Cập nhật mapping cột với các cột mới và nhóm chủ đề
    const columnMapping = {
      house_bill: { header: "HOUSE BILL", width: 15, group: "THÔNG TIN CƠ BẢN" },
      Date: { header: "NGÀY TẠO", width: 20, group: "THÔNG TIN CƠ BẢN" },
      customer: { header: "CUSTOMER", width: 30, group: "THÔNG TIN CƠ BẢN" },
      country_name: { header: "COUNTRY", width: 30, group: "THÔNG TIN CƠ BẢN" },
      master_tracking: { header: "MASTERTRACKING", width: 22, group: "THÔNG TIN CƠ BẢN" },
      gw: { header: "GW", width: 20, group: "THÔNG TIN CƠ BẢN" },
      cw: { header: "CW", width: 20, group: "THÔNG TIN CƠ BẢN" },
      company_service: { header: "DỊCH VỤ", width: 15, group: "THÔNG TIN CƠ BẢN" },
      inwh_date: { header: "In-WH DATE", width: 20, group: "THÔNG TIN CƠ BẢN" },

      // PRICE
      price_price: { header: "PRICE", width: 15, group: "PRICE" },
      fsc_price: { header: "FSC", width: 10, group: "PRICE" },
      surge_fee_price: { header: "SURGE FEE", width: 12, group: "PRICE" },

      // DEBIT
      afr_debit: { header: "AFR", width: 10, group: "DEBIT" },
      oversize_debit: { header: "OVERSIZE", width: 12, group: "DEBIT" },
      surge_fee_debit: { header: "SURGE FEE", width: 12, group: "DEBIT" },
      other_charges_debit: { header: "OTHER CHARGES", width: 20, group: "DEBIT" },
      fsc_debit: { header: "FSC", width: 10, group: "DEBIT" },
      gw_debit: { header: "GW", width: 10, group: "DEBIT" },
      cw_debit: { header: "CW", width: 10, group: "DEBIT" },
      bill: { header: "THÀNH TIỀN", width: 15, group: "DEBIT" },
      reconcile: { header: "ĐỐI SOÁT", width: 12, group: "DEBIT" },

      // TOTAL AR
      total_ar: { header: "TOTAL AR", width: 15, group: "TOTAL AR" },
      vat: { header: "VAT", width: 10, group: "TOTAL AR" },
      total: { header: "TOTAL", width: 15, group: "TOTAL AR" },

      // GRAND TOTAL
      order_grand_total: { header: "ORDER", width: 15, group: "GRAND TOTAL" },
      other_charges_total: { header: "OTHER CHARGES", width: 20, group: "GRAND TOTAL" },
      grand_total: { header: "GRAND TOTAL", width: 18, group: "GRAND TOTAL" },

      // PAYMENT
      payments_cash: { header: "Tiền mặt", width: 15, group: "PAYMENT" },
      payments_banking: { header: "Chuyển khoản", width: 15, group: "PAYMENT" },
      payments_business: { header: "Doanh nghiệp", width: 15, group: "PAYMENT" },
      payments_remaining: { header: "Số tiền còn lại", width: 18, group: "PAYMENT" },

      // PROFIT
      price_diff: { header: "CHÊNH LỆCH GIÁ", width: 20, group: "PROFIT" },
      packing: { header: "ĐÓNG GÓI", width: 12, group: "PROFIT" },
      pickup: { header: "PICK UP", width: 12, group: "PROFIT" },
      other_costs: { header: "CHI PHÍ KHÁC", width: 15, group: "PROFIT" },
      profit: { header: "LỢI NHUẬN", width: 15, group: "PROFIT" },

      // HH
      hh1: { header: "HH 1", width: 10, group: "HH" },
      hh2: { header: "HH 2", width: 10, group: "HH" },
      hh3: { header: "HH 3", width: 10, group: "HH" },
      hh4: { header: "HH 4", width: 10, group: "HH" },

      // LƯƠNG THƯỞNG
      base_salary: { header: "LƯƠNG CĂN BẢN", width: 22, group: "LƯƠNG THƯỞNG" },
      kpi_bonus: { header: "THƯỞNG KPI", width: 18, group: "LƯƠNG THƯỞNG" },
      bonus_1_2_3: { header: "THƯỞNG 1/2/3", width: 18, group: "LƯƠNG THƯỞNG" },
      allowance: { header: "PHỤ CẤP", width: 12, group: "LƯƠNG THƯỞNG" },
      other_bonus: { header: "THƯỞNG KHÁC", width: 18, group: "LƯƠNG THƯỞNG" },

      // STATUS
      status: { header: "TRẠNG THÁI", width: 15, group: "TRẠNG THÁI" },
    };

    // Lấy danh sách cột xuất ra
    const columnsToExport = Object.keys(columnMapping).filter(
      (key) => key === "house_bill" || visibleColumns[key]
    );

    // Tạo mảng nhóm chủ đề (group headers)
    const groupHeaders = [];
    let lastGroup = null;
    columnsToExport.forEach((key) => {
      const group = columnMapping[key].group || "";
      if (groupHeaders.length === 0 || group !== lastGroup) {
        groupHeaders.push({ group, start: groupHeaders.length, count: 1 });
        lastGroup = group;
      } else {
        groupHeaders[groupHeaders.length - 1].count += 1;
      }
    });

    // Định nghĩa cột cho worksheet
    worksheet.columns = columnsToExport.map((key) => ({
      key: key,
      width: columnMapping[key].width,
    }));

    // Thêm tiêu đề chính
    const titleRow = worksheet.insertRow(1, ["BÁO CÁO SHIPMENT"]);
    worksheet.mergeCells(1, 1, 1, columnsToExport.length);
    titleRow.height = 60;
    const titleCell = worksheet.getCell(1, 1);
    titleCell.font = {
      size: 30,
      bold: true,
      color: { argb: "FF000000" },
      name: "Arial",
    };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };

    // Thêm ngày xuất
    const dateRow = worksheet.insertRow(2, [
      `Ngày xuất: ${new Date().toLocaleString("vi-VN")}`,
    ]);
    worksheet.mergeCells(2, 1, 2, columnsToExport.length);
    dateRow.height = 20;
    const dateCell = worksheet.getCell(2, 1);
    dateCell.font = { size: 14, italic: true };
    dateCell.alignment = { horizontal: "center", vertical: "middle" };

    // Thêm dòng tiêu đề nhóm chủ đề (group header row)
    const groupHeaderRow = worksheet.insertRow(3, []);
    let colIndex = 1;
    groupHeaders.forEach((group) => {
      worksheet.mergeCells(3, colIndex, 3, colIndex + group.count - 1);
      const cell = worksheet.getCell(3, colIndex);
      cell.value = group.group || "";
      cell.font = { bold: true, size: 13, color: { argb: "FF1E293B" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E7EF" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      colIndex += group.count;
    });
    groupHeaderRow.height = 30;

    // Thêm dòng tiêu đề cột
    const headerRow = worksheet.insertRow(4, []);
    columnsToExport.forEach((key, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = columnMapping[key].header;
      cell.font = { bold: true, color: { argb: "FF000000" }, size: 12 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFA6A6A7" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    headerRow.height = 45;

    // Hàm xử lý giá trị nhiều dòng
    function processMultiLineValue(value) {
      if (typeof value !== "string") return value;
      // Tách các dòng và xử lý từng dòng
      const lines = value.split("\n");
      return lines.map(line => {
        // Tìm số trong dòng
        const matches = line.match(/-?\d+(\.\d+)?/g);
        if (!matches) return line;
        // Tính tổng các số trong dòng
        const sum = matches.reduce((acc, num) => acc + parseFloat(num), 0);
        return sum;
      }).join("\n");
    }

    // Thêm dữ liệu
    dataToExport.forEach((item, rowIndex) => {
      const rowData = {};

      columnsToExport.forEach((key) => {
        switch (key) {
          case "house_bill":
            rowData[key] = `EB${item.bill_house.substring(0, 5)}`;
            break;
          case "Date":
            rowData[key] = item.date_create;
            break;
          case "customer":
            rowData[key] = `Người gửi: ${item.information_human.from}\nNgười nhận: ${item.information_human.to}`;
            break;
          case "country_name":
            rowData[key] = item?.country_name || "";
            break;
          case "master_tracking":
            rowData[key] = item?.awb || "";
            break;
          case "gw":
            rowData[key] = `SL: ${item?.packageInfo_begin?.quantity}\nCân nặng: ${item?.packageInfo_begin?.total_weight} KG`;
            break;
          case "cw":
            rowData[key] = `SL: ${item?.packageInfo_end?.quantity}\nCân nặng: ${item?.packageInfo_end?.total_weight} KG`;
            break;
          case "company_service":
            rowData[key] = item.company_service;
            break;
          case "inwh_date":
            rowData[key] = item?.date_create || "";
            break;
          case "price_price":
            rowData[key] = formatCurrency(item?.price.priceNet);
            break;
          case "fsc_price":
            rowData[key] = item?.price.fsc_price;
            break;
          case "surge_fee_price":
            rowData[key] = item?.price.surge_fee_price;
            break;
          case "afr_debit":
            rowData[key] = formatCurrency(item?.debit.afr_debit);
            break;
          case "oversize_debit":
            rowData[key] = formatCurrency(item?.debit.oversize_debit);
            break;
          case "surge_fee_debit":
            rowData[key] = item?.debit.surge_fee_debit || "";
            break;
          case "other_charges_debit":
            rowData[key] = item?.debit.other_charges_debit || "";
            break;
          case "fsc_debit":
            rowData[key] = formatCurrency(item?.debit.fsc_debit);
            break;
          case "gw_debit":
            rowData[key] = item?.gw_debit || "";
            break;
          case "cw_debit":
            rowData[key] = item?.cw_debit || "";
            break;
          case "bill":
            rowData[key] = item?.bill || "";
            break;
          case "reconcile":
            rowData[key] = item?.reconcile || "";
            break;
          case "total_ar":
            rowData[key] = formatCurrency(item?.total_ar.total_ar);
            break;
          case "vat":
            rowData[key] = formatCurrency(item?.total_ar.vat);
            break;
          case "total":
            rowData[key] = formatCurrency(item?.total_ar.total);
            break;
          case "order_grand_total":
            rowData[key] = item?.grand_total.order_grand_total || "";
            break;
          case "other_charges_total":
            rowData[key] = item?.grand_total.other_charges_total || "";
            break;
          case "grand_total":
            rowData[key] = formatCurrency(item?.grand_total.grand_total);
            break;
          case "payments_cash":
            rowData[key] = formatCurrency(item.pricePayment?.cashPayment?.price || 0);
            break;
          case "payments_cash_status":
            rowData[key] = item.pricePayment?.cashPayment?.active ? "Đã thanh toán" : "Chưa thanh toán";
            break;
          case "payments_cash_date":
            rowData[key] = item.pricePayment?.cashPayment?.dateUpdate
              ? formatDateTime(item.pricePayment.cashPayment.dateUpdate)
              : "";
            break;
          case "payments_banking":
            rowData[key] = formatCurrency(item.pricePayment?.cardPayment?.price || 0);
            break;
          case "payments_banking_status":
            rowData[key] = item.pricePayment?.cardPayment?.active ? "Đã thanh toán" : "Chưa thanh toán";
            break;
          case "payments_banking_date":
            rowData[key] = item.pricePayment?.cardPayment?.dateUpdate
              ? formatDateTime(item.pricePayment.cardPayment.dateUpdate)
              : "";
            break;
          case "payments_business":
            rowData[key] = formatCurrency(item.pricePayment?.businessCardPayment?.price || 0);
            break;
          case "payments_business_status":
            rowData[key] = item.pricePayment?.businessCardPayment?.active ? "Đã thanh toán" : "Chưa thanh toán";
            break;
          case "payments_business_date":
            rowData[key] = item.pricePayment?.businessCardPayment?.dateUpdate
              ? formatDateTime(item.pricePayment.businessCardPayment.dateUpdate)
              : "";
            break;
          case "payments_remaining":
            rowData[key] = formatCurrency(item.pricePayment?.payments_remaining || 0);
            break;
          // ...other cases...
          default:
            rowData[key] = item[key] || "";
        }
      });

      const dataRow = worksheet.addRow(rowData);
      dataRow.height = 35;

      // Định dạng cho từng cell trong dòng dữ liệu
      dataRow.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE5E7EB" } },
          left: { style: "thin", color: { argb: "FFE5E7EB" } },
          bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
          right: { style: "thin", color: { argb: "FFE5E7EB" } },
        };

        if (rowIndex % 2 === 0) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF9FAFB" },
          };
        }

        // Căn giữa cho một số cột
        const colKey = columnsToExport[colNumber - 1];
        if (
          ["Date", "status", "company_service"].includes(colKey)
        ) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        } else if (
          colKey.includes("payment") ||
          colKey.includes("price") ||
          colKey.includes("total") ||
          colKey.includes("profit")
        ) {
          cell.alignment = { horizontal: "right", vertical: "middle" };
          cell.font = { bold: true };
        } else {
          cell.alignment = { vertical: "middle" };
        }

        // Luôn wrap text nếu có \n
        if (
          typeof cell.value === "string" &&
          cell.value.includes("\n")
        ) {
          cell.alignment = { ...(cell.alignment || {}), wrapText: true };
        }
      });
    });

    // Thêm tổng kết ở cuối (nếu có dữ liệu số)
    if (dataToExport.length > 0) {
      worksheet.addRow([]);
      worksheet.addRow([]);

      // Danh sách các cột cần tính tổng
      const sumColumns = [
        "gw", "cw", "bill", "total_ar", "vat", "total",
        "order_grand_total", "other_charges_total", "grand_total",
        "payments_cash", "payments_banking", "payments_remaining",
        "price_diff", "packing", "pickup", "other_costs", "profit",
        "hh1", "hh2", "hh3", "hh4",
        "base_salary", "kpi_bonus", "bonus_1_2_3", "allowance", "other_bonus"
      ];

      // Khởi tạo object tổng
      const sumResult = {};
      sumColumns.forEach((key) => (sumResult[key] = 0));

      // Hàm cộng tổng cho từng giá trị trong ô có nhiều dòng
      function sumMultiLineCell(cellValue) {
        if (typeof cellValue !== "string") return 0;
        // Tách các dòng và xử lý từng dòng
        const lines = cellValue.split("\n");
        return lines.reduce((sum, line) => {
          // Tìm tất cả số trong dòng
          const matches = line.match(/-?\d+(\.\d+)?/g);
          if (!matches) return sum;
          // Cộng tổng các số trong dòng
          return sum + matches.reduce((lineSum, num) => lineSum + parseFloat(num), 0);
        }, 0);
      }

      // Duyệt từng dòng dữ liệu để cộng tổng
      dataToExport.forEach((item) => {
        // GW
        if (item?.packageInfo_begin?.total_weight)
          sumResult.gw += Number(item.packageInfo_begin.total_weight) || 0;
        // CW
        if (item?.packageInfo_end?.total_weight)
          sumResult.cw += Number(item.packageInfo_end.total_weight) || 0;
        // THÀNH TIỀN (bill)
        if (item?.bill) sumResult.bill += Number(item.bill) || 0;
        // TOTAL AR
        if (item?.total_ar?.total_ar) sumResult.total_ar += Number(item.total_ar.total_ar) || 0;
        // VAT
        if (item?.total_ar?.vat) sumResult.vat += Number(item.total_ar.vat) || 0;
        // TOTAL
        if (item?.total_ar?.total) sumResult.total += Number(item.total_ar.total) || 0;
        // ORDER
        if (item?.grand_total?.order_grand_total) sumResult.order_grand_total += Number(item.grand_total.order_grand_total) || 0;
        // OTHER CHARGES
        if (item?.grand_total?.other_charges_total) sumResult.other_charges_total += Number(item.grand_total.other_charges_total) || 0;
        // GRAND TOTAL
        if (item?.grand_total?.grand_total) sumResult.grand_total += Number(item.grand_total.grand_total) || 0;
        // TIỀN MẶT
        if (item?.pricePayment?.payment_cash) sumResult.payments_cash += Number(item.pricePayment.payment_cash) || 0;
        // CHUYỂN KHOẢN
        if (item?.pricePayment?.payment_card) sumResult.payments_banking += Number(item.pricePayment.payment_card) || 0;
        // CÒN LẠI
        if (item?.pricePayment?.payments_remaining) sumResult.payments_remaining += Number(item.pricePayment.payments_remaining) || 0;
        // CHÊNH LỆCH GIÁ
        if (item?.price_diff) sumResult.price_diff += Number(item.price_diff) || 0;
        // ĐÓNG GÓI
        if (item?.packing) sumResult.packing += Number(item.packing) || 0;
        // PICK UP
        if (item?.pickup) sumResult.pickup += Number(item.pickup) || 0;
        // CHI PHÍ KHÁC
        if (item?.other_costs) sumResult.other_costs += Number(item.other_costs) || 0;
        // LỢI NHUẬN
        if (item?.profit) sumResult.profit += Number(item.profit) || 0;
        // HH 1-4
        if (item?.hh1) sumResult.hh1 += sumMultiLineCell(item.hh1);
        if (item?.hh2) sumResult.hh2 += sumMultiLineCell(item.hh2);
        if (item?.hh3) sumResult.hh3 += sumMultiLineCell(item.hh3);
        if (item?.hh4) sumResult.hh4 += sumMultiLineCell(item.hh4);
        // LƯƠNG CĂN BẢN
        if (item?.base_salary) sumResult.base_salary += sumMultiLineCell(item.base_salary);
        // THƯỞNG KPI
        if (item?.kpi_bonus) sumResult.kpi_bonus += sumMultiLineCell(item.kpi_bonus);
        // THƯỞNG 1/2/3
        if (item?.bonus_1_2_3) sumResult.bonus_1_2_3 += sumMultiLineCell(item.bonus_1_2_3);
        // PHỤ CẤP
        if (item?.allowance) sumResult.allowance += sumMultiLineCell(item.allowance);
        // THƯỞNG KHÁC
        if (item?.other_bonus) sumResult.other_bonus += sumMultiLineCell(item.other_bonus);
      });

      // Dòng tiêu đề khu vực tổng cộng
      const summaryTitleRow = worksheet.addRow(["TỔNG CỘNG"]);
      worksheet.mergeCells(
        summaryTitleRow.number,
        1,
        summaryTitleRow.number,
        columnsToExport.length
      );
      summaryTitleRow.height = 30;
      const summaryTitleCell = worksheet.getCell(summaryTitleRow.number, 1);
      summaryTitleCell.font = { bold: true, size: 14 };
      summaryTitleCell.alignment = { horizontal: "center", vertical: "middle" };
      summaryTitleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E7EF" },
      };

      // Dòng tổng cộng
      const summaryRow = worksheet.addRow([]);
      summaryRow.height = 30;

      // Thêm giá trị tổng cộng vào các cột tương ứng
      columnsToExport.forEach((key, index) => {
        const cell = summaryRow.getCell(index + 1);
        if (sumColumns.includes(key)) {
          cell.value = formatCurrency(sumResult[key]);
          cell.font = { bold: true };
          cell.alignment = { horizontal: "right", vertical: "middle" };
        }
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    }

    // Save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shipment_report_${new Date().toISOString().split("T")[0]}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columnLabels = {
    house_bill: "HOUSE BILL",
    Date: "NGÀY TẠO",
    customer: "CUSTOMER",
    country_name: "COUNTRY",
    master_tracking: "MASTERTRACKING",
    gw: "GW",
    cw: "CW",
    company_service: "DỊCH VỤ",
    inwh_date: "In-WH DATE",
    // Price
    price_price: "PRICE (PRICE)",
    fsc_price: "FSC (PRICE)",
    surge_fee_price: "SURGE FEE (PRICE)",
    // Debit
    afr_debit: "AFR (DEBIT)",
    oversize_debit: "OVERSIZE (DEBIT)",
    surge_fee_debit: "SURGE FEE (DEBIT)",
    other_charges_debit: "OTHER CHARGES (DEBIT)",
    fsc_debit: "FSC (DEBIT)",
    // Total AR
    total_ar: "TOTAL AR (TOTAL AR)",
    vat: "VAT (TOTAL AR)",
    total: "TOTAL (TOTAL AR)",
    // Grand Total
    order_grand_total: "ORDER ((GRAND TOTAL))",
    other_charges_total: "OTHER CHARGES (GRAND TOTAL)",
    grand_total: "GRAND TOTAL (GRAND TOTAL)",
    // Thanh toan
    payments_cash: "TIỀN MẶT (PAYMENT)",
    payments_cash_status: "TRẠNG THÁI TIỀN MẶT (PAYMENT)",
    payments_cash_date: "NGÀY THANH TOÁN TIỀN MẶT (PAYMENT)",
    payments_banking: "CHUYỂN KHOẢN (PAYMENT)",
    payments_banking_status: "TRẠNG THÁI CHUYỂN KHOẢN (PAYMENT)",
    payments_banking_date: "NGÀY THANH TOÁN CHUYỂN KHOẢN (PAYMENT)",
    payments_business: "DOANH NGHIỆP (PAYMENT)",
    payments_business_status: "TRẠNG THÁI DOANH NGHIỆP (PAYMENT)",
    payments_business_date: "NGÀY THANH TOÁN DOANH NGHIỆP (PAYMENT)",
    payments_remaining: "CÒN LẠI (PAYMENT)",

    // DEBIT
    gw_debit: "GW (DEBIT)",
    cw_debit: "CW (DEBIT)",
    bill: "THÀNH TIỀN (DEBIT)",
    reconcile: "ĐỐI SOÁT (DEBIT)",
    // Lợi nhuận
    price_diff: "CHÊNH LỆCH GIÁ (PROFIT)",
    packing: "ĐÓNG GÓI (PROFIT)",
    pickup: "PICK UP (PROFIT)",
    other_costs: "CHI PHÍ KHÁC (PROFIT)",
    profit: "LỢI NHUẬN (PROFIT)",
    // HH
    hh1: "HH 1 (HH)",
    hh2: "HH 2 (HH)",
    hh3: "HH 3 (HH)",
    hh4: "HH 4 (HH)",
    // Lương thưởng
    base_salary: "LƯƠNG CĂN BẢN (LƯƠNG THƯỞNG)",
    kpi_bonus: "THƯỞNG KPI (LƯƠNG THƯỞNG)",
    bonus_1_2_3: "THƯỞNG 1\nTHƯỞNG 2\nTHƯỞNG 3 (LƯƠNG THƯỞNG)",
    allowance: "PHỤ CẤP (LƯƠNG THƯỞNG)",
    other_bonus: "THƯỞNG KHÁC (LƯƠNG THƯỞNG)",

    // Trang thai
    status: "TRẠNG THÁI",
  };

  // Thêm state để quản lý các cột hiển thị
  // Thêm state để quản lý các cột hiển thị
  const [visibleColumns, setVisibleColumns] = useState(() => {
    // Danh sách các cột mặc định hiển thị
    const defaultVisibleColumns = [
      "house_bill", // Luôn hiển thị
      "customer", // Customer
      "country_name", // Country
      "master_tracking", // Mastertracking
      "cw", // CW
      "company_service", // Service
      "inwh_date", // In-WH date
      "total", // TOTAL(TOTAL AR)
      "order_grand_total", // Order(GRAND TOTAL)
      "grand_total", // GRAND TOTAL(GRAND TOTAL)
      "payments_cash", // TIỀN MẶT(PAYMENT)
      "payments_banking", // CHUYỂN KHOẢN(PAYMENT)
      "payments_business", // DOANH NGHIỆP(PAYMENT)
      "payments_remaining", // CÒN LẠI(PAYMENT)
    ];

    // Tạo object với tất cả các cột là false, sau đó đặt các cột mặc định là true
    const initialVisibleColumns = Object.keys(columnLabels).reduce(
      (acc, key) => {
        acc[key] = defaultVisibleColumns.includes(key);
        return acc;
      },
      {}
    );

    return initialVisibleColumns;
  });

  // Add this state to track section visibility
  const [sectionVisibility, setSectionVisibility] = useState({
    PRICE: true,
    DEBIT: true,
    TOTAL_AR: true,
    GRAND_TOTAL: true,
    PAYMENT: true,
    PROFIT: true,
    HH: true,
    LUONG_THUONG: true,
  });

  // Add this function to toggle section visibility
  const toggleSection = (section) => {
    setSectionVisibility((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));

    // Update column visibility based on section
    const sectionColumns = {
      PRICE: ["price_price", "fsc_price", "surge_fee_price"],
      DEBIT: [
        "afr_debit",
        "oversize_debit",
        "surge_fee_debit",
        "other_charges_debit",
        "fsc_debit",
        "gw_debit",
        "cw_debit",
        "bill",
        "reconcile",
      ],
      TOTAL_AR: ["total_ar", "vat", "total"],
      GRAND_TOTAL: ["order_grand_total", "other_charges_total", "grand_total"],
      PAYMENT: ["cash", "banking", "total_payment"],
      PROFIT: ["price_diff", "packing", "pickup", "other_costs", "profit"],
      HH: ["hh1", "hh2", "hh3", "hh4"],
      LUONG_THUONG: [
        "base_salary",
        "kpi_bonus",
        "bonus_1_2_3",
        "allowance",
        "other_bonus",
      ],
    };

    const newVisibility = !sectionVisibility[section];

    // Update all columns in this section
    sectionColumns[section].forEach((column) => {
      setColumnVisibility((prev) => ({
        ...prev,
        [column]: newVisibility,
      }));
    });
  };

  // Tính toán các giá trị tổng quan
  const filteredMastertracking = currentData.filter(
    (item) => item.awb && item.awb !== ""
  );
  const totalMastertracking = filteredMastertracking.length;
  const totalDebit = filteredMastertracking.reduce(
    (sum, item) => sum + (item?.grand_total?.grand_total || 0),
    0
  );
  const totalPayment = filteredMastertracking.reduce(
    (sum, item) =>
      sum +
      (item?.pricePayment?.cashPayment?.active
        ? item?.pricePayment?.cashPayment?.price || 0
        : 0) +
      (item?.pricePayment?.cardPayment?.active
        ? item?.pricePayment?.cardPayment?.price || 0
        : 0) +
      (item?.pricePayment?.businessCardPayment?.active
        ? item?.pricePayment?.businessCardPayment?.price || 0
        : 0),
    0
  );
  const totalRemaining = filteredMastertracking.reduce(
    (sum, item) =>
      sum + Math.max(0, item?.pricePayment?.payments_remaining || 0),
    0
  );

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      )}

      <div className="bg-white dark:bg-white/[0.03] rounded-xl">
        {/* Bộ lọc */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <form className="flex flex-wrap items-center gap-4">
            {/* ... existing filter form content ... */}
          </form>
        </div>

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div>
            <Table className="w-full rounded-lg overflow-hidden shadow-sm">
              <TableHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <TableRow>
                  {Object.entries(columnLabels)
                    .filter(([key]) => key === "house_bill" || visibleColumns[key])
                    .map(([key, label]) => (
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
              <TableBody>
                {currentData.map((item, index) => (
                  <TableRow key={index}>
                    {/* ... existing row content ... */}
                    {visibleColumns.status && (
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <StatusBadge status={item.status_payment} />
                          {authorities.includes("ADMIN") ||
                            authorities.includes("CS") ||
                            authorities.includes("TRANSPORTER") ? (
                            <select
                              value={item.status_payment || "pending"}
                              onChange={(e) =>
                                handleUpdateStatus(item.bill_house, e.target.value)
                              }
                              disabled={isUpdating}
                              className="ml-2 text-xs border border-gray-300 rounded p-1 bg-white dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>

        <div className="border border-t-0 rounded-b-xl border-gray-100 py-4 pl-[18px] pr-4 dark:border-white/[0.05]">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between">
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
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={exportToExcel}
          disabled={isExporting}
          className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-md hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Đang xuất...
            </div>
          ) : (
            "Xuất Excel"
          )}
        </button>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          closeModal();
          if (isDataChanged) {
            fetchBillData();
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
                  fetchBillData();
                }
              }}
              className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form className="space-y-6">
            {/* ... existing form content ... */}
          </form>
        </div>
      </Modal>
    </div>
  );
}

function parseCustomDate(dateString) {
  // dateString dạng "10:44:19 07:06:2025"
  if (!dateString) return null;
  const parts = dateString.split(" ");
  if (parts.length !== 2) return null;
  const [time, date] = parts;
  const [day, month, year] = date.split(":").map(Number);
  return new Date(year, month - 1, day);
}