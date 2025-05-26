import ComponentCard from "../common/ComponentCard";
import PageBreadcrumb from "../common/PageBreadCrumb";
import ContentTable from "./ContentTable.jsx";
import {useEffect, useState} from "react";
import {GetAllBaseUser, GetAllBill} from "../../../service/api.admin.service.jsx";

export default function BillTable() {
    const [dataBill, setDataBill] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            const dataBill = await GetAllBill();
            console.log("dataBill", dataBill);
            setDataBill(dataBill);
        }
        loadData();
    }, [])

    return (
        <>
            <PageBreadcrumb pageTitle="ALL BILL User" />
            <div className="space-y-5 sm:space-y-6">
                <ComponentCard title="Bill">
                    <ContentTable dataBill={dataBill}  />
                </ComponentCard>
            </div>
        </>
    );
}