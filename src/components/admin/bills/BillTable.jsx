import ComponentCard from "../common/ComponentCard";
import PageBreadcrumb from "../common/PageBreadCrumb";
import ContentTable from "./ContentTable.jsx";
import { useEffect, useState } from "react";
import {
  GetAllBaseUser,
  GetAllBill,
} from "../../../service/api.admin.service.jsx";
import { NavLink } from "react-router";

const PlusIcon = (
  <svg
    className="w-5 h-5 mr-2 -ml-1"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

export default function BillTable() {
  const [dataBill, setDataBill] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const dataBill = await GetAllBill();
      console.log("dataBill", dataBill);
      setDataBill(dataBill);
    };
    loadData();
  }, []);

  return (
    <>
      <PageBreadcrumb pageTitle="ALL BILL User" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title={
          <div className="flex items-center justify-between">
            <span>Bill</span>
            <NavLink
              to="/tao-don-hang"
              className="flex items-center gap-2 ml-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold shadow hover:from-blue-600 hover:to-purple-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ textDecoration: "none" }}
            >
              {PlusIcon}
              <span>Tạo đơn</span>
            </NavLink>
          </div>
        }>
          <ContentTable data={dataBill} />
        </ComponentCard>
      </div>
    </>
  );
}
