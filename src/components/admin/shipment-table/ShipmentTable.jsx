import PageBreadcrumb from "../common/PageBreadCrumb.tsx";
import ComponentCard from "../common/ComponentCard.tsx";
import { GetAllBill } from "../../../service/api.admin.service.jsx";
import { useEffect, useState } from "react";
import ContentTable from "./ContentTable.jsx";

export default function ShipmentTable() {

    const [dataBill, setDataBill] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            const dataBill = await GetAllBill();
            setDataBill(dataBill);
        }
        loadData();
    }, [])
    return (
        <>
            <PageBreadcrumb pageTitle="Shipment" />
            <div className="space-y-5 sm:space-y-6">
                <ComponentCard title="Shipments ">
                    <ContentTable dataBill={dataBill} />
                </ComponentCard>
            </div>
        </>
    )
}