import ComponentCard from "../../common/ComponentCard";
import PageBreadcrumb from "../../common/PageBreadCrumb";
import ContentTable from "./ContentTable.jsx"; // Đã sửa từ .tsx thành .jsx

export default function DhlTable() {

    return (
        <>
            <PageBreadcrumb pageTitle="Price NET DHL" />
            <div className="space-y-5 sm:space-y-6">
                <ComponentCard title="DHL Table">
                    <ContentTable />
                </ComponentCard>
            </div>
        </>
    );
}