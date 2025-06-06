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
} from "../../../service/api.admin.service.jsx";
import Button from "../../../elements/Button/index.jsx";
import { PlusIcon, TrashIcon, XIcon, InfoIcon, EyeIcon } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import InvoiceHomeBill from "./invoice/InvoiceHomeBill.jsx";
import Invoice from "../invoice/Invoice";
import BillContent from "./BillContent";
import { set } from "date-fns";

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
            className={`px-3 py-2 text-xs font-medium ${
              activeTab === "info"
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("info")}
          >
            Thông tin người
          </button>
          <button
            className={`px-3 py-2 text-xs font-medium ${
              activeTab === "package"
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("package")}
          >
            Thông tin package
          </button>
          <button
            className={`px-3 py-2 text-xs font-medium ${
              activeTab === "other"
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
                  {orderData.information_human?.address_from || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">
                  Địa chỉ nhận:
                </p>
                <p className="font-medium">
                  {orderData.information_human?.address_to || "N/A"}
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
                </div>
              </div>

              {orderData.packages && orderData.packages.length > 0 && (
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
              )}
            </div>
          )}

          {activeTab === "other" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Bill phụ:</p>
                  <p className="font-medium">
                    {orderData.bill_employee || "N/A"}
                  </p>
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
                <p className="font-medium">{orderData.created_at || "N/A"}</p>
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

export default function ContentTable(props) {
  const { dataBill } = props;
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

  // Hàm xử lý resize đơn giản
  const startResize = (e) => {
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const doDrag = (e) => {
      const newWidth = startWidth + (startX - e.clientX);
      setSidebarWidth(Math.max(700, Math.min(newWidth, 1230)));
    };

    const stopDrag = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
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

  // Hàm mở modal chi tiết đơn hàng
  const handleViewOrderDetail = (order) => {
    // Bỏ highlight đơn hàng cũ (nếu có)
    setHighlightedOrderId(null);

    // Sau đó mới highlight đơn hàng mới
    setSelectedOrder(order);
    setShowOrderDetail(true);
    setHighlightedOrderId(order.bill_house);
  };

  // Hàm hiển thị tooltip thông tin nhanh
  const handleShowTooltip = (order, event) => {
    // Nếu đang xem modal chi tiết, không thay đổi highlight
    if (!showOrderDetail) {
      setHighlightedOrderId(order.bill_house);
    }

    setSelectedOrder(order);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
    setShowTooltip(true);
  };

  // Hàm đóng tooltip và bỏ highlight nếu không còn xem modal
  const handleCloseTooltip = () => {
    setShowTooltip(false);

    // Chỉ bỏ highlight nếu không đang xem modal hoặc sidebar
    if (!showOrderDetail && !showFileSidebar) {
      setHighlightedOrderId(null);
    } else if (showOrderDetail) {
      // Nếu đang xem modal, đảm bảo highlight đúng đơn hàng đang xem
      setHighlightedOrderId(selectedOrder?.bill_house || null);
    } else if (showFileSidebar) {
      // Nếu đang xem sidebar, giữ nguyên highlight
    }
  };

  // Hàm đóng modal và bỏ highlight
  const handleCloseModal = () => {
    setShowOrderDetail(false);

    // Chỉ bỏ highlight nếu không đang xem sidebar
    if (!showFileSidebar) {
      setHighlightedOrderId(null);
    }
  };

  // Hàm xử lý khi xem file
  const handleViewFile = (item) => {
    // Bỏ highlight đơn hàng cũ (nếu có)
    setHighlightedOrderId(null);

    // Sau đó mới highlight đơn hàng mới
    setSelectedFile({
      name: `File ${item.bill_house}`,
      awb: item.awb || "Không có thông tin AWB",
    });
    setShowFileSidebar(true);
    setBillContent(item);
    setHighlightedOrderId(item.bill_house);
  };

  // Hàm đóng sidebar file và bỏ highlight nếu không còn xem modal
  const handleCloseSidebar = () => {
    setShowFileSidebar(false);
    setBillContent(null);
    // Chỉ bỏ highlight nếu không đang xem modal
    if (!showOrderDetail) {
      setHighlightedOrderId(null);
    } else {
      // Nếu đang xem modal, đảm bảo highlight đúng đơn hàng đang xem
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
    if (authorities.includes("TRANSPORTER") || authorities.includes("ADMIN")) {
      const dataRequest = {
        id: bill.bill_house,
        package_end: bill.packages.map((pkg) => ({
          weight: pkg.weight,
          length: pkg.length,
          height: pkg.height,
          width: pkg.width,
        })),
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

  // Hàm mở modal sửa đơn hàng
  const handleOpenEditModal = (item) => {
    // Bỏ highlight đơn hàng cũ (nếu có)
    setHighlightedOrderId(null);

    // Sau đó mới highlight đơn hàng mới
    setBillEdit(item);
    openModal();
    setIsEditModalOpen(true);
    setHighlightedOrderId(item.bill_house);
  };

  // Hàm đóng modal sửa đơn hàng
  const handleCloseEditModal = () => {
    closeModal();
    setIsEditModalOpen(false);

    // Chỉ bỏ highlight nếu không đang xem modal chi tiết hoặc sidebar
    if (!showOrderDetail && !showFileSidebar) {
      setHighlightedOrderId(null);
    } else if (showOrderDetail) {
      // Nếu đang xem modal chi tiết, đảm bảo highlight đúng đơn hàng đang xem
      setHighlightedOrderId(selectedOrder?.bill_house || null);
    } else if (showFileSidebar) {
      // Nếu đang xem sidebar, giữ nguyên highlight của đơn hàng đang xem file
      setHighlightedOrderId(selectedFile?.name?.replace("File ", "") || null);
    }
  };

  // Hàm lưu thay đổi
  const handleSaveChanges = async () => {
    await handleUpdateBill(billEdit);

    // Đóng modal nhưng vẫn giữ highlight
    closeModal();
    setIsEditModalOpen(false);

    // Giữ nguyên highlight sau khi lưu thay đổi
    // Người dùng có thể thấy rõ đơn hàng vừa được cập nhật
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
            style={{ width: `${sidebarWidth}px` }}
            className="fixed top-0 right-0 h-full bg-white dark:bg-gray-800 shadow-lg border-l border-gray-200 dark:border-gray-700 z-50 overflow-auto pt-16"
          >
            {/* Resize handle đơn giản */}
            <div
              className="absolute top-0 bottom-0 left-0 w-4 bg-transparent cursor-ew-resize z-10"
              onMouseDown={startResize}
            >
              {/* Chỉ báo trực quan */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-20 bg-blue-500 opacity-70"></div>
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
              {/*
              <div className="flex-1 p-4">
                <p className="text-gray-700 dark:text-gray-300">
                  <InvoiceHomeBill></InvoiceHomeBill>
                </p>
              </div>{" "}
              */}
              <BillContent id={billContent?.bill_house}></BillContent>

              {/* <BillContent /> */}
            </div>
          </div>
        </>
      )}

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div>
          <Table className="w-full rounded-lg overflow-hidden shadow-sm">
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

                  { key: "status", label: "TRẠNG THÁI" },
                  {
                    key: "Action",
                    label:
                      authorities.includes("ADMIN") ||
                      authorities.includes("CS") ||
                      authorities.includes("TRANSPORTER")
                        ? "Cập nhật thông tin"
                        : "",
                  },
                  { key: "File", label: "File" },
                  { key: "Detail", label: "Chi tiết" }, // Thêm cột mới
                ].map(({ key, label }) => (
                  <TableCell
                    key={key}
                    isHeader
                    className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span>{label}</span>
                      {key !== "Detail" && (
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
                  className={`transition-colors ${
                    highlightedOrderId === item.bill_house
                      ? "bg-blue-100 border-l-4 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  {/* House Bill */}
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`font-medium hover:underline cursor-pointer ${
                        highlightedOrderId === item.bill_house
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

                  {/* Thông tin người */}
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

                  {/* Bill phụ */}
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {item.bill_employee}
                  </TableCell>

                  {/* AWS */}
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {item.awb}
                  </TableCell>

                  {/* Dịch vụ */}
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                      {item.company_service}
                    </span>
                  </TableCell>

                  {/* Nước đến */}
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.country_name}
                  </TableCell>

                  {/* Package khai báo */}
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
                    </div>
                  </TableCell>

                  {/* Package chốt */}
                  <TableCell className="px-6 py-4 whitespace-nowrap">
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

                  {/* Trạng thái */}
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {item.status !== "Hoàn thành" &&
                    (authorities.includes("ADMIN") ||
                      authorities.includes("CS") ||
                      authorities.includes("TRANSPORTER")) ? (
                      <Button
                        variant="primary"
                        className="w-full md:w-auto px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                        onClick={() => handleOpenEditModal(item)}
                      >
                        Sửa
                      </Button>
                    ) : (
                      <></>
                    )}
                  </TableCell>

                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-2">
                      {item.files && item.files.length > 0 ? (
                        item.files.map((file, index) => (
                          <div
                            key={index}
                            className={`flex items-center space-x-2 text-sm cursor-pointer transition-colors ${
                              highlightedOrderId === item.bill_house
                                ? "text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                : "text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
                            }`}
                            onClick={() => {
                              console.log(
                                `Clicked file: ${
                                  file.name || `File ${index + 1}`
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
                          className={`flex items-center space-x-2 text-sm cursor-pointer transition-colors ${
                            highlightedOrderId === item.bill_house
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
                          <span className="truncate max-w-[120px]">{`File 2`}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Thêm cell mới cho nút xem chi tiết */}
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewOrderDetail(item)}
                      className={`inline-flex items-center justify-center w-7 h-7 transition-colors ${
                        highlightedOrderId === item.bill_house
                          ? "text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          : "text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
                      }`}
                      title="Xem thông tin"
                    >
                      <InfoIcon className="w-5 h-5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              <Modal
                isOpen={isOpen}
                onClose={closeModal}
                className="max-w-[800px] m-4"
              >
                <div className="relative w-full p-6 bg-white rounded-2xl dark:bg-gray-800 shadow-xl">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      Hóa đơn: HB{billEdit.bill_house?.substring(0, 5)}
                    </h3>
                    <button
                      onClick={handleCloseEditModal}
                      className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Form */}
                  <form className="space-y-6">
                    {/* Package Section */}
                    {(authorities.includes("TRANSPORTER") ||
                      authorities.includes("ADMIN")) && (
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
                                    const updatedPackages = [
                                      ...billEdit.packages,
                                    ];
                                    updatedPackages[index].weight =
                                      e.target.value;
                                    setBillEdit({
                                      ...billEdit,
                                      packages: updatedPackages,
                                    });
                                  }}
                                  placeholder="0.00"
                                  className="w-full"
                                />
                              </div>

                              {/* Dimensions */}
                              <div className="space-y-1">
                                <Label className="text-xs">Dài (cm)</Label>
                                <Input
                                  type="number"
                                  value={pkg.length || ""}
                                  onChange={(e) => {
                                    const updatedPackages = [
                                      ...billEdit.packages,
                                    ];
                                    updatedPackages[index].length =
                                      e.target.value;
                                    setBillEdit({
                                      ...billEdit,
                                      packages: updatedPackages,
                                    });
                                  }}
                                  placeholder="0.00"
                                  className="w-full"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Cao (cm)</Label>
                                <Input
                                  type="number"
                                  value={pkg.height || ""}
                                  onChange={(e) => {
                                    const updatedPackages = [
                                      ...billEdit.packages,
                                    ];
                                    updatedPackages[index].height =
                                      e.target.value;
                                    setBillEdit({
                                      ...billEdit,
                                      packages: updatedPackages,
                                    });
                                  }}
                                  placeholder="0.00"
                                  className="w-full"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Rộng (cm)</Label>
                                <Input
                                  type="number"
                                  value={pkg.width || ""}
                                  onChange={(e) => {
                                    const updatedPackages = [
                                      ...billEdit.packages,
                                    ];
                                    updatedPackages[index].width =
                                      e.target.value;
                                    setBillEdit({
                                      ...billEdit,
                                      packages: updatedPackages,
                                    });
                                  }}
                                  placeholder="0.00"
                                  className="w-full"
                                />
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
                    {(authorities.includes("CS") ||
                      authorities.includes("ADMIN")) && (
                      <>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          {/* Bill Phụ */}
                          <div className="space-y-2" hidden>
                            <Label className="text-sm font-medium">
                              Bill Phụ
                            </Label>
                            <Input type="text" value={billEdit.id || ""} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Bill Phụ
                            </Label>
                            <Input
                              type="text"
                              value={billEdit.bill_employee || ""}
                              onChange={(e) =>
                                setBillEdit({
                                  ...billEdit,
                                  bill_employee: e.target.value,
                                })
                              }
                              placeholder="Nhập Bill Phụ"
                              className="w-full"
                            />
                          </div>

                          {/* AWB */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">AWB</Label>
                            <Input
                              type="text"
                              value={billEdit.awb || ""}
                              onChange={(e) =>
                                setBillEdit({
                                  ...billEdit,
                                  awb: e.target.value,
                                })
                              }
                              placeholder="Nhập AWB"
                              className="w-full"
                            />
                          </div>
                        </div>
                        {/* Status */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Trạng thái
                          </Label>
                          <select
                            value={billEdit.status || ""}
                            onChange={(e) =>
                              setBillEdit({
                                ...billEdit,
                                status: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="complete">Hoàn thành</option>
                            <option value="waiting">Chờ xử lý</option>
                            <option value="processing">
                              Đã tiếp nhận hàng
                            </option>
                            <option value="shipping">Vận chuyển</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                        </div>
                      </>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end pt-4 space-x-3 border-t dark:border-gray-700">
                      <button
                        type="button"
                        onClick={handleCloseEditModal}
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
            </TableBody>
          </Table>
        </div>
      </div>

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
