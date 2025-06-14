import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import PageBreadcrumb from "../../common/PageBreadCrumb";
import ContentTable from "./ContentTable.jsx"; // Đã sửa từ .tsx thành .jsx

export default function SeaTable() {
    const [isPriceNetPackage, setIsPriceNetPackage] = useState(true);


    return (
        <>
            <PageBreadcrumb pageTitle="Sea " />
            <div className="space-y-5 sm:space-y-6">
                <ComponentCard title="Price Net Table" >
                    <ContentTable isPriceNetPackage={isPriceNetPackage} setIsPriceNetPackage={setIsPriceNetPackage} />
                </ComponentCard>
            </div>
        </>
    );
}