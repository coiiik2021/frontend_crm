"use client";

import { useState, useMemo, useEffect } from "react";

import { NavLink } from "react-router";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import PaginationWithIcon from "../tables/DataTables/TableOne/PaginationWithIcon";
import { Modal } from "../ui/modal/index.js";
import Label from "../form/Label.js";
import Input from "../form/input/InputField.js";
import { useModal } from "../../../hooks/useModal.js";
import {
    GetAllBaseUser,
    PostBaseUser,

    UpdateBillCS,
    UpdateBillTRANSPORTER
} from "../../../service/api.admin.service.jsx";
import Button from "../../../elements/Button/index.jsx";
import { PlusIcon, TrashIcon, XIcon } from "lucide-react";
import { jwtDecode } from "jwt-decode";



export default function ContentTable(props) {

    const { dataBill } = props;
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortKey, setSortKey] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");
    const [searchTerm, setSearchTerm] = useState("");

    const [authorities, setAuthorities] = useState([]);


    const [billEdit, setBillEdit] = useState({});

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = jwtDecode(token);
            setAuthorities(decoded.authorities);
        }
    }, [])

    function StatusBadge({ status }) {
        // Kiểm tra nếu status là null/undefined thì gán giá trị mặc định
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
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        );
    }

    function ArrowsUpDownIcon({ className }) {
        return (
            <svg className={className} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414zM10 3a1 1 0 011 1v10a1 1 0 11-2 0V4a1 1 0 011-1z" clipRule="evenodd" />
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

    const { isOpen, openModal, closeModal } = useModal();


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
                    width: pkg.width
                }))
            }
            const dataResponse = await UpdateBillTRANSPORTER(dataRequest);
            console.log(dataResponse);
            currentData.map((item) => {
                if (item.bill_house === bill.bill_house) {
                    item.packageInfo_end = dataResponse.packageInfo_end;
                }
            })
        }
        if (authorities.includes("CS") || authorities.includes("ADMIN")) {
            const updatedBill = {
                id: bill.bill_house,
                bill_employee: bill.bill_employee,
                awb: bill.awb,
                status: bill.status,
            }
            await UpdateBillCS(updatedBill);
            currentData.map((item) => {
                if (item.bill_house === bill.bill_house) {
                    console.log(item);
                    item.bill_employee = bill.bill_employee;
                    item.awb = bill.awb;
                    item.status = bill.status;
                }
            })
        }
        closeModal();


    }

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
                                    { key: "information_human", label: "THÔNG TIN NGƯỜI" },
                                    { key: "bill_employee", label: "BILL PHỤ" },
                                    { key: "awb", label: "AWB" },
                                    { key: "company_service", label: "DỊCH VỤ" },
                                    { key: "country_name", label: "NƯỚC ĐẾN" },
                                    { key: "packageInfo_begin", label: "PACKAGE KHAI BÁO" },
                                    { key: "packageInfo_end", label: "PACKAGE CHỐT" },

                                    { key: "status", label: "TRẠNG THÁI" },
                                    { key: "Action", label: (authorities.includes("ADMIN") || authorities.includes("CS") || authorities.includes("TRANSPORTER")) ? "Cập nhật thông tin" : "" }



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
                                            to={`/quan-ly/bill-content/${item.bill_house}`}
                                            className="font-medium text-brand-600 dark:text-brand-400 hover:underline"
                                        >
                                            EB{item.bill_house.substring(0, 5)}
                                        </NavLink>
                                    </TableCell>

                                    {/* Thông tin người */}
                                    <TableCell className="px-6 py-4 whitespace-nowrap">
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                <span className="font-medium">Người gửi:</span> {item.information_human.from}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                <span className="font-medium">Người nhận:</span> {item.information_human.to}
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
                                                <span className="font-medium">SL:</span> {item.packageInfo_begin.quantity}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                <span className="font-medium">Cân nặng:</span> {item.packageInfo_begin.total_weight} KG
                                            </p>
                                        </div>
                                    </TableCell>

                                    {/* Package chốt */}
                                    <TableCell className="px-6 py-4 whitespace-nowrap">
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                <span className="font-medium">SL:</span> {item?.packageInfo_end?.quantity}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                <span className="font-medium">Cân nặng:</span> {item?.packageInfo_end?.total_weight} KG
                                            </p>
                                        </div>
                                    </TableCell>



                                    {/* Trạng thái */}
                                    <TableCell className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={item.status} />
                                    </TableCell>
                                    <TableCell className="px-6 py-4 whitespace-nowrap">
                                        {item.status !== "Hoàn thành" && (authorities.includes("ADMIN") || authorities.includes("CS") || authorities.includes("TRANSPORTER")) ? (
                                            <Button
                                                variant="primary"
                                                className="w-full md:w-auto px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                                                onClick={() => {
                                                    setBillEdit(item);
                                                    openModal();
                                                }}
                                            >
                                                Sửa
                                            </Button>
                                        ) : <></>}

                                    </TableCell>
                                </TableRow>
                            ))}
                            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[800px] m-4">
                                <div className="relative w-full p-6 bg-white rounded-2xl dark:bg-gray-800 shadow-xl">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                            Hóa đơn: HB{billEdit.bill_house?.substring(0, 5)}
                                        </h3>
                                        <button
                                            onClick={closeModal}
                                            className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                                        >
                                            <XIcon className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Form */}
                                    <form className="space-y-6">


                                        {/* Package Section */}
                                        {
                                            (authorities.includes("TRANSPORTER") || authorities.includes("ADMIN")) && (
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                KG Chốt (SL: {billEdit.packageInfo_end?.quantity || 0} /{" "}
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
                                                                    width: ""
                                                                };
                                                                setBillEdit({
                                                                    ...billEdit,
                                                                    packages: [...(billEdit.packages || []), newPackage]
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
                                                                            setBillEdit({ ...billEdit, packages: updatedPackages });
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
                                                                            const updatedPackages = [...billEdit.packages];
                                                                            updatedPackages[index].length = e.target.value;
                                                                            setBillEdit({ ...billEdit, packages: updatedPackages });
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
                                                                            const updatedPackages = [...billEdit.packages];
                                                                            updatedPackages[index].height = e.target.value;
                                                                            setBillEdit({ ...billEdit, packages: updatedPackages });
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
                                                                            const updatedPackages = [...billEdit.packages];
                                                                            updatedPackages[index].width = e.target.value;
                                                                            setBillEdit({ ...billEdit, packages: updatedPackages });
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
                                                                                const updatedPackages = billEdit.packages.filter((_, i) => i !== index);
                                                                                setBillEdit({ ...billEdit, packages: updatedPackages });
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
                                            )
                                        }
                                        {
                                            (authorities.includes("CS") || authorities.includes("ADMIN")) && (
                                                (
                                                    <>
                                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                            {/* Bill Phụ */}
                                                            <div className="space-y-2" hidden>
                                                                <Label className="text-sm font-medium">Bill Phụ</Label>
                                                                <Input
                                                                    type="text"
                                                                    value={billEdit.id || ""}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium">Bill Phụ</Label>
                                                                <Input
                                                                    type="text"
                                                                    value={billEdit.bill_employee || ""}
                                                                    onChange={(e) => setBillEdit({ ...billEdit, bill_employee: e.target.value })}
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
                                                                    onChange={(e) => setBillEdit({ ...billEdit, awb: e.target.value })}
                                                                    placeholder="Nhập AWB"
                                                                    className="w-full"
                                                                />
                                                            </div>
                                                        </div>
                                                        {/* Status */}
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium">Trạng thái</Label>
                                                            <select
                                                                value={billEdit.status || ""}
                                                                onChange={(e) => setBillEdit({ ...billEdit, status: e.target.value })}
                                                                className="w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            >
                                                                <option value="complete">Hoàn thành</option>
                                                                <option value="waiting">Chờ xử lý</option>
                                                                <option value="processing">Đã tiếp nhận hàng</option>
                                                                <option value="shipping">Vận chuyển</option>
                                                                <option value="cancelled">Đã hủy</option>
                                                            </select>
                                                        </div>

                                                    </>
                                                )
                                            )
                                        }

                                        {/* Action Buttons */}
                                        <div className="flex justify-end pt-4 space-x-3 border-t dark:border-gray-700">
                                            <button
                                                type="button"
                                                onClick={closeModal}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                                            >
                                                Đóng
                                            </button>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    await handleUpdateBill(billEdit);
                                                }}
                                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                Lưu thay đổi
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </Modal>
                        </TableBody>
                    </Table >
                </div >
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
        </div >
    );
}
