import ComponentCard from "../../common/ComponentCard";
import PageBreadcrumb from "../../common/PageBreadCrumb";
import ContentTable from "./ContentTable.jsx"; // Đã sửa từ .tsx thành .jsx

export default function SfTable() {

    return (
        <>
            <PageBreadcrumb pageTitle="Price NET SF" />
            <div className="space-y-5 sm:space-y-6">
                <ComponentCard title="SF Table">
                    <ContentTable />
                </ComponentCard>
            </div>
        </>
    );
}