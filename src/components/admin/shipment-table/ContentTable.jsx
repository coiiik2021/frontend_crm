"use client";

import { useState, useMemo, useEffect } from "react";

import { NavLink } from "react-router";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import PaginationWithIcon from "../tables/DataTables/TableOne/PaginationWithIcon";
import { Modal } from "../ui/modal/index.js";
import Label from "../form/Label.js";
import Input from "../form/input/InputField.js";
import { useModal } from "../../../hooks/useModal.js";
import { GetAllBaseUser, PostBaseUser } from "../../../service/api.admin.service.jsx";
import Button from "../../../elements/Button/index.jsx";

export default function ContentTable(props) {
    const { dataBill } = props;
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortKey, setSortKey] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");
    const [searchTerm, setSearchTerm] = useState("");

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

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortOrder("asc");
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
                                    { key: "payment_bill_real", label: "Thành tiền (trước)" },
                                    { key: "payment_bill_fake", label: "Thành tiền (sau)" },
                                    { key: "packageInfo_end", label: "PACKAGE CHỐT" },
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

                                    {/* Thành tiền */}
                                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {formatCurrency(item.total_real)} VNĐ
                                    </TableCell>

                                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {formatCurrency(item.total_fake)} VNĐ
                                    </TableCell>



                                    {/* Package chốt */}
                                    <TableCell className="px-6 py-4 whitespace-nowrap">
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                <span className="font-medium">SL:</span> {item.packageInfo_end.quantity}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                <span className="font-medium">Cân nặng:</span> {item.packageInfo_end.total_weight} KG
                                            </p>
                                        </div>
                                    </TableCell>

                                    {/* Trạng thái */}
                                    <TableCell className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={item.status_payment} />
                                    </TableCell>
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
        </div>
    );
}
