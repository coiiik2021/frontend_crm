import ComponentCard from "../../common/ComponentCard";
import PageBreadcrumb from "../../common/PageBreadCrumb";
import ContentTable from "./ContentTable.jsx"; // Đã sửa từ .tsx thành .jsx

export default function ZoneCountryTable() {

    return (
        <>
            <PageBreadcrumb pageTitle="Zone Country" />
            <div className="space-y-5 sm:space-y-6">
                <ComponentCard title="Zone Country Table">
                    <ContentTable />
                </ComponentCard>
            </div>
        </>
    );
}