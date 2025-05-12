import ComponentCard from "../../common/ComponentCard";
import PageBreadcrumb from "../../common/PageBreadCrumb";
import ContentTable from "./ContentTable.jsx"; // Đã sửa từ .tsx thành .jsx

export default function FedexTable() {

    return (
        <>
            <PageBreadcrumb pageTitle="Price NET Fedex" />
            <div className="space-y-5 sm:space-y-6">
                <ComponentCard title="Fedex Table">
                    <ContentTable />
                </ComponentCard>
            </div>
        </>
    );
}