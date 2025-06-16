import { GetDashboardUser } from "../../../service/api.admin.service";
import Button from "../../admin/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../admin/ui/table";
import { useEffect, useState } from "react";

// Định nghĩa interface cho dữ liệu bảng
interface DashboardUserData {
  nameCountry: string;
  totalDebit: number;
  totalBill: number;
  percentage: number;
}

export default function RecentOrderAnalytics() {
  const [tableData, setTableData] = useState<DashboardUserData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    GetDashboardUser()
      .then((res: any) => {
        setTableData(res || []);
      })
      .catch(() => setTableData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] ">
      <div className="px-4 pt-4 sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Recent Orders
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline">
              <svg
                className="stroke-current fill-white dark:fill-gray-800"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.29004 5.90393H17.7067"
                  stroke=""
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17.7075 14.0961H2.29085"
                  stroke=""
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                  fill=""
                  stroke=""
                  strokeWidth="1.5"
                />
                <path
                  d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                  fill=""
                  stroke=""
                  strokeWidth="1.5"
                />
              </svg>
              Filter
            </Button>
            <Button size="sm" variant="outline">
              See all
            </Button>
          </div>
        </div>
      </div>
      <div className="max-w-full ">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 border-y dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-500 sm:px-6 text-start text-theme-xs dark:text-gray-400"
                >
                  Country
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-500 sm:px-6 text-start text-theme-xs dark:text-gray-400"
                >
                  Tổng đơn
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-500 sm:px-6 text-start text-theme-xs dark:text-gray-400"
                >
                  Tổng Debit
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-gray-500 sm:px-6 text-start text-theme-xs dark:text-gray-400"
                >
                  Phần trăm
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : tableData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                tableData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-4 py-3 font-medium text-gray-800 sm:px-6 text-start text-theme-sm dark:text-white/90">
                      {item.nameCountry}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 sm:px-6 text-start text-theme-sm dark:text-gray-400">
                      {item.totalBill}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm sm:px-6 text-start text-success-600">
                      ${item.totalDebit.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm sm:px-6 text-start text-success-600">
                      {item.percentage}%
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}