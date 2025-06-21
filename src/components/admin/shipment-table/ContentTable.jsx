"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  DeletePaymentDetails,
} from "../../../service/api.admin.service.jsx";
import { PlusIcon, XIcon, PencilIcon, Delete } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import ExcelJS from "exceljs";
import { DatePicker } from "antd"; // import { s } from "@fullcalendar/core/internal-common";
export default function ContentTable({ data }) {
  const fileInputRef = useRef(null);

  const [dataBill, setDataBill] = useState(data || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [authorities, setAuthorities] = useState([]);

  const [priceOrders, setPriceOrders] = useState([]);
  const [billEdit, setBillEdit] = useState({});

  // State ẩn hiện bộ lọc
  const [showFilter, setShowFilter] = useState(false);

  // State quản lý ẩn/hiện tổng quan
  const [showOverview, setShowOverview] = useState(false);

  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Mouse events
  const handleMouseDown = (e) => {
    if (
      e.target.closest('.dropdown-filter-ns') ||
      e.target.closest('.icon-filter-ns')
    ) {
      return;
    }
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };
  const handleMouseUp = () => setIsDragging(false);

  // Touch events for mobile
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = x - startX;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };
  const handleTouchEnd = () => setIsDragging(false);
  // State bộ lọc
  const { RangePicker } = DatePicker;
  const [filterType, setFilterType] = useState(""); // "day" | "month" | "year" | "range" | ""
  const [filterDay, setFilterDay] = useState(null);
  const [filterMonth, setFilterMonth] = useState(null);
  const [filterYear, setFilterYear] = useState(null);
  const [filterRange, setFilterRange] = useState({ from: null, to: null });
  const [filterBD, setFilterBD] = useState("");
  const [filterManager, setFilterManager] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterCS, setFilterCS] = useState("");
  const [filterTransporter, setFilterTransporter] = useState("");

  // state cho dropdown filter từng cột
  const [showFilterDropdown, setShowFilterDropdown] = useState({
    bd: false,
    manager: false,
    user: false,
    cs: false,
    transporter: false,
  });

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
  const bdNames = useMemo(
    () =>
      Array.from(
        new Set(dataBill.map((item) => item?.employee?.bd_name).filter(Boolean))
      ),
    [dataBill]
  );

  const managerNames = useMemo(
    () =>
      Array.from(
        new Set(
          dataBill.map((item) => item?.employee?.manager_name).filter(Boolean)
        )
      ),
    [dataBill]
  );
  const userNames = useMemo(
    () =>
      Array.from(
        new Set(
          dataBill.map((item) => item?.employee?.user_name).filter(Boolean)
        )
      ),
    [dataBill]
  );
  const csNames = useMemo(
    () =>
      Array.from(
        new Set(dataBill.map((item) => item?.employee?.cs_name).filter(Boolean))
      ),
    [dataBill]
  );
  const transporterNames = useMemo(
    () =>
      Array.from(
        new Set(
          dataBill
            .map((item) => item?.employee?.transporter_name)
            .filter(Boolean)
        )
      ),
    [dataBill]
  );
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
    // Lọc theo quyền
    if (authorities.includes("ADMIN")) {
      if (filterBD && filterBD.length)
        filtered = filtered.filter(
          (item) =>
            Array.isArray(filterBD)
              ? filterBD.includes(item?.employee?.bd_name)
              : item?.employee?.bd_name === filterBD
        );
      if (filterManager && filterManager.length)
        filtered = filtered.filter(
          (item) =>
            Array.isArray(filterManager)
              ? filterManager.includes(item?.employee?.manager_name)
              : item?.employee?.manager_name === filterManager
        );
    } else if (authorities.includes("BD")) {
      if (filterManager && filterManager.length)
        filtered = filtered.filter(
          (item) =>
            Array.isArray(filterManager)
              ? filterManager.includes(item?.employee?.manager_name)
              : item?.employee?.manager_name === filterManager
        );
    } else if (authorities.includes("MANAGER")) {
      if (filterUser && filterUser.length)
        filtered = filtered.filter(
          (item) =>
            Array.isArray(filterUser)
              ? filterUser.includes(item?.employee?.user_name)
              : item?.employee?.user_name === filterUser
        );
      if (filterCS && filterCS.length)
        filtered = filtered.filter(
          (item) =>
            Array.isArray(filterCS)
              ? filterCS.includes(item?.employee?.cs_name)
              : item?.employee?.cs_name === filterCS
        );
      if (filterTransporter && filterTransporter.length)
        filtered = filtered.filter(
          (item) =>
            Array.isArray(filterTransporter)
              ? filterTransporter.includes(item?.employee?.transporter_name)
              : item?.employee?.transporter_name === filterTransporter
        );
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
    filterBD,
    filterManager,
    filterUser,
    filterCS,
    filterTransporter,
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

  const [cashPayments, setCashPayments] = useState([]);
  const [bankingPayments, setBankingPayments] = useState([]);
  const [businessPayments, setBusinessPayments] = useState([]);

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
    setIsOpenFormPayment(true);
    setCashPayments(item.pricePayment?.cashPayment || []);
    setBankingPayments(item.pricePayment?.cardPayment || []);
    setBusinessPayments(item.pricePayment?.businessCardPayment || []);
  };

  const handleUpdatePayment = async (payment, idx, type) => {
    // Thêm name và description vào dataRequest nếu có
    const dataRequest = {
      id: payment.id,
      bill_id: billEdit.bill_house,
      price: payment.price,
      methodPayment: payment.methodPayment,
      active: payment.active,
      name: payment.name || "",
      description: payment.description || "",
    };

    try {
      const response = await UpdatePaymentDetails(dataRequest);
      const updated = response;
      if (type === "cash" || payment.methodPayment === "CASH") {
        setCashPayments((prev) => {
          const newArr = [...prev];
          newArr[idx] = updated;
          return newArr;
        });
      } else if (type === "banking" || payment.methodPayment === "CARD") {
        setBankingPayments((prev) => {
          const newArr = [...prev];
          newArr[idx] = updated;
          return newArr;
        });
      } else {
        setBusinessPayments((prev) => {
          const newArr = [...prev];
          newArr[idx] = updated;
          return newArr;
        });
      }
      fetchBillData();
    } catch (error) {
      console.error(error);
      alert("Lỗi khi cập nhật thanh toán!");
    }
  };

  const handleConfirmPayment = async (payment) => {
    let payments = [];
    let setPayments;

    if (payment.methodPayment === "CASH") {
      payments = cashPayments;
      setPayments = setCashPayments;
    } else if (payment.methodPayment === "CARD") {
      payments = bankingPayments;
      setPayments = setBankingPayments;
    } else {
      payments = businessPayments;
      setPayments = setBusinessPayments;
    }

    // ✅ Chỉ cập nhật 1 item có id trùng khớp

    const updatedPayment = {
      ...payment,
      bill_id: billEdit.bill_house,
      active: true,
    };

    try {
      const response = await UpdatePaymentDetails(updatedPayment); // gửi 1 payment
      const updated = response;

      setPayments((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );

      fetchBillData();
    } catch (error) {
      console.error("Lỗi khi xác nhận thanh toán:", error);
      alert("Lỗi khi xác nhận thanh toán!");
    }
  };

  const handleCancelPayment = async (payment) => {
    await DeletePaymentDetails(payment.id);

    if (payment.methodPayment === "CASH") {
      setCashPayments((prev) => prev.filter((p) => p.id !== payment.id));
    } else if (payment.methodPayment === "CARD") {
      setBankingPayments((prev) => prev.filter((p) => p.id !== payment.id));
    } else if (payment.methodPayment === "BUSINESS_CARD") {
      setBusinessPayments((prev) => prev.filter((p) => p.id !== payment.id));
    }

    fetchBillData();
  };

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

  const handlePaymentArrayInputChange = (type, idx, field, value) => {
    let payments, setPayments;
    if (type === "cash") {
      payments = cashPayments;
      setPayments = setCashPayments;
    } else if (type === "banking") {
      payments = bankingPayments;
      setPayments = setBankingPayments;
    } else if (type === "business") {
      payments = businessPayments;
      setPayments = setBusinessPayments;
    }

    // Nếu đã có createdAt thì không cho nhập tiếp
    if (payments[idx]?.createdAt) return;

    setPayments((prev) =>
      prev.map((p, i) =>
        i === idx
          ? {
              ...p,
              [field]: field === "price" ? Math.max(0, Number(value)) : value,
            }
          : p
      )
    );
  };

  const handleAddPayment = (type) => {
    const newPayment = {
      id: "",
      bill_id: billEdit.bill_house,
      price: "",
      methodPayment:
        type === "cash"
          ? "CASH"
          : type === "banking"
          ? "CARD"
          : "BUSINESS_CARD",
      active: false,
    };
    if (type === "cash") setCashPayments((prev) => [...prev, newPayment]);
    if (type === "banking") setBankingPayments((prev) => [...prev, newPayment]);
    if (type === "business")
      setBusinessPayments((prev) => [...prev, newPayment]);
  };

  const handleDeletePayment = (type, idx) => {
    if (type === "cash")
      setCashPayments((prev) => prev.filter((_, i) => i !== idx));
    if (type === "banking")
      setBankingPayments((prev) => prev.filter((_, i) => i !== idx));
    if (type === "business")
      setBusinessPayments((prev) => prev.filter((_, i) => i !== idx));
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
      house_bill: {
        header: "HOUSE BILL",
        width: 15,
        group: "THÔNG TIN CƠ BẢN",
      },
      //   Date: { header: "NGÀY TẠO", width: 20, group: "THÔNG TIN CƠ BẢN" },
      customer: { header: "CUSTOMER", width: 30, group: "THÔNG TIN CƠ BẢN" },
      country_name: { header: "COUNTRY", width: 30, group: "THÔNG TIN CƠ BẢN" },
      master_tracking: {
        header: "MASTERTRACKING",
        width: 22,
        group: "THÔNG TIN CƠ BẢN",
      },
      gw: { header: "GW", width: 20, group: "THÔNG TIN CƠ BẢN" },
      cw: { header: "CW", width: 20, group: "THÔNG TIN CƠ BẢN" },
      company_service: {
        header: "DỊCH VỤ",
        width: 15,
        group: "THÔNG TIN CƠ BẢN",
      },
      inwh_date: { header: "In-WH DATE", width: 20, group: "THÔNG TIN CƠ BẢN" },

      // PRICE
      price_price: { header: "PRICE", width: 15, group: "PRICE" },
      fsc_price: { header: "FSC", width: 10, group: "PRICE" },
      surge_fee_price: { header: "SURGE FEE", width: 12, group: "PRICE" },

      // DEBIT
      afr_debit: { header: "AFR", width: 10, group: "DEBIT" },
      oversize_debit: { header: "OVERSIZE", width: 12, group: "DEBIT" },
      surge_fee_debit: { header: "SURGE FEE", width: 12, group: "DEBIT" },
      other_charges_debit: {
        header: "OTHER CHARGES",
        width: 20,
        group: "DEBIT",
      },
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
      other_charges_total: {
        header: "OTHER CHARGES",
        width: 20,
        group: "GRAND TOTAL",
      },
      grand_total: { header: "GRAND TOTAL", width: 18, group: "GRAND TOTAL" },

      // PAYMENT
      payments_cash: { header: "Tiền mặt", width: 15, group: "PAYMENT" },
      payments_banking: { header: "Chuyển khoản", width: 15, group: "PAYMENT" },
      payments_business: {
        header: "Doanh nghiệp",
        width: 15,
        group: "PAYMENT",
      },
      payments_remaining: {
        header: "Số tiền còn lại",
        width: 18,
        group: "PAYMENT",
      },

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
      base_salary: {
        header: "LƯƠNG CĂN BẢN",
        width: 22,
        group: "LƯƠNG THƯỞNG",
      },
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
      return lines
        .map((line) => {
          // Tìm số trong dòng
          const matches = line.match(/-?\d+(\.\d+)?/g);
          if (!matches) return line;
          // Tính tổng các số trong dòng
          const sum = matches.reduce((acc, num) => acc + parseFloat(num), 0);
          return sum;
        })
        .join("\n");
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
            rowData[
              key
            ] = `Người gửi: ${item.information_human.from}\nNgười nhận: ${item.information_human.to}`;
            break;
          case "country_name":
            rowData[key] = item?.country_name || "";
            break;
          case "master_tracking":
            rowData[key] = item?.awb || "";
            break;
          case "gw":
            rowData[
              key
            ] = `SL: ${item?.packageInfo_begin?.quantity}\nCân nặng: ${item?.packageInfo_begin?.total_weight} KG`;
            break;
          case "cw":
            rowData[
              key
            ] = `SL: ${item?.packageInfo_end?.quantity}\nCân nặng: ${item?.packageInfo_end?.total_weight} KG`;
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
            rowData[key] = formatCurrency(
              item.pricePayment?.cashPayment?.price || 0
            );
            break;
          case "payments_cash_status":
            rowData[key] = item.pricePayment?.cashPayment?.active
              ? "Đã thanh toán"
              : "Chưa thanh toán";
            break;
          case "payments_cash_date":
            rowData[key] = item.pricePayment?.cashPayment?.dateUpdate
              ? formatDateTime(item.pricePayment.cashPayment.dateUpdate)
              : "";
            break;
          case "payments_banking":
            rowData[key] = formatCurrency(
              item.pricePayment?.cardPayment?.price || 0
            );
            break;
          case "payments_banking_status":
            rowData[key] = item.pricePayment?.cardPayment?.active
              ? "Đã thanh toán"
              : "Chưa thanh toán";
            break;
          case "payments_banking_date":
            rowData[key] = item.pricePayment?.cardPayment?.dateUpdate
              ? formatDateTime(item.pricePayment.cardPayment.dateUpdate)
              : "";
            break;
          case "payments_business":
            rowData[key] = formatCurrency(
              item.pricePayment?.businessCardPayment?.price || 0
            );
            break;
          case "payments_business_status":
            rowData[key] = item.pricePayment?.businessCardPayment?.active
              ? "Đã thanh toán"
              : "Chưa thanh toán";
            break;
          case "payments_business_date":
            rowData[key] = item.pricePayment?.businessCardPayment?.dateUpdate
              ? formatDateTime(item.pricePayment.businessCardPayment.dateUpdate)
              : "";
            break;
          case "payments_remaining":
            rowData[key] = formatCurrency(
              item.pricePayment?.payments_remaining || 0
            );
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
        if (["Date", "status", "company_service"].includes(colKey)) {
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
        if (typeof cell.value === "string" && cell.value.includes("\n")) {
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
        "gw",
        "cw",
        "bill",
        "total_ar",
        "vat",
        "total",
        "order_grand_total",
        "other_charges_total",
        "grand_total",
        "payments_cash",
        "payments_banking",
        "payments_remaining",
        "price_diff",
        "packing",
        "pickup",
        "other_costs",
        "profit",
        "hh1",
        "hh2",
        "hh3",
        "hh4",
        "base_salary",
        "kpi_bonus",
        "bonus_1_2_3",
        "allowance",
        "other_bonus",
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
          return (
            sum + matches.reduce((lineSum, num) => lineSum + parseFloat(num), 0)
          );
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
        if (item?.total_ar?.total_ar)
          sumResult.total_ar += Number(item.total_ar.total_ar) || 0;
        // VAT
        if (item?.total_ar?.vat)
          sumResult.vat += Number(item.total_ar.vat) || 0;
        // TOTAL
        if (item?.total_ar?.total)
          sumResult.total += Number(item.total_ar.total) || 0;
        // ORDER
        if (item?.grand_total?.order_grand_total)
          sumResult.order_grand_total +=
            Number(item.grand_total.order_grand_total) || 0;
        // OTHER CHARGES
        if (item?.grand_total?.other_charges_total)
          sumResult.other_charges_total +=
            Number(item.grand_total.other_charges_total) || 0;
        // GRAND TOTAL
        if (item?.grand_total?.grand_total)
          sumResult.grand_total += Number(item.grand_total.grand_total) || 0;
        // TIỀN MẶT
        if (item?.pricePayment?.payment_cash)
          sumResult.payments_cash +=
            Number(item.pricePayment.payment_cash) || 0;
        // CHUYỂN KHOẢN
        if (item?.pricePayment?.payment_card)
          sumResult.payments_banking +=
            Number(item.pricePayment.payment_card) || 0;
        // CÒN LẠI
        if (item?.pricePayment?.payments_remaining)
          sumResult.payments_remaining +=
            Number(item.pricePayment.payments_remaining) || 0;
        // CHÊNH LỆCH GIÁ
        if (item?.price_diff)
          sumResult.price_diff += Number(item.price_diff) || 0;
        // ĐÓNG GÓI
        if (item?.packing) sumResult.packing += Number(item.packing) || 0;
        // PICK UP
        if (item?.pickup) sumResult.pickup += Number(item.pickup) || 0;
        // CHI PHÍ KHÁC
        if (item?.other_costs)
          sumResult.other_costs += Number(item.other_costs) || 0;
        // LỢI NHUẬN
        if (item?.profit) sumResult.profit += Number(item.profit) || 0;
        // HH 1-4
        if (item?.hh1) sumResult.hh1 += sumMultiLineCell(item.hh1);
        if (item?.hh2) sumResult.hh2 += sumMultiLineCell(item.hh2);
        if (item?.hh3) sumResult.hh3 += sumMultiLineCell(item.hh3);
        if (item?.hh4) sumResult.hh4 += sumMultiLineCell(item.hh4);
        // LƯƠNG CĂN BẢN
        if (item?.base_salary)
          sumResult.base_salary += sumMultiLineCell(item.base_salary);
        // THƯỞNG KPI
        if (item?.kpi_bonus)
          sumResult.kpi_bonus += sumMultiLineCell(item.kpi_bonus);
        // THƯỞNG 1/2/3
        if (item?.bonus_1_2_3)
          sumResult.bonus_1_2_3 += sumMultiLineCell(item.bonus_1_2_3);
        // PHỤ CẤP
        if (item?.allowance)
          sumResult.allowance += sumMultiLineCell(item.allowance);
        // THƯỞNG KHÁC
        if (item?.other_bonus)
          sumResult.other_bonus += sumMultiLineCell(item.other_bonus);
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
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shipment_report_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const buffer = e.target.result;

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];

        const headerRow = worksheet.getRow(1);
        const headersRaw = headerRow.values.slice(1); // bỏ index 0

        const headers = headersRaw.map((h) =>
          String(h).toLowerCase().replace(/\s+/g, "_")
        );

        const importedData = [];

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return;

          const rowData = {};
          row.eachCell((cell, colNumber) => {
            const headerKey = headers[colNumber - 1];
            rowData[headerKey] = cell.value;
          });

          importedData.push(rowData);
        });

        // Tạo map từ awb => { new_debit, cw_pgk, cw_weight }
        const awbMap = {};
        importedData.forEach((row) => {
          const awb = String(row.awb).trim();
          awbMap[awb] = {
            new_debit: row.new_debit,
            cw_pgk: row.cw_pgk,
            cw_weight: row.cw_weight,
          };
        });

        // Cập nhật dataBill
        setDataBill((prev) =>
          prev.map((item) => {
            const awbKey = String(item.awb).trim();
            const update = awbMap[awbKey];
            return {
              ...item,
              new_debit: update?.new_debit ?? item.new_debit,
              packageInfo_end: {
                ...item.packageInfo_end,
                quantity: update?.cw_pgk ?? item.packageInfo_end?.quantity,
                total_weight:
                  update?.cw_weight ?? item.packageInfo_end?.total_weight,
              },
            };
          })
        );

        // Hiện cột
        setVisibleColumns((prev) => ({
          ...prev,
          new_debit: true,
          new_cw: true,
        }));

        setImportedDebitData(importedData);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("❌ Lỗi khi đọc file Excel:", error);
    }
  };


  const columnLabels = {
    house_bill: "TTCB - HOUSE BILL",
    // Date: "NGÀY TẠO",
    bd: "NS - BD",
    manager: "NS - MANAGER",
    user: "NS - USER",
    cs: "NS - CS",
    transporter: "NS - TRANSPORTER",
    customer: "TTCB - CUSTOMER",
    country_name: "TTCB - COUNTRY",
    master_tracking: "TTCB - AWB",
    gw: "TTCB - GW",
    cw: "TTCB - CW",
    new_cw: "TTCB - NEW CW",
    company_service: "TTCB - SERVICE",
    inwh_date: "TTCB - DATE",
    // Price
    price_price: "UCCB - PRICE",
    fsc_price: "UCCB - FSC",
    surge_fee_price: "UCCB - SURGE FEE",
    // Debit
    afr_debit: "UDBU - AFR",
    oversize_debit: "UDBU - OVERSIZE",
    surge_fee_debit: "UDBU - SURGE FEE",
    other_charges_debit: "UDBU - OTHER CHARGES",
    fsc_debit: "UDBU - FSC",
    // Total AR
    total_ar: "UTC - TOTAL AR",
    vat: "UTC - VAT",
    total: "UTC - TOTAL",
    // Grand Total
    order_grand_total: "UTHD - ORDER",
    other_charges_total: "UTHD - OTHER CHARGES",
    grand_total: "UTHD - GRAND TOTAL",
    // Thanh toan
    payments_cash: "UTT - TIỀN MẶT",
    // payments_cash_status: "TRẠNG THÁI TIỀN MẶT (PAYMENT)",
    // payments_cash_date: "NGÀY THANH TOÁN TIỀN MẶT (PAYMENT)",
    payments_banking: "UTT - CHUYỂN KHOẢN",
    // payments_banking_status: "TRẠNG THÁI CHUYỂN KHOẢN (PAYMENT)",
    // payments_banking_date: "NGÀY THANH TOÁN CHUYỂN KHOẢN (PAYMENT)",
    payments_business: "UTT - DOANH NGHIỆP",
    // payments_business_status: "TRẠNG THÁI DOANH NGHIỆP (PAYMENT)",
    // payments_business_date: "NGÀY THANH TOÁN DOANH NGHIỆP (PAYMENT)",
    payments_remaining: "UTT - CÒN LẠI",

    // DEBIT
    gw_debit: "QDB - GW",
    cw_debit: "QDB - CW",
    bill: "QDB - THÀNH TIỀN",
    new_debit: "QDB - DEBIT MỚI",
    reconcile: "QDB - ĐỐI SOÁT",
    // Lợi nhuận
    price_diff: "QLN - CHÊNH LỆCH GIÁ",
    packing: "QLN - ĐÓNG GÓI",
    pickup: "QLN - PICK UP",
    other_costs: "QLN - CHI PHÍ KHÁC",
    profit: "QLN - LỢI NHUẬN",
    // HH
    hh1: "QHH - HH 1",
    hh2: "QHH - HH 2",
    hh3: "QHH - HH 3",
    hh4: "QHH - HH 4",
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
  // Tổng tiền mặt đã xác nhận
  const totalCashActive = filteredMastertracking.reduce(
    (sum, item) =>
      sum +
      (Array.isArray(item?.pricePayment?.cashPayment)
        ? item.pricePayment.cashPayment
            .filter((p) => p.active)
            .reduce((s, p) => s + (parseFloat(p.price) || 0), 0)
        : 0),
    0
  );

  // Tổng chuyển khoản đã xác nhận
  const totalBankingActive = filteredMastertracking.reduce(
    (sum, item) =>
      sum +
      (Array.isArray(item?.pricePayment?.cardPayment)
        ? item.pricePayment.cardPayment
            .filter((p) => p.active)
            .reduce((s, p) => s + (parseFloat(p.price) || 0), 0)
        : 0),
    0
  );

  // Tổng doanh nghiệp đã xác nhận
  const totalBusinessActive = filteredMastertracking.reduce(
    (sum, item) =>
      sum +
      (Array.isArray(item?.pricePayment?.businessCardPayment)
        ? item.pricePayment.businessCardPayment
            .filter((p) => p.active)
            .reduce((s, p) => s + (parseFloat(p.price) || 0), 0)
        : 0),
    0
  );

  // Tổng thu = tổng thanh toán đã xác nhận (tổng tiền mặt, chuyển khoản, doanh nghiệp đã active)
  const totalThu = totalCashActive + totalBankingActive + totalBusinessActive;
  const totalRemaining = filteredMastertracking.reduce(
    (sum, item) =>
      sum + Math.max(0, item?.pricePayment?.payments_remaining || 0),
    0
  );


  function DropdownFilterNS({
    keyName,
    names,
    selectedNames,
    setSelectedNames,
    onClose,
  }) {
    const [tempSelected, setTempSelected] = useState(
      Array.isArray(selectedNames)
        ? selectedNames
        : selectedNames
          ? [selectedNames]
          : []
    );

    // Áp dụng filter
    const handleApply = () => {
      setSelectedNames(tempSelected.length === 0 ? "" : tempSelected);
      onClose();
    };

    // Xóa lọc
    const handleClear = () => {
      setTempSelected([]);
      setSelectedNames("");
      onClose();
    };

    // Đóng khi click ngoài
    useEffect(() => {
      const handleClickOutside = (e) => {
        if (!e.target.closest(`#dropdown-ns-${keyName}`)) onClose();
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose, keyName]);

    return (
      <div
        id={`dropdown-ns-${keyName}`}
        className="dropdown-filter-ns absolute left-8 top-full z-[99999] bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 w-60 p-0"
        style={{ minWidth: 220 }}
      >
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <span className="normal-case font-semibold text-sm text-gray-700 dark:text-gray-200">
            Lọc nhân sự
          </span>
          <span className="normal-case text-xs text-gray-500 dark:text-gray-400">
            {tempSelected.length}/{names.length} đã chọn
          </span>
        </div>
        <div className="max-h-48 overflow-y-auto py-2 px-4">
          {names.length === 0 && (
            toast.error("Không có dữ liệu cần lọc")
          )}
          {names.map((name) => (
            <label
              key={name}
              className="flex items-center gap-2 py-1 cursor-pointer text-sm text-gray-700 dark:text-gray-200"
            >
              <input
                type="checkbox"
                checked={tempSelected.includes(name)}
                onChange={() => {
                  setTempSelected((prev) =>
                    prev.includes(name)
                      ? prev.filter((n) => n !== name)
                      : [...prev, name]
                  );
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="truncate normal-case">{name}</span>

            </label>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
          <button
            type="button"
            className="px-2 py-1 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
            onClick={handleClear}
          >
            Xóa lọc
          </button>
          <button
            type="button"
            className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 shadow"
            onClick={handleApply}
          >
            Áp dụng
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white/[0.03] rounded-xl">
      {/* Bộ lọc */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mb-4">
        {/* Header */}
        <div
          className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-lg flex items-center cursor-pointer select-none"
          onClick={() => setShowFilter((prev) => !prev)}
        >
          <span className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200">
            <svg
              className={`w-5 h-5 mr-2 text-purple-700 transition-transform duration-300 ${showFilter ? "rotate-180" : ""
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            Bộ lọc
          </span>
          <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
            {showFilter ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
          </span>
        </div>

        <AnimatePresence>
          {showFilter && (
            <motion.div
              initial={{ height: 0, opacity: 0, overflow: "hidden" }}
              animate={{ height: "auto", opacity: 1, overflow: "visible" }}
              exit={{ height: 0, opacity: 0, overflow: "hidden" }}
              transition={{ duration: 0.3 }}
            >
              {/* Content */}
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Lọc theo khoảng ngày */}
                  <div className="space-y-2 md:col-span-2 lg:col-span-1">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      📅 Khoảng ngày
                    </label>
                    <div className="space-y-2">
                      <RangePicker
                        format={"DD/MM/YYYY"}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        value={
                          filterType === "range" &&
                            filterRange.from &&
                            filterRange.to
                            ? [filterRange.from, filterRange.to]
                            : []
                        }
                        onChange={(dates) => {
                          if (dates && dates.length === 2) {
                            setFilterType("range");
                            setFilterRange({ from: dates[0], to: dates[1] });
                            setFilterDay(null);
                            setFilterMonth(null);
                            setFilterYear(null);
                          } else {
                            resetAllFilters();
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Lọc theo ngày đơn */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      📅 Theo ngày
                    </label>
                    <DatePicker
                      format={"DD/MM/YYYY"}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={
                        filterType === "day" && filterDay ? filterDay : null
                      }
                      onChange={(date) => {
                        if (date) {
                          setFilterType("day");
                          setFilterDay(date);
                          setFilterMonth(null);
                          setFilterYear(null);
                          setFilterRange({ from: null, to: null });
                        } else {
                          resetAllFilters();
                        }
                      }}
                    />
                  </div>

                  {/* Lọc theo tháng */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      📊 Theo tháng
                    </label>
                    <DatePicker
                      picker="month"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={
                        filterType === "month" && filterMonth
                          ? filterMonth
                          : null
                      }
                      onChange={(date) => {
                        if (date) {
                          setFilterType("month");
                          setFilterMonth(date);
                          setFilterDay(null);
                          setFilterYear(null);
                          setFilterRange({ from: null, to: null });
                        } else {
                          resetAllFilters();
                        }
                      }}
                    />
                  </div>

                  {/* Lọc theo năm */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      🗓️ Theo năm
                    </label>
                    <DatePicker
                      picker="year"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={
                        filterType === "year" && filterYear ? filterYear : null
                      }
                      onChange={(date) => {
                        if (date) {
                          setFilterType("year");
                          setFilterYear(date);
                          setFilterDay(null);
                          setFilterMonth(null);
                          setFilterRange({ from: null, to: null });
                        } else {
                          resetAllFilters();
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Thông tin trạng thái filter */}
                {filterType && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-medium">
                        Đang lọc:
                        {filterType === "day" &&
                          filterDay &&
                          ` Ngày ${filterDay.format("DD/MM/YYYY")}`}
                        {filterType === "month" &&
                          filterMonth &&
                          ` Tháng ${filterMonth.format("MM/YYYY")}`}
                        {filterType === "year" &&
                          filterYear &&
                          ` Năm ${filterYear.format("YYYY")}`}
                        {filterType === "range" &&
                          filterRange.from &&
                          filterRange.to &&
                          ` Từ ${filterRange.from.format(
                            "DD/MM/YYYY"
                          )} đến ${filterRange.to.format("DD/MM/YYYY")}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Phần tổng quan */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mb-4">
        {/* Header tổng quan */}
        <div
          className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-lg flex items-center cursor-pointer select-none"
          onClick={() => setShowOverview((prev) => !prev)}
        >
          <span className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200">
            <svg
              className={`w-5 h-5 mr-2 text-purple-700 transition-transform duration-300 ${showOverview ? "rotate-180" : ""
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            Tổng quan
          </span>
          <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
            {showOverview ? "Ẩn tổng quan" : "Hiện tổng quan"}
          </span>
        </div>

        <AnimatePresence>
          {showOverview && (
            <motion.div
              initial={{ height: 0, opacity: 0, overflow: "hidden" }}
              animate={{ height: "auto", opacity: 1, overflow: "visible" }}
              exit={{ height: 0, opacity: 0, overflow: "hidden" }}
              transition={{ duration: 0.3 }}
            >
              {/* Thêm 6 ô tổng quan ở đây */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 p-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 flex flex-col items-center">
                  <span className="text-xs text-blue-700 dark:text-blue-300 font-semibold mb-1">
                    Doanh số (Mastertracking)
                  </span>
                  <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {totalMastertracking}
                  </span>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/60 rounded-lg p-4 flex flex-col items-center">
                  <span className="text-xs text-orange-700 dark:text-orange-300 font-semibold mb-1">
                    Tổng Debit
                  </span>
                  <span className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {formatCurrency(totalDebit)} VNĐ
                  </span>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-4 flex flex-col items-center">
                  <span className="w-full max-w-md text-xs text-yellow-700 dark:text-yellow-300 font-semibold mb-1">
                    Tổng Thanh toán
                  </span>
                  <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    {formatCurrency(totalThu)} VNĐ
                  </span>
                </div>
                <div className="bg-green-100 dark:bg-green-900/60 rounded-lg p-4 flex flex-col items-center">
                  <span className="text-xs text-green-800 dark:text-green-200 font-semibold mb-1">
                    Tiền mặt:
                  </span>
                  <span className="text-2xl font-bold text-green-800 dark:text-green-200">
                    {formatCurrency(totalCashActive)} VNĐ
                  </span>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/60 rounded-lg p-4 flex flex-col items-center">
                  <span className="text-xs text-blue-800 dark:text-blue-200 font-semibold mb-1">
                    Chuyển khoản:
                  </span>
                  <span className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    {formatCurrency(totalBankingActive)} VNĐ
                  </span>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/60 rounded-lg p-4 flex flex-col items-center">
                  <span className="text-xs text-purple-800 dark:text-purple-200 font-semibold mb-1">
                    Doanh nghiệp:
                  </span>
                  <span className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                    {formatCurrency(totalBusinessActive)} VNĐ
                  </span>
                </div>
                <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4 flex flex-col items-center">
                  <span className="text-xs text-red-700 dark:text-red-300 font-semibold mb-1">
                    Tổng Còn lại
                  </span>
                  <span className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {formatCurrency(totalRemaining)} VNĐ
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
          <div className="relative">
            <button
              ref={columnButtonRef}
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              className="ml-4 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Tùy chỉnh cột
            </button>

            {/* Dropdown tùy chỉnh cột */}
            {showColumnSelector && (
              <div
                ref={columnSelectorRef}
                className="absolute left-0 top-full mt-2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-72 dark:bg-gray-800 dark:border-gray-700"
              >
                <h3 className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Hiển thị cột
                </h3>

                {/* Thêm nút Chọn tất cả/Bỏ chọn tất cả */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      const newVisibleColumns = { ...visibleColumns };
                      Object.keys(newVisibleColumns).forEach((column) => {
                        if (column !== "house_bill") {
                          // Giữ nguyên house_bill
                          newVisibleColumns[column] = true;
                        }
                      });
                      setVisibleColumns(newVisibleColumns);
                    }}
                    className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                  >
                    Chọn tất cả
                  </button>
                  <button
                    onClick={() => {
                      const newVisibleColumns = { ...visibleColumns };
                      Object.keys(newVisibleColumns).forEach((column) => {
                        if (column !== "house_bill") {
                          // Giữ nguyên house_bill
                          newVisibleColumns[column] = false;
                        }
                      });
                      setVisibleColumns(newVisibleColumns);
                    }}
                    className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Bỏ chọn tất cả
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {/* Cột luôn hiển thị */}
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="col-house_bill"
                      checked={true}
                      disabled={true}
                      className="w-4 h-4 bg-blue-600 text-blue-600 cursor-not-allowed opacity-70 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600"
                    />
                    <label
                      htmlFor="col-house_bill"
                      className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200"
                    >
                      TTCB - HOUSE BILL
                    </label>
                  </div>
                  {/* Nhóm THÔNG TIN CƠ BẢN */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        THÔNG TIN CƠ BẢN
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            const newVisibleColumns = { ...visibleColumns };
                            [
                              "house_bill",
                              // "Date",
                              "customer",
                              "country_name",
                              "master_tracking",
                              "gw",
                              "cw",
                              "company_service",
                              "inwh_date",
                            ].forEach((column) => {
                              newVisibleColumns[column] = true;
                            });
                            setVisibleColumns(newVisibleColumns);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                        >
                          Chọn
                        </button>
                        <button
                          onClick={() => {
                            const newVisibleColumns = { ...visibleColumns };
                            [
                              "customer",
                              "country_name",
                              "master_tracking",
                              "gw",
                              "cw",
                              "company_service",
                              "inwh_date",
                            ].forEach((column) => {
                              if (column !== "house_bill") {
                                // Giữ nguyên house_bill
                                newVisibleColumns[column] = false;
                              }
                            });
                            setVisibleColumns(newVisibleColumns);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          Bỏ chọn
                        </button>
                      </div>
                    </div>
                    {[
                      "customer",
                      "country_name",
                      "master_tracking",
                      "gw",
                      "cw",
                      "company_service",
                      "inwh_date",
                    ].map((column) => (
                      <div key={column} className="flex items-center ml-2 mt-1">
                        <input
                          type="checkbox"
                          id={`col-${column}`}
                          checked={visibleColumns[column]}
                          onChange={() => {
                            setVisibleColumns({
                              ...visibleColumns,
                              [column]: !visibleColumns[column],
                            });
                          }}
                          className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                          htmlFor={`col-${column}`}
                          className="ml-2 text-xs text-gray-600 dark:text-gray-400"
                        >
                          {columnLabels[column] || column}
                        </label>
                      </div>
                    ))}
                  </div>
                  {/* Nhóm THÔNG TIN NHÂN SỰ */}
                  {(authorities.includes("ADMIN") ||
                    authorities.includes("BD") ||
                    authorities.includes("MANAGER")) && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            THÔNG TIN NHÂN SỰ
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                const newVisibleColumns = { ...visibleColumns };
                                if (authorities.includes("ADMIN")) {
                                  ["bd", "manager"].forEach((column) => {
                                    newVisibleColumns[column] = true;
                                  });
                                } else if (authorities.includes("BD")) {
                                  newVisibleColumns["manager"] = true;
                                } else if (authorities.includes("MANAGER")) {
                                  ["user", "cs", "transporter"].forEach(
                                    (column) => {
                                      newVisibleColumns[column] = true;
                                    }
                                  );
                                }
                                setVisibleColumns(newVisibleColumns);
                              }}
                              className="px-1.5 py-0.5 text-[10px] font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                            >
                              Chọn
                            </button>
                            <button
                              onClick={() => {
                                const newVisibleColumns = { ...visibleColumns };
                                if (authorities.includes("ADMIN")) {
                                  ["bd", "manager"].forEach((column) => {
                                    newVisibleColumns[column] = false;
                                  });
                                } else if (authorities.includes("BD")) {
                                  newVisibleColumns["manager"] = false;
                                } else if (authorities.includes("MANAGER")) {
                                  ["user", "cs", "transporter"].forEach(
                                    (column) => {
                                      newVisibleColumns[column] = false;
                                    }
                                  );
                                }
                                setVisibleColumns(newVisibleColumns);
                              }}
                              className="px-1.5 py-0.5 text-[10px] font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            >
                              Bỏ chọn
                            </button>
                          </div>
                        </div>

                        {/* ADMIN: hiển thị bd và manager */}
                        {authorities.includes("ADMIN") && (
                          <>
                            {["bd", "manager"].map((column) => (
                              <div
                                key={column}
                                className="flex items-center ml-2 mt-1"
                              >
                                <input
                                  type="checkbox"
                                  id={`col-${column}`}
                                  checked={visibleColumns[column]}
                                  onChange={() =>
                                    setVisibleColumns({
                                      ...visibleColumns,
                                      [column]: !visibleColumns[column],
                                    })
                                  }
                                  className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <label
                                  htmlFor={`col-${column}`}
                                  className="ml-2 text-xs text-gray-600 dark:text-gray-400"
                                >
                                  {columnLabels[column] || column}
                                </label>
                              </div>
                            ))}
                          </>
                        )}

                        {/* BD: chỉ hiển thị manager */}
                        {authorities.includes("BD") &&
                          !authorities.includes("ADMIN") && (
                            <div className="flex items-center ml-2 mt-1">
                              <input
                                type="checkbox"
                                id="col-manager"
                                checked={visibleColumns["manager"]}
                                onChange={() =>
                                  setVisibleColumns({
                                    ...visibleColumns,
                                    manager: !visibleColumns["manager"],
                                  })
                                }
                                className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <label
                                htmlFor="col-manager"
                                className="ml-2 text-xs text-gray-600 dark:text-gray-400"
                              >
                                {columnLabels["manager"] || "manager"}
                              </label>
                            </div>
                          )}

                        {/* MANAGER: chỉ hiển thị user, cs, transporter */}
                        {authorities.includes("MANAGER") &&
                          !authorities.includes("ADMIN") &&
                          !authorities.includes("BD") && (
                            <>
                              {["user", "cs", "transporter"].map((column) => (
                                <div
                                  key={column}
                                  className="flex items-center ml-2 mt-1"
                                >
                                  <input
                                    type="checkbox"
                                    id={`col-${column}`}
                                    checked={visibleColumns[column]}
                                    onChange={() =>
                                      setVisibleColumns({
                                        ...visibleColumns,
                                        [column]: !visibleColumns[column],
                                      })
                                    }
                                    className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                  />
                                  <label
                                    htmlFor={`col-${column}`}
                                    className="ml-2 text-xs text-gray-600 dark:text-gray-400"
                                  >
                                    {columnLabels[column] || column}
                                  </label>
                                </div>
                              ))}
                            </>
                          )}
                      </div>
                    )}

                  {/* Nhóm PRICE */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        PRICE
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            const newVisibleColumns = { ...visibleColumns };
                            [
                              "price_price",
                              "fsc_price",
                              "surge_fee_price",
                            ].forEach((column) => {
                              newVisibleColumns[column] = true;
                            });
                            setVisibleColumns(newVisibleColumns);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                        >
                          Chọn
                        </button>
                        <button
                          onClick={() => {
                            const newVisibleColumns = { ...visibleColumns };
                            [
                              "price_price",
                              "fsc_price",
                              "surge_fee_price",
                            ].forEach((column) => {
                              newVisibleColumns[column] = false;
                            });
                            setVisibleColumns(newVisibleColumns);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          Bỏ chọn
                        </button>
                      </div>
                    </div>
                    {["price_price", "fsc_price", "surge_fee_price"].map(
                      (column) => (
                        <div
                          key={column}
                          className="flex items-center ml-2 mt-1"
                        >
                          <input
                            type="checkbox"
                            id={`col-${column}`}
                            checked={visibleColumns[column]}
                            onChange={() => {
                              setVisibleColumns({
                                ...visibleColumns,
                                [column]: !visibleColumns[column],
                              });
                            }}
                            className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label
                            htmlFor={`col-${column}`}
                            className="ml-2 text-xs text-gray-600 dark:text-gray-400"
                          >
                            {columnLabels[column].replace(" (PRICE)", "")}
                          </label>
                        </div>
                      )
                    )}
                  </div>
                  {/* Nhóm DEBIT */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        DEBIT
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            const newVisibleColumns = { ...visibleColumns };
                            [
                              "afr_debit",
                              "oversize_debit",
                              "surge_fee_debit",
                              "other_charges_debit",
                              "fsc_debit",
                              "gw_debit",
                              "cw_debit",
                              "bill",
                              "reconcile",
                            ].forEach((column) => {
                              newVisibleColumns[column] = true;
                            });
                            setVisibleColumns(newVisibleColumns);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                        >
                          Chọn
                        </button>
                        <button
                          onClick={() => {
                            const newVisibleColumns = { ...visibleColumns };
                            [
                              "afr_debit",
                              "oversize_debit",
                              "surge_fee_debit",
                              "other_charges_debit",
                              "fsc_debit",
                              "gw_debit",
                              "cw_debit",
                              "bill",
                              "reconcile",
                            ].forEach((column) => {
                              newVisibleColumns[column] = false;
                            });
                            setVisibleColumns(newVisibleColumns);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          Bỏ chọn
                        </button>
                      </div>
                    </div>
                    {[
                      "afr_debit",
                      "oversize_debit",
                      "surge_fee_debit",
                      "other_charges_debit",
                      "fsc_debit",
                      "gw_debit",
                      "cw_debit",
                      "bill",
                      "reconcile",
                    ].map((column) => (
                      <div key={column} className="flex items-center ml-2 mt-1">
                        <input
                          type="checkbox"
                          id={`col-${column}`}
                          checked={visibleColumns[column]}
                          onChange={() => {
                            setVisibleColumns({
                              ...visibleColumns,
                              [column]: !visibleColumns[column],
                            });
                          }}
                          className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                          htmlFor={`col-${column}`}
                          className="ml-2 text-xs text-gray-600 dark:text-gray-400"
                        >
                          {columnLabels[column].replace(" (DEBIT)", "")}
                        </label>
                      </div>
                    ))}
                  </div>
                  {/* Nhóm TOTAL AR */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        TOTAL AR
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            const newVisibleColumns = { ...visibleColumns };
                            ["total_ar", "vat", "total"].forEach((column) => {
                              newVisibleColumns[column] = true;
                            });
                            setVisibleColumns(newVisibleColumns);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                        >
                          Chọn
                        </button>
                        <button
                          onClick={() => {
                            const newVisibleColumns = { ...visibleColumns };
                            ["total_ar", "vat", "total"].forEach((column) => {
                              newVisibleColumns[column] = false;
                            });
                            setVisibleColumns(newVisibleColumns);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          Bỏ chọn
                        </button>
                      </div>
                    </div>
                    {["total_ar", "vat", "total"].map((column) => (
                      <div key={column} className="flex items-center ml-2 mt-1">
                        <input
                          type="checkbox"
                          id={`col-${column}`}
                          checked={visibleColumns[column]}
                          onChange={() => {
                            setVisibleColumns({
                              ...visibleColumns,
                              [column]: !visibleColumns[column],
                            });
                          }}
                          className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                          htmlFor={`col-${column}`}
                          className="ml-2 text-xs text-gray-600 dark:text-gray-400"
                        >
                          {columnLabels[column].replace(" (TOTAL AR)", "")}
                        </label>
                      </div>
                    ))}
                  </div>
                  {/* Nhóm GRAND TOTAL */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        GRAND TOTAL
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            const newVisibleColumns = { ...visibleColumns };
                            [
                              "order_grand_total",
                              "other_charges_total",
                              "grand_total",
                            ].forEach((column) => {
                              newVisibleColumns[column] = true;
                            });
                            setVisibleColumns(newVisibleColumns);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                        >
                          Chọn
                        </button>
                        <button
                          onClick={() => {
                            const newVisibleColumns = { ...visibleColumns };
                            [
                              "order_grand_total",
                              "other_charges_total",
                              "grand_total",
                            ].forEach((column) => {
                              newVisibleColumns[column] = false;
                            });
                            setVisibleColumns(newVisibleColumns);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          Bỏ chọn
                        </button>
                      </div>
                    </div>
                    {[
                      "order_grand_total",
                      "other_charges_total",
                      "grand_total",
                    ].map((column) => (
                      <div key={column} className="flex items-center ml-2 mt-1">
                        <input
                          type="checkbox"
                          id={`col-${column}`}
                          checked={visibleColumns[column]}
                          onChange={() => {
                            setVisibleColumns({
                              ...visibleColumns,
                              [column]: !visibleColumns[column],
                            });
                          }}
                          className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                          htmlFor={`col-${column}`}
                          className="ml-2 text-xs text-gray-600 dark:text-gray-400"
                        >
                          {columnLabels[column].replace(" (GRAND TOTAL)", "")}
                        </label>
                      </div>
                    ))}
                  </div>
                  {/* Nhóm PAYMENT */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        PAYMENT
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            const newVisibleColumns = { ...visibleColumns };
                            [
                              "payments_cash",
                              "payments_banking",
                              "payments_business",
                              "payments_remaining",
                            ].forEach((column) => {
                              newVisibleColumns[column] = true;
                            });
                            setVisibleColumns(newVisibleColumns);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                        >
                          Chọn
                        </button>
                        <button
                          onClick={() => {
                            const newVisibleColumns = { ...visibleColumns };
                            [
                              "payments_cash",
                              "payments_banking",
                              "payments_business",
                              "payments_remaining",
                            ].forEach((column) => {
                              newVisibleColumns[column] = false;
                            });
                            setVisibleColumns(newVisibleColumns);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          Bỏ chọn
                        </button>
                      </div>
                    </div>
                    {[
                      "payments_cash",
                      "payments_banking",
                      "payments_business",
                      "payments_remaining",
                    ].map((column) => (
                      <div key={column} className="flex items-center ml-2 mt-1">
                        <input
                          type="checkbox"
                          id={`col-${column}`}
                          checked={visibleColumns[column]}
                          onChange={() => {
                            setVisibleColumns({
                              ...visibleColumns,
                              [column]: !visibleColumns[column],
                            });
                          }}
                          className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                          htmlFor={`col-${column}`}
                          className="ml-2 text-xs text-gray-600 dark:text-gray-400"
                        >
                          {columnLabels[column].replace(" (PAYMENT)", "")}
                        </label>
                      </div>
                    ))}
                  </div>
                  {/* Nhóm PROFIT */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        PROFIT
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            const newVisibleColumns = { ...visibleColumns };
                            [
                              "price_diff",
                              "packing",
                              "pickup",
                              "other_costs",
                              "profit",
                            ].forEach((column) => {
                              newVisibleColumns[column] = true;
                            });
                            setVisibleColumns(newVisibleColumns);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                        >
                          Chọn
                        </button>
                        <button
                          onClick={() => {
                            const newVisibleColumns = { ...visibleColumns };
                            [
                              "price_diff",
                              "packing",
                              "pickup",
                              "other_costs",
                              "profit",
                            ].forEach((column) => {
                              newVisibleColumns[column] = false;
                            });
                            setVisibleColumns(newVisibleColumns);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          Bỏ chọn
                        </button>
                      </div>
                    </div>
                    {[
                      "price_diff",
                      "packing",
                      "pickup",
                      "other_costs",
                      "profit",
                    ].map((column) => (
                      <div key={column} className="flex items-center ml-2 mt-1">
                        <input
                          type="checkbox"
                          id={`col-${column}`}
                          checked={visibleColumns[column]}
                          onChange={() => {
                            setVisibleColumns({
                              ...visibleColumns,
                              [column]: !visibleColumns[column],
                            });
                          }}
                          className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                          htmlFor={`col-${column}`}
                          className="ml-2 text-xs text-gray-600 dark:text-gray-400"
                        >
                          {columnLabels[column].replace(" (PROFIT)", "")}
                        </label>
                      </div>
                    ))}
                  </div>
                  {/* Nhóm HH */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        HH
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            const newVisibleColumns = { ...visibleColumns };
                            ["hh1", "hh2", "hh3", "hh4"].forEach((column) => {
                              newVisibleColumns[column] = true;
                            });
                            setVisibleColumns(newVisibleColumns);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                        >
                          Chọn
                        </button>
                        <button
                          onClick={() => {
                            const newVisibleColumns = { ...visibleColumns };
                            ["hh1", "hh2", "hh3", "hh4"].forEach((column) => {
                              newVisibleColumns[column] = false;
                            });
                            setVisibleColumns(newVisibleColumns);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          Bỏ chọn
                        </button>
                      </div>
                    </div>
                    {["hh1", "hh2", "hh3", "hh4"].map((column) => (
                      <div key={column} className="flex items-center ml-2 mt-1">
                        <input
                          type="checkbox"
                          id={`col-${column}`}
                          checked={visibleColumns[column]}
                          onChange={() => {
                            setVisibleColumns({
                              ...visibleColumns,
                              [column]: !visibleColumns[column],
                            });
                          }}
                          className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                          htmlFor={`col-${column}`}
                          className="ml-2 text-xs text-gray-600 dark:text-gray-400"
                        >
                          {columnLabels[column].replace(" (HH)", "")}
                        </label>
                      </div>
                    ))}
                  </div>
                  {/* Nhóm LƯƠNG THƯỞNG */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        LƯƠNG THƯỞNG
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            const newVisibleColumns = { ...visibleColumns };
                            [
                              "base_salary",
                              "kpi_bonus",
                              "bonus_1_2_3",
                              "allowance",
                              "other_bonus",
                            ].forEach((column) => {
                              newVisibleColumns[column] = true;
                            });
                            setVisibleColumns(newVisibleColumns);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                        >
                          Chọn
                        </button>
                        <button
                          onClick={() => {
                            const newVisibleColumns = { ...visibleColumns };
                            [
                              "base_salary",
                              "kpi_bonus",
                              "bonus_1_2_3",
                              "allowance",
                              "other_bonus",
                            ].forEach((column) => {
                              newVisibleColumns[column] = false;
                            });
                            setVisibleColumns(newVisibleColumns);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          Bỏ chọn
                        </button>
                      </div>
                    </div>
                    {[
                      "base_salary",
                      "kpi_bonus",
                      "bonus_1_2_3",
                      "allowance",
                      "other_bonus",
                    ].map((column) => (
                      <div key={column} className="flex items-center ml-2 mt-1">
                        <input
                          type="checkbox"
                          id={`col-${column}`}
                          checked={visibleColumns[column]}
                          onChange={() => {
                            setVisibleColumns({
                              ...visibleColumns,
                              [column]: !visibleColumns[column],
                            });
                          }}
                          className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                          htmlFor={`col-${column}`}
                          className="ml-2 text-xs text-gray-600 dark:text-gray-400"
                        >
                          {columnLabels[column].replace(" (LƯƠNG THƯỞNG)", "")}
                        </label>
                      </div>
                    ))}
                  </div>
                  {/* Trạng thái */}
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      id="col-status"
                      checked={visibleColumns["status"]}
                      onChange={() => {
                        setVisibleColumns({
                          ...visibleColumns,
                          status: !visibleColumns["status"],
                        });
                      }}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label
                      htmlFor="col-status"
                      className="ml-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      TRẠNG THÁI
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

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

          <button
            onClick={() => fileInputRef.current.click()}
            className="ml-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 flex items-center transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
              <path d="M8.354 13.854a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 .708-.708L7.5 12.293V3.5a.5.5 0 0 1 1 0v8.793l2.146-2.147a.5.5 0 1 1 .708.708l-3 3z" />
            </svg>
            Import New Debit
          </button>
           <input
              type="file"
              accept=".xlsx, .xls"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

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

      <div
        className="max-w-full overflow-x-auto custom-scrollbar scrollable-table"
        ref={scrollRef}
        style={{ cursor: isDragging ? "grabbing" : "default" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div>
          <Table className="w-full rounded-lg overflow-hidden shadow-sm select-none">
            <TableHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <TableRow>
                {Object.entries(columnLabels)
                  .filter(([key]) => key === "house_bill" || visibleColumns[key])
                  .map(([key, label]) => (
                    <TableCell
                      key={key}
                      isHeader
                      className={`px-2 py-3 font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-xs relative text-center
                                ${key === "house_bill" ? "min-w-[120px] max-w-[160px] w-[140px]" : ""}
                                ${key === "customer" ? "min-w-[180px] max-w-[220px] w-[200px]" : ""}
                                ${key === "country_name" ? "min-w-[100px] max-w-[140px] w-[120px]" : ""}
                                ${key === "master_tracking" ? "min-w-[120px] max-w-[160px] w-[140px]" : ""}
                                ${key === "company_service" ? "min-w-[120px] max-w-[160px] w-[140px]" : ""}
                                ${key === "inwh_date" ? "min-w-[120px] max-w-[160px] w-[140px]" : ""}
                                ${key.includes("price") || key.includes("total") || key.includes("payments") || key.includes("profit") ? "min-w-[120px] max-w-[160px] w-[130px] text-right" : ""}
                                ${key.startsWith("hh") ? "min-w-[80px] max-w-[100px] w-[90px]" : ""}
                                ${key === "status" ? "min-w-[120px] max-w-[140px] w-[120px]" : ""}
                                ${key === "bd" || key === "manager" || key === "user" || key === "cs" || key === "transporter" ? "min-w-[120px] max-w-[160px] w-[140px]" : ""}
                              `}
                    >
                      <div className="flex items-center justify-between cursor-pointer">
                        <span className="w-full text-center">
                          {label}
                        </span>
                        {["bd", "manager", "user", "cs", "transporter"].includes(key) ? (
                          <span
                            className="icon-filter-ns pointer-events-auto select-auto ml-2 text-gray-400 hover:text-brand-500 transition-colors"
                            onClick={e => {
                              e.stopPropagation();
                              e.preventDefault(); // Thêm dòng này để ngăn sự kiện click bubble lên document
                              console.log("Click filter icon", key);
                              setShowFilterDropdown(prev => ({
                                ...Object.fromEntries(Object.keys(prev).map(k => [k, false])), // Đóng tất cả dropdown khác
                                [key]: !prev[key],
                              }));
                            }}
                            style={{ cursor: "pointer" }}
                            title="Lọc nhân sự"
                          >
                            <ArrowsUpDownIcon className="pointer-events-auto select-auto h-4 w-4" />
                          </span>
                        ) : (
                          <span
                            className="icon-filter-ns pointer-events-auto select-auto ml-2 text-gray-400 hover:text-brand-500 transition-colors"
                            onClick={() => handleSort(key)}
                            style={{ cursor: "pointer" }}
                            title="Sắp xếp"
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
                          </span>
                        )}
                      </div>
                      {/* Dropdown filter nhân sự */}
                      {showFilterDropdown[key] &&
                        ["bd", "manager", "user", "cs", "transporter"].includes(key) && (
                          <DropdownFilterNS
                            keyName={key}
                            names={
                              key === "bd"
                                ? bdNames
                                : key === "manager"
                                  ? managerNames
                                  : key === "user"
                                    ? userNames
                                    : key === "cs"
                                      ? csNames
                                      : key === "transporter"
                                        ? transporterNames
                                        : []
                            }
                            selectedNames={
                              Array.isArray(
                                key === "bd"
                                  ? filterBD
                                  : key === "manager"
                                    ? filterManager
                                    : key === "user"
                                      ? filterUser
                                      : key === "cs"
                                        ? filterCS
                                        : key === "transporter"
                                          ? filterTransporter
                                          : ""
                              )
                                ? (
                                  key === "bd"
                                    ? filterBD
                                    : key === "manager"
                                      ? filterManager
                                      : key === "user"
                                        ? filterUser
                                        : key === "cs"
                                          ? filterCS
                                          : key === "transporter"
                                            ? filterTransporter
                                            : []
                                ) || []
                                : [
                                  key === "bd"
                                    ? filterBD
                                    : key === "manager"
                                      ? filterManager
                                      : key === "user"
                                        ? filterUser
                                        : key === "cs"
                                          ? filterCS
                                          : key === "transporter"
                                            ? filterTransporter
                                            : "",
                                ].filter(Boolean)
                            }
                            setSelectedNames={
                              key === "bd"
                                ? setFilterBD
                                : key === "manager"
                                  ? setFilterManager
                                  : key === "user"
                                    ? setFilterUser
                                    : key === "cs"
                                      ? setFilterCS
                                      : key === "transporter"
                                        ? setFilterTransporter
                                        : () => { }
                            }
                            onClose={() =>
                              setShowFilterDropdown((prev) => ({ ...prev, [key]: false }))
                            }
                          />
                        )}
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
                  <TableCell className="text-center py-1 whitespace-nowrap">
                    <div className="flex justify-center items-center w-full h-full">
                      <NavLink
                        to="/profile"
                        className="pointer-events-auto select-auto font-medium text-brand-600 dark:text-brand-400 hover:underline"
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
                  {/* {visibleColumns.Date && (
                                        <TableCell className="text-center px-6 py-4 whitespace-nowrap">
                                            {item.date_create}
                                        </TableCell>
                                    )} */}
                  {visibleColumns.bd && (
                    <TableCell className="text-center px-2 py-1 min-w-[120px] max-w-[160px] w-[140px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.employee.bd_name || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.manager && (
                    <TableCell className="text-center px-2 py-1 min-w-[120px] max-w-[160px] w-[140px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.employee.manager_name || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.user && (
                    <TableCell className="text-center px-2 py-1 min-w-[120px] max-w-[160px] w-[140px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.employee.user_name || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.cs && (
                    <TableCell className="text-center px-2 py-1 min-w-[120px] max-w-[160px] w-[140px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.employee.cs_name || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.transporter && (
                    <TableCell className="text-center px-2 py-1 min-w-[120px] max-w-[160px] w-[140px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.employee.transporter_name || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.customer && (
                    <TableCell className="px-2 py-1 min-w-[180px] max-w-[220px] w-[200px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Người gửi:</span>{" "}
                        {item.information_human.from}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Người nhận:</span>{" "}
                        {item.information_human.to}
                      </p>
                    </TableCell>
                  )}

                  {visibleColumns.country_name && (
                    <TableCell className="text-center px-2 py-1 min-w-[100px] max-w-[140px] w-[120px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.country_name || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.master_tracking && (
                    <TableCell className="text-center px-2 py-1 min-w-[120px] max-w-[160px] w-[140px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.awb || "..."}
                    </TableCell>
                  )}

                  {visibleColumns.gw && (
                    <TableCell className="text-center px-2 py-1 min-w-[100px] max-w-[140px] w-[120px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">SL:</span>{" "}
                          {item?.packageInfo_begin?.quantity}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Cân nặng:</span>{" "}
                          {item?.packageInfo_begin?.total_weight} KG
                        </p>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.cw && (
                    <TableCell className="text-center px-2 py-1 min-w-[100px] max-w-[140px] w-[120px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">SL:</span>{" "}
                          {item?.packageInfo_end?.quantity}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Cân nặng:</span>{" "}
                          {item?.packageInfo_end?.total_weight} KG
                        </p>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.new_cw && (
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">SL:</span>{" "}
                          {item?.packageInfo_end?.quantity}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Cân nặng:</span>{" "}
                          {item?.packageInfo_end?.total_weight} KG
                        </p>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.company_service && (
                    <TableCell className="text-center px-2 py-1 min-w-[120px] max-w-[160px] w-[140px] whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                        {item.company_service}
                      </span>
                    </TableCell>
                  )}
                  {visibleColumns.inwh_date && (
                    <TableCell className="text-center px-2 py-1 min-w-[120px] max-w-[160px] w-[140px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.date_create || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.price_price && (
                    <TableCell className="text-center px-2 py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatCurrency(item?.price.priceNet)} VNĐ
                    </TableCell>
                  )}
                  {visibleColumns.fsc_price && (
                    <TableCell className="text-center px-2 py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.price.fsc_price} %
                    </TableCell>
                  )}
                  {visibleColumns.surge_fee_price && (
                    <TableCell className="text-center px-2 py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.price.surge_fee_price}
                    </TableCell>
                  )}
                  {visibleColumns.afr_debit && (
                    <TableCell className="text-center px-2 py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatCurrency(item?.debit.afr_debit)} VNĐ
                    </TableCell>
                  )}
                  {visibleColumns.oversize_debit && (
                    <TableCell className="text-center px-2 py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatCurrency(item?.debit.oversize_debit)} VNĐ
                    </TableCell>
                  )}
                  {visibleColumns.surge_fee_debit && (
                    <TableCell className="text-center px-2 py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.debit.surge_fee_debit || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.other_charges_debit && (
                    <TableCell className="text-center px-2 py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.debit.other_charges_debit || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.fsc_debit && (
                    <TableCell className="text-center px-2 py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatCurrency(item?.debit.fsc_debit)} VNĐ
                    </TableCell>
                  )}
                  {visibleColumns.total_ar && (
                    <TableCell className="text-center px-2 py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatCurrency(item?.total_ar.total_ar)} VNĐ
                    </TableCell>
                  )}
                  {visibleColumns.vat && (
                    <TableCell className="text-center px-2 py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatCurrency(item?.total_ar.vat)} VNĐ
                    </TableCell>
                  )}
                  {visibleColumns.total && (
                    <TableCell className="text-center px-2 py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formatCurrency(item?.total_ar.total)} VNĐ
                    </TableCell>
                  )}

                  {visibleColumns.order_grand_total && (
                    <TableCell className="text-center px-2 py-1 whitespace-normal text-xs font-medium text-gray-700 dark:text-gray-300 relative">
                      {(authorities.includes("ADMIN") ||
                        authorities.includes("ACCOUNTANT") ||
                        authorities.includes("BD")) && (
                          <button
                            type="button"
                            onClick={() => {
                              openModal();
                              setBillEdit(item);
                            }}
                            className="absolute top-1 right-1 pointer-events-auto select-auto text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 z-10"
                            style={{ zIndex: 2 }}
                            tabIndex={-1}
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                        )}
                      <div className="flex flex-col items-center justify-center pt-5 min-h-[48px]">
                        <div className="flex items-center justify-center w-full">
                          <span
                            className="px-2 py-1 text-sm font-medium rounded-md break-words text-center border text-green-800 bg-green-100 border-green-200 dark:bg-green-900/50 dark:text-green-300"
                            style={{
                              display: "inline-block",
                              textAlign: "center",
                              wordBreak: "break-word",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatCurrency(item.priceOrder.total_complete)} VNĐ
                          </span>
                        </div>
                        <div className="flex items-center justify-center w-full mt-1">
                          <span className="px-2 py-1 text-sm font-medium rounded-md break-words text-center border text-red-800 bg-red-100 border-red-200 dark:bg-red-900/50 dark:text-red-300"
                            style={{
                              display: "inline-block",
                              textAlign: "center",
                              wordBreak: "break-word",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatCurrency(item.priceOrder.total_process)} VNĐ
                          </span>
                        </div>
                      </div>
                    </TableCell>
                  )}

                  {visibleColumns.other_charges_total && (
                    <TableCell className="text-center px-2 py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.grand_total.other_charges_total || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.grand_total && (
                    <TableCell className="text-center px-2 py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatCurrency(item?.grand_total.grand_total)} VNĐ
                    </TableCell>
                  )}
                  {/* {visibleColumns.payments_cash && (
                                        <TableCell className="text-center px-2 py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                            {item?.payments_cash || "..."}
                                        </TableCell>
                                    )}
                                    {visibleColumns.payments_banking && (
                                        <TableCell className="text-center px-2 py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                            {item?.payments_banking || "..."}
                                        </TableCell>
                                    )} */}

                  {visibleColumns.payments_cash && (
                    <TableCell className="text-center px-3 py-1 whitespace-normal text-sm font-medium text-gray-700 dark:text-gray-300 relative">
                      {(authorities.includes("ADMIN") ||
                        authorities.includes("BD") ||
                        authorities.includes("ACCOUNTANT")) && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditType("CASH");
                              handleViewPaymentDetails(item);
                              setIsOpenFormPayment(true);
                            }}
                            className="absolute top-1 right-1 pointer-events-auto select-auto text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 z-10"
                            style={{ zIndex: 2 }}
                            tabIndex={-1}
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                        )}
                        {/* Tổng đã xác nhận và chưa xác nhận */}
                        <div className="flex flex-col gap-1 pt-6">
                          <div className="flex items-center">
                            <span className="px-2 py-1 text-sm font-medium rounded-md bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                              {formatCurrency(
                                (item.pricePayment.cashPayment || [])
                                  .filter((p) => p.active)
                                  .reduce(
                                    (sum, p) =>
                                      sum + (parseFloat(p.price) || 0),
                                    0
                                  )
                              )}{" "}
                              VNĐ
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="px-2 py-1 text-sm font-medium rounded-md bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                              {formatCurrency(
                                (item.pricePayment.cashPayment || [])
                                  .filter((p) => !p.active)
                                  .reduce(
                                    (sum, p) =>
                                      sum + (parseFloat(p.price) || 0),
                                    0
                                  )
                              )}{" "}
                              VNĐ
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  )}

                  {visibleColumns.payments_banking && (
                    <TableCell className="text-center px-3 py-1 whitespace-normal text-sm font-medium text-gray-700 dark:text-gray-300 relative">
                      {(authorities.includes("ADMIN") ||
                        authorities.includes("ACCOUNTANT") ||
                        authorities.includes("BD")) && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditType("CARD");
                              handleViewPaymentDetails(item);
                              setIsOpenFormPayment(true);
                            }}
                            className="absolute top-1 right-1 pointer-events-auto select-auto text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 z-10"
                            style={{ zIndex: 2 }}
                            tabIndex={-1}
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                        )}
                        {/* Tổng đã xác nhận và chưa xác nhận */}
                        <div className="flex flex-col gap-1 pt-6">
                          <div className="flex items-center">
                            <span className="px-2 py-1 text-sm font-medium rounded-md bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                              {formatCurrency(
                                (item.pricePayment.cardPayment || [])
                                  .filter((p) => p.active)
                                  .reduce(
                                    (sum, p) =>
                                      sum + (parseFloat(p.price) || 0),
                                    0
                                  )
                              )}{" "}
                              VNĐ
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="px-2 py-1 text-sm font-medium rounded-md bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                              {formatCurrency(
                                (item.pricePayment.cardPayment || [])
                                  .filter((p) => !p.active)
                                  .reduce(
                                    (sum, p) =>
                                      sum + (parseFloat(p.price) || 0),
                                    0
                                  )
                              )}{" "}
                              VNĐ
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  )}

                  {visibleColumns.payments_business && (
                    <TableCell className="text-center px-3 py-1 whitespace-normal text-sm font-medium text-gray-700 dark:text-gray-300 relative">
                      {(authorities.includes("ADMIN") ||
                        authorities.includes("ACCOUNTANT") ||
                        authorities.includes("BD")) && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditType("BUSINESS_CARD");
                              handleViewPaymentDetails(item);
                              setIsOpenFormPayment(true);
                            }}
                            className="absolute top-1 right-1 pointer-events-auto select-auto text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 z-10"
                            style={{ zIndex: 2 }}
                            tabIndex={-1}
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                        )}
                        {/* Tổng đã xác nhận và chưa xác nhận */}
                        <div className="flex flex-col gap-1 pt-6">
                          <div className="flex items-center">
                            <span className="px-2 py-1 text-sm font-medium rounded-md bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                              {formatCurrency(
                                (item.pricePayment.businessCardPayment || [])
                                  .filter((p) => p.active)
                                  .reduce(
                                    (sum, p) =>
                                      sum + (parseFloat(p.price) || 0),
                                    0
                                  )
                              )}{" "}
                              VNĐ
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="px-2 py-1 text-sm font-medium rounded-md bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                              {formatCurrency(
                                (item.pricePayment.businessCardPayment || [])
                                  .filter((p) => !p.active)
                                  .reduce(
                                    (sum, p) =>
                                      sum + (parseFloat(p.price) || 0),
                                    0
                                  )
                              )}{" "}
                              VNĐ
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.payments_remaining && (
                    <TableCell className="text-center py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatCurrency(item?.pricePayment.payments_remaining)}{" "}
                      VNĐ
                    </TableCell>
                  )}
                  {visibleColumns.gw_debit && (
                    <TableCell className="text-center py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.gw_debit || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.cw_debit && (
                    <TableCell className="text-center py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.cw_debit || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.bill && (
                    <TableCell className="text-center py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.bill || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.new_debit && (
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.new_debit !== undefined && item?.new_debit !== null && item?.new_debit !== ""
                        ? item.new_debit
                        : "..."}
                    </TableCell>
                  )}
                  {visibleColumns.reconcile && (
                    <TableCell className="text-center py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.reconcile || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.price_diff && (
                    <TableCell className="text-center py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.price_diff || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.packing && (
                    <TableCell className="text-center py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.packing || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.pickup && (
                    <TableCell className="text-center py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.pickup || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.other_costs && (
                    <TableCell className="text-center py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.other_costs || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.profit && (
                    <TableCell className="text-center py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.profit || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.hh1 && (
                    <TableCell className="text-center py-1 min-w-[80px] max-w-[100px] w-[90px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.hh1 || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.hh2 && (
                    <TableCell className="text-center py-1 min-w-[80px] max-w-[100px] w-[90px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.hh2 || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.hh3 && (
                    <TableCell className="text-center py-1 min-w-[80px] max-w-[100px] w-[90px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.hh3 || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.hh4 && (
                    <TableCell className="text-center py-1 min-w-[80px] max-w-[100px] w-[90px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.hh4 || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.base_salary && (
                    <TableCell className="text-center py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.base_salary || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.kpi_bonus && (
                    <TableCell className="text-center py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.kpi_bonus || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.bonus_1_2_3 && (
                    <TableCell className="text-center py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.bonus_1_2_3 || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.allowance && (
                    <TableCell className="text-center py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.allowance || "..."}
                    </TableCell>
                  )}
                  {visibleColumns.other_bonus && (
                    <TableCell className="text-center py-1 min-w-[120px] max-w-[160px] w-[130px] whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.other_bonus || "..."}
                    </TableCell>
                  )}

                  {visibleColumns.status && (
                    <TableCell className="text-center py-1 min-w-[120px] max-w-[140px] w-[120px] whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={item.status_payment} />

                        {authorities.includes("ADMIN") ||
                          authorities.includes("ACCOUNTANT") ||
                          authorities.includes("BD") ? (
                          <select
                            value={item.status_payment || "pending"}
                            onChange={(e) =>
                              handleUpdateStatus(
                                item.bill_house,
                                e.target.value
                              )
                            }
                            className="pointer-events-auto select-auto ml-2 text-xs border border-gray-300 rounded p-1 bg-white dark:bg-gray-700 dark:border-gray-600"
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
            fetchBillData(); // Chỉ reload nếu dữ liệu đã thay đổi
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
                  fetchBillData(); // Chỉ reload nếu dữ liệu đã thay đổi
                }
              }}
              className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form className="space-y-6">
            {/* Package Section */}
            {(authorities.includes("ADMIN") ||
              authorities.includes("ACCOUNTANT") ||
              authorities.includes("BD")) && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Quản lý Price Orders
                  </h4>
                  <div className="bg-green-100 dark:bg-green-800 rounded-xl px-4 py-2 mt-2 inline-block shadow-sm">
                    <span className="px-3 py-2 text-base font-semibold rounded-md bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                      Tổng giá:&nbsp;
                      {priceOrders
                        .filter((order) => order.active) // chỉ cộng order đã xác nhận
                        .reduce(
                          (sum, order) => sum + (parseFloat(order.price) || 0),
                          0
                        )
                        .toLocaleString()}{" "}
                      VNĐ
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const currentDate = new Date();
                      const formattedDate = `${currentDate.getDate()}/${
                        currentDate.getMonth() + 1
                      }/${currentDate.getFullYear()}`;
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
                  <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
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
                            value={order.created_at || "Chưa có ngày tạo"}
                            readOnly
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
                            !order.active && (
                              <button
                                type="button"
                                onClick={async () => {
                                  await PutPriceOrder(order.id);
                                  order.active = true;
                                  const updatedOrders = [...priceOrders];
                                  updatedOrders[index] = order;
                                  setPriceOrders(updatedOrders);
                                  setIsDataChanged(true);
                                }}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                              >
                                Xác nhận
                              </button>
                            )
                          )}
                          <button
                            type="button"
                            onClick={async () => {
                              const updatedOrders = priceOrders.filter(
                                (_, i) => i !== index
                              );
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
              )}

            {/* Action Buttons */}
            <div className="flex justify-end pt-4 space-x-3 border-t dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  closeModal();
                  if (isDataChanged) {
                    fetchBillData();
                  }
                }}
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
            fetchBillData();
          }
        }}
        className="max-w-[1100px] m-4"
      >
        <div className="relative w-full p-6 bg-white rounded-2xl dark:bg-gray-800 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              Chi tiết thanh toán: HB{billEdit.bill_house?.substring(0, 5)}
            </h3>
            {(authorities.includes("ADMIN") ||
              authorities.includes("ACCOUNTANT") ||
              authorities.includes("BD")) && (
              <button
                type="button"
                onClick={() => {
                  setIsOpenFormPayment(false);
                  if (isDataChanged) {
                    fetchBillData();
                  }
                }}
                className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <XIcon className="w-5 h-5" />
              </button>
            )}
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
                {editType === "CASH" && (
                  <div className="space-y-4">
                    {/* Tổng tiền đã xác nhận */}
                    <div className="flex items-center justify-begin mb-2">
                      <span className="px-3 py-2 text-base font-semibold rounded-md bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                        Tổng tiền đã xác nhận:&nbsp;
                        {formatCurrency(
                          (cashPayments || [])
                            .filter((p) => p.active)
                            .reduce(
                              (sum, p) => sum + (parseFloat(p.price) || 0),
                              0
                            )
                        )}{" "}
                        VNĐ
                      </span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
                      {(cashPayments || []).map((payment, idx) => (
                        <div
                          key={payment.id || idx}
                          className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                        >
                          {/* Name */}
                          <div className="w-full sm:w-1/4">
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                              Tên khoản thanh toán
                            </label>
                            <input
                              type="text"
                              value={payment.name || ""}
                              onChange={(e) =>
                                handlePaymentArrayInputChange(
                                  "cash",
                                  idx,
                                  "name",
                                  e.target.value
                                )
                              }
                              readOnly={
                                payment.active || payment.createdAt != null
                              }
                              disabled={payment.createdAt}
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
                              value={payment.description || ""}
                              onChange={(e) =>
                                handlePaymentArrayInputChange(
                                  "cash",
                                  idx,
                                  "description",
                                  e.target.value
                                )
                              }
                              readOnly={
                                payment.active || payment.createdAt != null
                              }
                              disabled={payment.createdAt}
                              className="w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                            />
                          </div>
                          {/* Price */}
                          <div className="flex-1">
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                              Tiền mặt (VNĐ)
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={payment.price}
                              onChange={(e) =>
                                handlePaymentArrayInputChange(
                                  "cash",
                                  idx,
                                  "price",
                                  e.target.value
                                )
                              }
                              readOnly={
                                payment.active || payment.createdAt != null
                              }
                              disabled={payment.createdAt}
                              className="w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                            />
                          </div>
                          {/* Ngày tạo */}
                          <div className="w-full sm:w-1/4">
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                              Ngày tạo
                            </label>
                            <input
                              type="text"
                              value={
                                payment.createdAt
                                  ? formatDateTime(payment.createdAt)
                                  : "Chưa có ngày tạo"
                              }
                              readOnly
                              className="w-full px-3 py-2 text-sm border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                            />
                          </div>
                          {/* Nút thao tác */}
                          <div className="w-full flex justify-end items-center gap-3 mt-4">
                            {!payment.active ? (
                              <>
                                {payment.createdAt == null ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdatePayment(payment, idx)
                                      }
                                      className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                    >
                                      Lưu thay đổi
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeletePayment("cash", idx)
                                      }
                                      className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                                    >
                                      Xóa
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleConfirmPayment(payment)
                                      }
                                      className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                                    >
                                      Xác nhận
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleCancelPayment(payment)
                                      }
                                      className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                                    >
                                      Xóa
                                    </button>
                                  </>
                                )}
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleCancelPayment(payment)}
                                  className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                                >
                                  Xóa
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddPayment("cash")}
                      className="flex items-center px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      <PlusIcon className="w-4 h-4 mr-1" />
                      Thêm thanh toán
                    </button>
                  </div>
                )}

                {editType === "CARD" && (
                  <div className="space-y-4">
                    {/* Tổng tiền đã xác nhận */}
                    <div className="flex items-center justify-begin mb-2">
                      <span className="px-3 py-2 text-base font-semibold rounded-md bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                        Tổng tiền đã xác nhận:&nbsp;
                        {formatCurrency(
                          (bankingPayments || [])
                            .filter((p) => p.active)
                            .reduce(
                              (sum, p) => sum + (parseFloat(p.price) || 0),
                              0
                            )
                        )}{" "}
                        VNĐ
                      </span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
                      {(bankingPayments || []).map((payment, idx) => (
                        <div
                          key={payment.id || idx}
                          className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                        >
                          {/* Name */}
                          <div className="w-full sm:w-1/4">
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                              Tên khoản thanh toán
                            </label>
                            <input
                              type="text"
                              value={payment.name || ""}
                              onChange={(e) =>
                                handlePaymentArrayInputChange(
                                  "banking",
                                  idx,
                                  "name",
                                  e.target.value
                                )
                              }
                              readOnly={
                                payment.active || payment.createdAt != null
                              }
                              disabled={payment.createdAt}
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
                              value={payment.description || ""}
                              onChange={(e) =>
                                handlePaymentArrayInputChange(
                                  "banking",
                                  idx,
                                  "description",
                                  e.target.value
                                )
                              }
                              readOnly={
                                payment.active || payment.createdAt != null
                              }
                              disabled={payment.createdAt}
                              className="w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                            />
                          </div>
                          {/* Price */}
                          <div className="flex-1">
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                              Tiền chuyển khoản (VNĐ)
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={payment.price}
                              onChange={(e) =>
                                handlePaymentArrayInputChange(
                                  "banking",
                                  idx,
                                  "price",
                                  e.target.value
                                )
                              }
                              readOnly={
                                payment.active || payment.createdAt != null
                              }
                              disabled={payment.createdAt}
                              className="w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                            />
                          </div>
                          {/* Ngày tạo */}
                          <div className="w-full sm:w-1/4">
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                              Ngày tạo
                            </label>
                            <input
                              type="text"
                              value={
                                payment.createdAt
                                  ? formatDateTime(payment.createdAt)
                                  : "Chưa có ngày tạo"
                              }
                              readOnly
                              className="w-full px-3 py-2 text-sm border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                            />
                          </div>
                          {/* Nút thao tác */}
                          <div className="w-full  flex justify-end items-center gap-3 mt-4">
                            {!payment.active ? (
                              <>
                                {payment.createdAt == null ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdatePayment(payment, idx)
                                      }
                                      className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                    >
                                      Lưu thay đổi
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeletePayment("banking", idx)
                                      }
                                      className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                                    >
                                      Xóa
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleConfirmPayment(payment)
                                      }
                                      className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                                    >
                                      Xác nhận
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleCancelPayment(payment)
                                      }
                                      className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                                    >
                                      Xóa
                                    </button>
                                  </>
                                )}
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleCancelPayment(payment)}
                                  className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                                >
                                  Xóa
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddPayment("banking")}
                      className="flex items-center px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      <PlusIcon className="w-4 h-4 mr-1" />
                      Thêm thanh toán
                    </button>
                  </div>
                )}

                {editType === "BUSINESS_CARD" && (
                  <div className="space-y-4">
                    {/* Tổng tiền đã xác nhận */}
                    <div className="flex items-center justify-begin mb-2">
                      <span className="px-3 py-2 text-base font-semibold rounded-md bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                        Tổng tiền đã xác nhận:&nbsp;
                        {formatCurrency(
                          (businessPayments || [])
                            .filter((p) => p.active)
                            .reduce(
                              (sum, p) => sum + (parseFloat(p.price) || 0),
                              0
                            )
                        )}{" "}
                        VNĐ
                      </span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
                      {(businessPayments || []).map((payment, idx) => (
                        <div
                          key={payment.id || idx}
                          className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                        >
                          {/* Name */}
                          <div className="w-full sm:w-1/4">
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                              Tên khoản thanh toán
                            </label>
                            <input
                              type="text"
                              value={payment.name || ""}
                              onChange={(e) =>
                                handlePaymentArrayInputChange(
                                  "business",
                                  idx,
                                  "name",
                                  e.target.value
                                )
                              }
                              readOnly={
                                payment.active || payment.createdAt != null
                              }
                              disabled={payment.createdAt}
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
                              value={payment.description || ""}
                              onChange={(e) =>
                                handlePaymentArrayInputChange(
                                  "business",
                                  idx,
                                  "description",
                                  e.target.value
                                )
                              }
                              readOnly={
                                payment.active || payment.createdAt != null
                              }
                              disabled={payment.createdAt}
                              className="w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                            />
                          </div>
                          {/* Price */}
                          <div className="flex-1">
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                              Tiền doanh nghiệp (VNĐ)
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={payment.price}
                              onChange={(e) =>
                                handlePaymentArrayInputChange(
                                  "business",
                                  idx,
                                  "price",
                                  e.target.value
                                )
                              }
                              readOnly={
                                payment.active || payment.createdAt != null
                              }
                              disabled={payment.createdAt}
                              className="w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                            />
                          </div>
                          {/* Ngày tạo */}
                          <div className="w-full sm:w-1/4">
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                              Ngày tạo
                            </label>
                            <input
                              type="text"
                              value={
                                payment.createdAt
                                  ? formatDateTime(payment.createdAt)
                                  : "Chưa có ngày tạo"
                              }
                              readOnly
                              className="w-full px-3 py-2 text-sm border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                            />
                          </div>
                          {/* Nút thao tác */}
                          <div className="w-full flex justify-end items-center gap-3 mt-4">
                            {!payment.active ? (
                              <>
                                {payment.createdAt == null ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdatePayment(payment, idx)
                                      }
                                      className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                    >
                                      Lưu thay đổi
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeletePayment("business", idx)
                                      }
                                      className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                                    >
                                      Xóa
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleConfirmPayment(payment)
                                      }
                                      className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                                    >
                                      Xác nhận
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleCancelPayment(payment)
                                      }
                                      className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                                    >
                                      Xóa
                                    </button>
                                  </>
                                )}
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleCancelPayment(payment)}
                                  className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                                >
                                  Xóa
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddPayment("business")}
                      className="flex items-center px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      <PlusIcon className="w-4 h-4 mr-1" />
                      Thêm thanh toán
                    </button>
                  </div>
                )}
              </div>
            </div>
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