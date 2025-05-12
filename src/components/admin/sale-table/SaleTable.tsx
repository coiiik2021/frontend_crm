import PageBreadcrumb from "../common/PageBreadCrumb.js";
import ComponentCard from "../common/ComponentCard.js";
import ContentTable from "./ContentTable.js";

export default function SaleTable() {

    return (
        <>
            <PageBreadcrumb pageTitle="Tables User" />
            <div className="space-y-5 sm:space-y-6">
                <ComponentCard title="User">
                    <ContentTable />
                </ComponentCard>
            </div>
        </>
    );
}