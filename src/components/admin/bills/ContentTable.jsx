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
import Label from "../form/Label.js";
import Input from "../form/input/InputField.js";
import { useModal } from "../../../hooks/useModal.js";
import {
  GetAllBaseUser,
  PostBaseUser,
  UpdateBillCS,
  UpdateBillTRANSPORTER,
  GetAllBill,
} from "../../../service/api.admin.service.jsx";
import Button from "../../../elements/Button/index.jsx";
import { PlusIcon, TrashIcon, XIcon, InfoIcon, EyeIcon } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import InvoiceHomeBill from "./invoice/InvoiceHomeBill.jsx";
import Invoice from "../invoice/Invoice";
import BillContent from "./BillContent";
import { set } from "date-fns";
import * as ExcelJS from "exceljs";
import { useLoading } from "../../../hooks/useLoading";

// Thêm component OrderDetailModal với tabs
const OrderDetailModal = ({ isOpen, onClose, orderData }) => {
  const [activeTab, setActiveTab] = useState("info");

  if (!orderData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-md m-4"
      showCloseButton={false}
    >
      <div className="relative w-full p-4 bg-white rounded-xl dark:bg-gray-800 shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            EB{orderData.bill_house?.substring(0, 5)}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-3">
          <button
            className={`px-3 py-2 text-xs font-medium ${activeTab === "info"
              ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            onClick={() => setActiveTab("info")}
          >
            Thông tin người
          </button>
          <button
            className={`px-3 py-2 text-xs font-medium ${activeTab === "package"
              ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            onClick={() => setActiveTab("package")}
          >
            Thông tin package
          </button>
          <button
            className={`px-3 py-2 text-xs font-medium ${activeTab === "other"
              ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            onClick={() => setActiveTab("other")}
          >
            Thông tin khác
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-3 text-sm">
          {activeTab === "info" && (
            <div className="space-y-3">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Người gửi:</p>
                <p className="font-medium">
                  {orderData.information_human?.from || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">Người nhận:</p>
                <p className="font-medium">
                  {orderData.information_human?.to || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">Địa chỉ gửi:</p>
                <p className="font-medium">
                  {orderData.information_human?.addressFrom || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">
                  Địa chỉ nhận:
                </p>
                <p className="font-medium">
                  {orderData.information_human?.addressTo || "N/A"}
                </p>
              </div>
            </div>
          )}

          {activeTab === "package" && (
            <div className="space-y-3">
              <div className="border-b pb-2 mb-2 border-gray-200 dark:border-gray-700">
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Package khai báo:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Số lượng:
                    </p>
                    <p className="font-medium">
                      {orderData.packageInfo_begin?.quantity || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Cân nặng:
                    </p>
                    <p className="font-medium">
                      {orderData.packageInfo_begin?.total_weight || 0} KG
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Package chốt:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Số lượng:
                    </p>
                    <p className="font-medium">
                      {orderData.packageInfo_end?.quantity || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Cân nặng:
                    </p>
                    <p className="font-medium">
                      {orderData.packageInfo_end?.total_weight || 0} KG
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Cân nặng tính phí:
                    </p>
                    <p className="font-medium">
                      {orderData.packageInfo_end?.total_weight_charge || 0} KG
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Package Kết thúc:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Số lượng:
                    </p>
                    <p className="font-medium">
                      {orderData.packageInfo_end?.quantity || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Cân nặng:
                    </p>
                    <p className="font-medium">
                      {orderData.packageInfo_end?.total_weight || 0} KG
                    </p>
                  </div>
                </div>
              </div>

              {/* {orderData.packages && orderData.packages.length > 0 && (
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chi tiết package:
                  </p>
                  <div className="space-y-2">
                    {orderData.packages.map((pkg, index) => (
                      <div
                        key={index}
                        className="text-xs bg-gray-50 dark:bg-gray-700/30 p-2 rounded"
                      >
                        <p>
                          Package {index + 1}: {pkg.weight} KG
                        </p>
                        <p>
                          Kích thước: {pkg.length}x{pkg.width}x{pkg.height}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}
            </div>
          )}

          {activeTab === "other" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Bill phụ:</p>
                  <p className="font-medium">
                    {orderData.bill_employee || "Đang cập nhật..."}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">AWB:</p>
                  <p className="font-medium">
                    {orderData.awb || "Đang cập nhật..."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Dịch vụ:</p>
                  <p className="font-medium">
                    {orderData.company_service || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Nước đến:</p>
                  <p className="font-medium">
                    {orderData.country_name || "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">Trạng thái:</p>
                <p className="font-medium">{orderData.status || "N/A"}</p>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">Ngày tạo:</p>
                <p className="font-medium">{orderData.date_create || "N/A"}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <NavLink
            to={`/quan-ly/bill-content/${orderData.bill_house}`}
            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Xem chi tiết đầy đủ →
          </NavLink>
        </div>
      </div>
    </Modal>
  );
};


// Thêm component cho tooltip thông tin nhanh
const OrderInfoTooltip = ({ isVisible, orderData, position, onClose }) => {
  if (!isVisible || !orderData) return null;

  return (
    <div
      className="absolute z-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-80"
      style={{
        top: position.y + 10,
        left: position.x + 10,
        animation: "fadeIn 0.2s ease-in-out",
      }}
    >
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
            {orderData.bill_house
              ? `EB${orderData.bill_house.substring(0, 5)}`
              : "Chi tiết"}
          </h4>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Bill phụ:</p>
              <p className="font-medium">{orderData.bill_employee || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">AWB:</p>
              <p className="font-medium">{orderData.awb || "N/A"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Dịch vụ:</p>
              <p className="font-medium">
                {orderData.company_service || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Nước đến:</p>
              <p className="font-medium">{orderData.country_name || "N/A"}</p>
            </div>
          </div>

          <div>
            <p className="text-gray-500 dark:text-gray-400">Trạng thái:</p>
            <p className="font-medium">{orderData.status || "N/A"}</p>
          </div>

          <div>
            <p className="text-gray-500 dark:text-gray-400">Ngày tạo:</p>
            <p className="font-medium">{orderData.created_at || "N/A"}</p>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              onClose();
              // Thêm logic để mở modal chi tiết đầy đủ ở đây
            }}
            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Xem chi tiết đầy đủ →
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ContentTable({ data }) {
  const [dataBill, setDataBill] = useState(data || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");

  const [authorities, setAuthorities] = useState([]);

  // Thêm state mới cho sidebar file
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileSidebar, setShowFileSidebar] = useState(false);
  const [billContent, setBillContent] = useState(null);
  const sidebarRef = useRef(null);

  // Thêm state cho modal chi tiết đơn hàng
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Thêm state cho tooltip thông tin nhanh
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Thêm state để theo dõi đơn hàng đang được xem
  const [highlightedOrderId, setHighlightedOrderId] = useState(null);

  // Thêm state để theo dõi trạng thái modal sửa đơn hàng
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Thêm state để quản lý resize và hiển thị nút resize
  const [sidebarWidth, setSidebarWidth] = useState(700);
  const [isResizing, setIsResizing] = useState(false);
  const { loading, withLoading } = useLoading();

  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Mouse events
  const handleMouseDown = (e) => {
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


  const fetchBillData = async () => {
    try {
      await withLoading(
        async () => {
          const data = await GetAllBill();
          setDataBill(data);
        },
        "Tải dữ liệu thành công",
        "Lỗi khi tải dữ liệu"
      )
      console.log("Dữ liệu hóa đơn:", dataBill);
      // setState hoặc xử lý tiếp tại đây nếu cần
    } catch (error) {
      console.error("Lỗi khi gọi GetShipment:", error);
    }
  };
  useEffect(() => {
    setDataBill(data || []);
  }, [data]);
  // Thêm state để quản lý các cột hiển thị
  const [visibleColumns, setVisibleColumns] = useState({
    house_bill: true,
    information_human: true,
    bill_employee: true,
    awb: true,
    company_service: true,
    country_name: true,
    packageInfo_begin: true,
    packageInfo_end: true,
    packageInfo_finish: true,
    status: true,
    Action: true,
    File: true,
    Detail: true,
  });

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

  // Hàm xử lý resize đơn giản
  const resizeTimeout = useRef();

  const doDrag = (e) => {
    if (resizeTimeout.current) return;
    resizeTimeout.current = setTimeout(() => {
      const newWidth = startWidth + (startX - e.clientX);
      setSidebarWidth(Math.max(700, Math.min(newWidth, 1230)));
      resizeTimeout.current = null;
    }, 16); // ~60fps
  };

  const startResize = (e) => {
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const doDrag = (e) => {
      if (resizeTimeout.current) return;
      resizeTimeout.current = setTimeout(() => {
        const newWidth = startWidth + (startX - e.clientX);
        setSidebarWidth(Math.max(700, Math.min(newWidth, 1230)));
        resizeTimeout.current = null;
      }, 16); // ~60fps
    };

    const stopDrag = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
      if (resizeTimeout.current) {
        clearTimeout(resizeTimeout.current);
        resizeTimeout.current = null;
      }
    };

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  // Thêm CSS khi đang resize
  useEffect(() => {
    if (isResizing) {
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  const [billEdit, setBillEdit] = useState({});

  const [editErrors, setEditErrors] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setAuthorities(decoded.authorities);
    }
  }, []);

  function StatusBadge({ status }) {
    // Kiểm tra nếu status là null/undefined thì gán giá trị mặc định
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
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
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
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414zM10 3a1 1 0 011 1v10a1 1 0 11-2 0V4a1 1 0 011-1z"
          clipRule="evenodd"
        />
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

  const currentData = filteredAndSortedData.slice(startIndex, endIndex);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const { isOpen, openModal, closeModal } = useModal();

  const {
    isOpen: isOpenPackages,
    openModal: openModalPackages,
    closeModal: closeModalPackages,
  } = useModal();

  const handleViewOrderDetail = (order) => {
    setHighlightedOrderId(null);

    setSelectedOrder(order);
    setShowOrderDetail(true);
    setHighlightedOrderId(order.bill_house);
  };

  const handleShowTooltip = (order, event) => {
    if (!showOrderDetail) {
      setHighlightedOrderId(order.bill_house);
    }

    setSelectedOrder(order);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
    setShowTooltip(true);
  };

  const handleCloseTooltip = () => {
    setShowTooltip(false);

    if (!showOrderDetail && !showFileSidebar) {
      setHighlightedOrderId(null);
    } else if (showOrderDetail) {
      setHighlightedOrderId(selectedOrder?.bill_house || null);
    } else if (showFileSidebar) {
    }
  };

  const handleCloseModal = () => {
    setShowOrderDetail(false);

    if (!showFileSidebar) {
      setHighlightedOrderId(null);
    }
  };

  const handleViewFile = (item) => {
    setHighlightedOrderId(null);

    setSelectedFile({
      name: `File ${item.bill_house}`,
      awb: item.awb || "Không có thông tin AWB",
    });
    setShowFileSidebar(true);
    setBillContent(item);
    setHighlightedOrderId(item.bill_house);
  };

  const handleCloseSidebar = () => {
    setShowFileSidebar(false);
    setBillContent(null);
    if (!showOrderDetail) {
      setHighlightedOrderId(null);
    } else {
      setHighlightedOrderId(selectedOrder?.bill_house || null);
    }
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleUpdateBill = async (bill) => {
    if (["TRANSPORTER", "ADMIN"].some(role => authorities.includes(role))) {
      const dataRequest = {
        id: bill.bill_house,
        package_end: bill.packages.map((pkg) => ({
          weight: pkg.weight,
          length: pkg.length,
          height: pkg.height,
          width: pkg.width,
        })),
        end: !isFinish,
      };
      const dataResponse = await UpdateBillTRANSPORTER(dataRequest);
      console.log(dataResponse);
      currentData.map((item) => {
        if (item.bill_house === bill.bill_house) {
          item.packageInfo_end = dataResponse.packageInfo_end;
        }
      });
    }
    if (authorities.includes("CS") || authorities.includes("ADMIN")) {
      const updatedBill = {
        id: bill.bill_house,
        bill_employee: bill.bill_employee,
        awb: bill.awb,
        status: bill.status,
      };
      await UpdateBillCS(updatedBill);
      currentData.map((item) => {
        if (item.bill_house === bill.bill_house) {
          console.log(item);
          item.bill_employee = bill.bill_employee;
          item.awb = bill.awb;
          item.status = bill.status;
        }
      });
    }
    closeModal();
  };

  const [isFinish, setIsFinish] = useState(false);

  const [namePackages, setNamePackages] = useState("Chốt");

  const setupEditPackages = (item) => {
    setHighlightedOrderId(null);
    setBillEdit(item);

    openModalPackages();
    setIsEditModalOpen(true);
    setHighlightedOrderId(item.bill_house);
  };

  const handleOpenEditPackageModal = (item) => {
    setIsFinish(item.isFinish);
    setNamePackages(item.isFinish ? "Kết thúc" : "Chốt");
    setupEditPackages(item);
  };

  const handleCloseEditModalPackages = () => {
    closeModalPackages();
    setIsEditModalOpen(false);

    if (!showOrderDetail && !showFileSidebar) {
      setHighlightedOrderId(null);
    } else if (showOrderDetail) {
      setHighlightedOrderId(selectedOrder?.bill_house || null);
    } else if (showFileSidebar) {
      setHighlightedOrderId(selectedFile?.name?.replace("File ", "") || null);
    }
  };

  // Hàm lưu thay đổi
  const handleSaveChanges = async () => {

    let hasError = false;
    let allErrors = {};
    billEdit.packages.forEach((pkg, idx) => {
      const errors = validateEditPackage(pkg, idx);
      allErrors = { ...allErrors, ...errors };
      if (
        errors[`${idx}-length`] ||
        errors[`${idx}-width`] ||
        errors[`${idx}-height`] ||
        errors[`${idx}-weight`]
      ) {
        hasError = true;
      }
    });
    setEditErrors(allErrors);
    if (hasError) return;

    // Tính toán số lượng và cân nặng tổng
    const totalQuantity = billEdit.packages.length;
    const totalWeight = billEdit.packages.reduce((sum, pkg) => {
      return sum + (parseFloat(pkg.weight) || 0);
    }, 0);

    // Cập nhật thông tin package vào billEdit
    const updatedBillEdit = {
      ...billEdit,
      packageInfo_end: {
        quantity: totalQuantity,
        total_weight: totalWeight,
      },
    };

    console.log(billEdit);

    if (isFinish) {
      updatedBillEdit.packageInfo_finish = {
        quantity: totalQuantity,
        total_weight: totalWeight,
      };
    }

    console.log(updatedBillEdit);

    await handleUpdateBill(updatedBillEdit);

    // Cập nhật dữ liệu trong table
    currentData.forEach((item) => {
      if (item.bill_house === updatedBillEdit.bill_house) {
        if (isFinish) {
          item.packageInfo_finish = updatedBillEdit.packageInfo_finish;
        } else {
          item.packageInfo_end = updatedBillEdit.packageInfo_end;
        }
      }
    });

    // Đóng modal nhưng vẫn giữ highlight
    closeModalPackages();
    setIsEditModalOpen(false);

    // Giữ nguyên highlight sau khi lưu thay đổi
    // Người dùng có thể thấy rõ đơn hàng vừa được cập nhật

    fetchBillData(); // Cập nhật lại dữ liệu nếu cần
  };

  const exportToExcel = async () => {
    // Chỉ xuất các cột đang hiển thị
    const columnsToExport = [
      { key: "house_bill", label: "HOUSE BILL", width: 25 },
      { key: "information_human", label: "THÔNG TIN NGƯỜI", width: 30 },
      { key: "bill_employee", label: "BILL PHỤ", width: 15 },
      { key: "awb", label: "AWB", width: 15 },
      { key: "company_service", label: "DỊCH VỤ", width: 15 },
      { key: "country_name", label: "NƯỚC ĐẾN", width: 20 },
      { key: "packageInfo_begin", label: "PACKAGE KHAI BÁO", width: 23 },
      { key: "packageInfo_end", label: "PACKAGE CHỐT", width: 20 },
      { key: "status", label: "TRẠNG THÁI", width: 15 },
    ].filter((col) => col.key === "house_bill" || visibleColumns[col.key]);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Danh sách đơn hàng");

    // Tiêu đề chính
    const titleRow = worksheet.addRow(["DANH SÁCH ĐƠN HÀNG"]);
    worksheet.mergeCells(1, 1, 1, columnsToExport.length);
    titleRow.height = 50;
    titleRow.getCell(1).font = { size: 23, bold: true };
    titleRow.getCell(1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    // Ngày xuất
    const dateRow = worksheet.addRow([
      `Ngày xuất: ${new Date().toLocaleString("vi-VN")}`,
    ]);
    worksheet.mergeCells(2, 1, 2, columnsToExport.length);
    dateRow.getCell(1).font = { italic: true, size: 14 };
    dateRow.getCell(1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    // Header
    worksheet.addRow(columnsToExport.map((col) => col.label));
    const headerRow = worksheet.getRow(3);
    headerRow.font = { bold: true, color: { argb: "FF000000" }, size: 12 };
    headerRow.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    headerRow.height = 45;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFA6A6A7" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Định nghĩa width cho từng cột
    worksheet.columns = columnsToExport.map((col) => ({
      key: col.key,
      width: col.width,
    }));

    // Dữ liệu
    currentData.forEach((item) => {
      const row = {};
      columnsToExport.forEach((col) => {
        switch (col.key) {
          case "house_bill":
            row[col.key] = `EB${item.bill_house.substring(0, 5)}`;
            break;
          case "information_human":
            row[col.key] =
              `Người gửi: ${item.information_human?.from || ""}\n` +
              `Người nhận: ${item.information_human?.to || ""}`;
            break;
          case "bill_employee":
            row[col.key] = item.bill_employee || "";
            break;
          case "awb":
            row[col.key] = item.awb || "";
            break;
          case "company_service":
            row[col.key] = item.company_service || "";
            break;
          case "country_name":
            row[col.key] = item.country_name || "";
            break;
          case "packageInfo_begin":
            row[col.key] =
              `SL: ${item.packageInfo_begin?.quantity || 0}\n` +
              `Cân nặng: ${item.packageInfo_begin?.total_weight || 0} KG`;
            break;
          case "packageInfo_end":
            row[col.key] =
              `SL: ${item.packageInfo_end?.quantity || 0}\n` +
              `Cân nặng: ${item.packageInfo_end?.total_weight || 0} KG`;
            break;
          case "status":
            row[col.key] = item.status || "";
            break;
          default:
            row[col.key] = item[col.key] || "";
        }
      });
      const dataRow = worksheet.addRow(row);
      dataRow.height = 42;
      dataRow.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE5E7EB" } },
          left: { style: "thin", color: { argb: "FFE5E7EB" } },
          bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
          right: { style: "thin", color: { argb: "FFE5E7EB" } },
        };
        // Wrap text nếu có \n
        if (typeof cell.value === "string" && cell.value.includes("\n")) {
          cell.alignment = {
            horizontal: "left",
            vertical: "middle",
            wrapText: true,
          };
        } else {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        }
        // Căn giữa cho status
        if (columnsToExport[colNumber - 1]?.key === "status") {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        }
      });
    });

    // Tổng cộng (ví dụ: tổng số đơn hàng)
    worksheet.addRow([]);
    const summaryRow = worksheet.addRow([
      "TỔNG SỐ ĐƠN HÀNG",
      currentData.length,
      ...Array(columnsToExport.length - 2).fill(""),
    ]);
    summaryRow.font = { bold: true, size: 13 };
    summaryRow.height = 30;
    summaryRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E7EF" },
    };
    summaryRow.getCell(1).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    summaryRow.getCell(2).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E7EF" },
    };
    summaryRow.getCell(2).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    summaryRow.getCell(1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    summaryRow.getCell(2).alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    // Xuất file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `danh_sach_don_hang_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const validateEditPackage = (pkg, index) => {
    const errors = {};
    const l = parseFloat(pkg.length) || 0;
    const w = parseFloat(pkg.width) || 0;
    const h = parseFloat(pkg.height) || 0;
    const weight = parseFloat(pkg.weight) || 0;

    // Xóa lỗi cũ
    ["length", "width", "height", "weight"].forEach(f => {
      errors[`${index}-${f}`] = "";
    });

    // Kiểm tra số dương
    ["length", "width", "height", "weight"].forEach(f => {
      const val = pkg[f];
      if (val === "" || isNaN(val) || parseFloat(val) <= 0) {
        errors[`${index}-${f}`] = "Vui lòng nhập số lớn hơn 0";
      }
    });

    // Nếu weight hợp lệ thì xóa lỗi weight
    if (pkg.weight !== "" && !isNaN(pkg.weight) && parseFloat(pkg.weight) > 0) {
      errors[`${index}-weight`] = "";
    }

    // Kiểm tra logic
    if (l < w || l < h) {
      errors[`${index}-length`] = "Chiều dài phải lớn nhất (≥ rộng, cao)";
    }
    if (w > l) {
      errors[`${index}-width`] = "Rộng không được lớn hơn chiều dài";
    }
    if (h > l) {
      errors[`${index}-height`] = "Cao không được lớn hơn chiều dài";
    }

    return errors;
  };

  return (
    <div className="overflow-hidden bg-white dark:bg-white/[0.03] rounded-xl relative">
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
              <h3 className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Hiển thị cột
              </h3>
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
                          [column]: !visibleColumns[column],
                        });
                      }}
                      disabled={column === "house_bill"} // Disable checkbox nếu là house_bill
                      className={`w-4 h-4 ${column === "house_bill"
                        ? "bg-blue-600 text-blue-600 cursor-not-allowed opacity-70"
                        : "text-blue-600 bg-gray-100"
                        } border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600`}
                    />
                    <label
                      htmlFor={`col-${column}`}
                      className={`ml-2 text-sm ${column === "house_bill"
                        ? "text-gray-800 font-medium dark:text-gray-200"
                        : "text-gray-600 dark:text-gray-400"
                        }`}
                    >
                      {column === "house_bill"
                        ? "HOUSE BILL"
                        : column === "information_human"
                          ? "THÔNG TIN NGƯỜI"
                          : column === "bill_employee"
                            ? "BILL PHỤ"
                            : column === "awb"
                              ? "AWB"
                              : column === "company_service"
                                ? "DỊCH VỤ"
                                : column === "country_name"
                                  ? "NƯỚC ĐẾN"
                                  : column === "packageInfo_begin"
                                    ? "PACKAGE KHAI BÁO"
                                    : column === "packageInfo_end"
                                      ? "PACKAGE CHỐT"
                                      : column === "packageInfo_finish"
                                        ? "PACKAGE KẾT THÚC"
                                        : column === "status"
                                          ? "TRẠNG THÁI"
                                          : column === "File"
                                            ? "FILE"
                                            : column === "Detail"
                                              ? "CHI TIẾT"
                                              : column}
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

      {/* File Sidebar - phiên bản đơn giản hóa */}
      {showFileSidebar && (
        <>
          <div className="fixed inset-0  z-40" onClick={handleCloseSidebar} />
          <div
            style={{ width: `${sidebarWidth}px`, willChange: "width" }}
            className="fixed top-0 right-0 h-full bg-white dark:bg-gray-800 shadow-lg border-l border-gray-200 dark:border-gray-700 z-50 overflow-auto pt-16 group"
          >
            {/* Nút resize chỉ hiện khi hover vào sidebar */}
            <div
              className="absolute top-[55%] left-0 -translate-y-1/2 z-50 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200"
              style={{ cursor: "ew-resize" }}
              onMouseDown={startResize}
              title="Kéo để thay đổi chiều rộng"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 shadow-xl border-4 border-white transition-all duration-150 ring-2 ring-blue-300/30">
                {/* Icon mũi tên hai chiều ngang */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 12h10M7 12l3-3m-3 3l3 3m7-3l-3-3m3 3l-3 3"
                  />
                </svg>
              </div>
            </div>

            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-end mb-4">
                <button
                  onClick={handleCloseSidebar}
                  className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              <div style={isResizing ? { pointerEvents: "none" } : {}}>
                <BillContent id={billContent?.bill_house} fetchBillData={fetchBillData}></BillContent>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Table */}
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
          <Table className="w-full rounded-lg overflow-hidden shadow-sm select-none pointer-events-none"
            style={{
              WebkitUserSelect: "none",
              userSelect: "none",
              msUserSelect: "none",
            }}>
            <TableHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <TableRow>
                {[
                  { key: "house_bill", label: "HOUSE BILL" },
                  { key: "information_human", label: "THÔNG TIN NGƯỜI" },
                  { key: "bill_employee", label: "BILL PHỤ" },
                  { key: "awb", label: "AWB" },
                  { key: "company_service", label: "DỊCH VỤ" },
                  { key: "country_name", label: "NƯỚC ĐẾN" },
                  { key: "packageInfo_begin", label: "PACKAGE KHAI BÁO" },
                  { key: "packageInfo_end", label: "PACKAGE CHỐT" },
                  { key: "packageInfo_finish", label: "PACKAGE KẾT THÚC" },
                  { key: "status", label: "TRẠNG THÁI" },

                  { key: "File", label: "File" },
                  { key: "Detail", label: "Chi tiết" },
                ]
                  .filter(
                    (column) =>
                      column.key === "house_bill" || visibleColumns[column.key]
                  )
                  .map((column, i) => (
                    <TableCell
                      key={column.key}
                      isHeader
                      className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span>{column.label}</span>
                        {column.key !== "Detail" && (
                          <button
                            onClick={() => handleSort(column.key)}
                            className="pointer-events-auto select-auto ml-2 text-gray-400 hover:text-brand-500 transition-colors"
                          >
                            {sortKey === column.key ? (
                              sortOrder === "asc" ? (
                                <ChevronUpIcon className="h-4 w-4 text-brand-500" />
                              ) : (
                                <ChevronDownIcon className="h-4 w-4 text-brand-500" />
                              )
                            ) : (
                              <ArrowsUpDownIcon className="h-3 w-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </TableCell>
                  ))}
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
              {currentData.map((item, i) => (
                <TableRow
                  key={i + 1}
                  className={`transition-colors ${highlightedOrderId === item.bill_house
                    ? "bg-blue-100 border-l-4 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                >
                  {/* House Bill - luôn hiển thị */}
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`pointer-events-auto select-auto font-medium hover:underline cursor-pointer ${highlightedOrderId === item.bill_house
                        ? "text-blue-700 font-bold dark:text-blue-300"
                        : "text-brand-600 dark:text-brand-400"
                        }`}
                      onMouseEnter={(e) => handleShowTooltip(item, e)}
                      onMouseLeave={handleCloseTooltip}
                      onClick={() => handleViewOrderDetail(item)}
                    >
                      EB{item.bill_house.substring(0, 5)}
                    </div>
                  </TableCell>

                  {/* Các cột khác chỉ hiển thị khi được chọn */}
                  {visibleColumns.information_human && (
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Người gửi:</span>{" "}
                          {item.information_human.from}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Người nhận:</span>{" "}
                          {item.information_human.to}
                        </p>
                      </div>
                    </TableCell>
                  )}

                  {/* Bill phụ */}
                  {visibleColumns.bill_employee && (
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.bill_employee || "..."}
                    </TableCell>
                  )}

                  {/* AWB */}
                  {visibleColumns.awb && (
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item?.awb || "..."}
                    </TableCell>
                  )}

                  {/* Dịch vụ */}
                  {visibleColumns.company_service && (
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                        {item.company_service}
                      </span>
                    </TableCell>
                  )}

                  {/* Nước đến */}
                  {visibleColumns.country_name && (
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.country_name}
                    </TableCell>
                  )}

                  {/* Package khai báo */}
                  {visibleColumns.packageInfo_begin && (
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">SL:</span>{" "}
                          {item.packageInfo_begin.quantity}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Cân nặng:</span>{" "}
                          {item.packageInfo_begin.total_weight} KG
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Cân nặng tính phí:</span>{" "}
                          {item.packageInfo_begin.total_weight_charge} KG
                        </p>
                      </div>
                    </TableCell>
                  )}

                  {visibleColumns.packageInfo_end && (
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">SL:</span>{" "}
                            {item?.packageInfo_end?.quantity}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Cân nặng:</span>{" "}
                            {item?.packageInfo_end?.total_weight} KG
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Cân nặng tính phí:</span>{" "}
                            {item?.packageInfo_end?.total_weight_charge} KG
                          </p>
                        </div>

                        {
                          ["TRANSPORTER", "ADMIN"].some(role => authorities.includes(role)) &&
                          (<button
                            className="pointer-events-auto select-auto ml-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            title="Sửa"
                            onClick={() => {
                              setIsFinish(false);
                              handleOpenEditPackageModal({
                                ...item,

                                isFinish: false,
                              });
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="pointer-events-auto select-auto h-5 w-5 text-blue-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L5 11.828a2 2 0 010-2.828L9 13z"
                              />
                            </svg>
                          </button>)
                        }

                      </div>
                    </TableCell>
                  )}

                  {visibleColumns.packageInfo_finish && (
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">SL:</span>{" "}
                            {item.packageInfo_finish?.quantity || 0}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Cân nặng:</span>{" "}
                            {item.packageInfo_finish?.total_weight || 0} KG
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Cân nặng tính phí:</span>{" "}
                            {item.packageInfo_finish?.total_weight_charge || 0} KG
                          </p>
                        </div>
                        {
                          ["TRANSPORTER", "ADMIN"].some(role => authorities.includes(role))
                          && authorities.includes("GET_ALL_ADMIN")
                          && (
                            <button
                              className="pointer-events-auto select-auto ml-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                              title="Sửa"
                              onClick={() => {
                                setIsFinish(true);

                                handleOpenEditPackageModal({
                                  ...item,
                                  packages: item.packages_finish,
                                  isFinish: true,
                                });
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="pointer-events-auto select-auto h-5 w-5 text-blue-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L5 11.828a2 2 0 010-2.828L9 13z"
                                />
                              </svg>
                            </button>
                          )
                        }

                      </div>
                    </TableCell>
                  )}

                  {/* Trạng thái */}
                  {visibleColumns.status && (
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </TableCell>
                  )}

                  {/* File */}
                  {visibleColumns.File && (
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-2">
                        {item.files && item.files.length > 0 ? (
                          item.files.map((file, index) => (
                            <div
                              key={index}
                              className={`pointer-events-auto select-auto flex items-center space-x-2 text-sm cursor-pointer transition-colors ${highlightedOrderId === item.bill_house
                                ? "text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                : "text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
                                }`}
                              onClick={() => {
                                console.log(
                                  `Clicked file: ${file.name || `File ${index + 1}`
                                  }`,
                                  file
                                );
                                setSelectedFile({
                                  name: file.name || `File ${index + 1}`,
                                  awb: item.awb || "Không có thông tin AWB",
                                });
                                setShowFileSidebar(true);
                                setBillContent(item);
                                setHighlightedOrderId(item.bill_house);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <span className="truncate max-w-[120px]">
                                {file.name || `File ${index + 1}`}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div
                            className={`pointer-events-auto select-auto flex items-center space-x-2 text-sm cursor-pointer transition-colors ${highlightedOrderId === item.bill_house
                              ? "text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              : "text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
                              }`}
                            onClick={() => handleViewFile(item)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <span className="truncate max-w-[120px]">{`File `}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  )}

                  {/* Chi tiết */}
                  {visibleColumns.Detail && (
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewOrderDetail(item)}
                        className="pointer-events-auto select-auto flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
                      >
                        <InfoIcon className="w-4 h-4" />
                        <span>Chi tiết</span>
                      </button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* new */}
      <Modal
        isOpen={isOpenPackages}
        onClose={closeModalPackages}
        className="max-w-[800px] m-4"
      >
        <div className="relative w-full p-6 bg-white rounded-2xl dark:bg-gray-800 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              Hóa đơn: HB{billEdit.bill_house?.substring(0, 5)}
            </h3>
            <h3>{namePackages}</h3>
            <button
              onClick={handleCloseEditModalPackages}
              className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form className="space-y-6">
            {/* Package Section */}
            {["TRANSPORTER", "ADMIN"].some(role => authorities.includes(role)) && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      KG Chốt (SL:{" "}
                      {billEdit.packageInfo_end?.quantity || 0} /{" "}
                      {billEdit.packageInfo_end?.total_weight || 0} KG)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newPackage = {
                        weight: "",
                        length: "",
                        height: "",
                        width: "",
                      };
                      setBillEdit({
                        ...billEdit,
                        packages: [
                          ...(billEdit.packages || []),
                          newPackage,
                        ],
                      });
                    }}
                    className="flex items-center px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Thêm Package
                  </button>
                </div>

                {/* Package List */}
                <div className="space-y-3">
                  {billEdit.packages?.map((pkg, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 md:grid-cols-4"
                    >
                      {/* Weight */}
                      <div className="space-y-1">
                        <Label className="text-xs">Cân nặng (KG)</Label>
                        <Input
                          type="number"
                          value={pkg.weight || ""}
                          onChange={(e) => {
                            const updatedPackages = [...billEdit.packages];
                            updatedPackages[index].weight = e.target.value;
                            setBillEdit({
                              ...billEdit,
                              packages: updatedPackages,
                            });
                            // Validate ngay khi nhập
                            const errors = validateEditPackage(updatedPackages[index], index);
                            setEditErrors(prev => ({ ...prev, ...errors }));
                          }}
                          placeholder="0.00"
                          className="w-full"
                        />
                        {editErrors[`${index}-weight`] && (
                          <div className="text-xs text-red-500 mt-1">{editErrors[`${index}-weight`]}</div>
                        )}
                      </div>

                      {/* Dimensions */}
                      <div className="space-y-1">
                        <Label className="text-xs">Dài (cm)</Label>
                        <Input
                          type="number"
                          value={pkg.length || ""}
                          onChange={(e) => {
                            const updatedPackages = [...billEdit.packages];
                            updatedPackages[index].length = e.target.value;
                            setBillEdit({
                              ...billEdit,
                              packages: updatedPackages,
                            });
                            // Validate ngay khi nhập
                            const errors = validateEditPackage(updatedPackages[index], index);
                            setEditErrors(prev => ({ ...prev, ...errors }));
                          }}
                          placeholder="0.00"
                          className="w-full"
                        />
                        {editErrors[`${index}-length`] && (
                          <div className="text-xs text-red-500 mt-1">{editErrors[`${index}-length`]}</div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Rộng (cm)</Label>
                        <Input
                          type="number"
                          value={pkg.width || ""}
                          onChange={(e) => {
                            const updatedPackages = [...billEdit.packages];
                            updatedPackages[index].width = e.target.value;
                            setBillEdit({
                              ...billEdit,
                              packages: updatedPackages,
                            });
                            // Validate ngay khi nhập
                            const errors = validateEditPackage(updatedPackages[index], index);
                            setEditErrors(prev => ({ ...prev, ...errors }));
                          }}
                          placeholder="0.00"
                          className="w-full"
                        />
                        {editErrors[`${index}-width`] && (
                          <div className="text-xs text-red-500 mt-1">{editErrors[`${index}-width`]}</div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Cao (cm)</Label>
                        <Input
                          type="number"
                          value={pkg.height || ""}
                          onChange={(e) => {
                            const updatedPackages = [...billEdit.packages];
                            updatedPackages[index].height = e.target.value;
                            setBillEdit({
                              ...billEdit,
                              packages: updatedPackages,
                            });
                            // Validate ngay khi nhập
                            const errors = validateEditPackage(updatedPackages[index], index);
                            setEditErrors(prev => ({ ...prev, ...errors }));
                          }}
                          placeholder="0.00"
                          className="w-full"
                        />
                        {editErrors[`${index}-height`] && (
                          <div className="text-xs text-red-500 mt-1">{editErrors[`${index}-height`]}</div>
                        )}
                      </div>

                      {/* Delete Button (only show if more than one package) */}
                      {billEdit.packages.length > 1 && (
                        <div className="flex items-end md:col-span-4">
                          <button
                            type="button"
                            onClick={() => {
                              const updatedPackages =
                                billEdit.packages.filter(
                                  (_, i) => i !== index
                                );
                              setBillEdit({
                                ...billEdit,
                                packages: updatedPackages,
                              });
                            }}
                            className="flex items-center px-3 py-1.5 text-sm text-red-600 hover:text-red-800 dark:hover:text-red-400"
                          >
                            <TrashIcon className="w-4 h-4 mr-1" />
                            Xóa Package
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end pt-4 space-x-3 border-t dark:border-gray-700">
              <button
                type="button"
                onClick={handleCloseEditModalPackages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>

      </Modal>
      {/* Tooltip thông tin nhanh */}
      <OrderInfoTooltip
        isVisible={showTooltip}
        orderData={selectedOrder}
        position={tooltipPosition}
        onClose={handleCloseTooltip}
      />

      {/* Modal chi tiết đơn hàng với tabs */}
      <OrderDetailModal
        isOpen={showOrderDetail}
        onClose={handleCloseModal}
        orderData={selectedOrder}
      />

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
    </div>
  );
}

{
  /* Thêm CSS cho animation */
}
<style jsx>{`
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
    }
  }

  .highlighted-row {
    animation: pulse 2s infinite;
  }
`}</style>;
