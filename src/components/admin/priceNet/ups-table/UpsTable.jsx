import ComponentCard from "../../common/ComponentCard";
import PageBreadcrumb from "../../common/PageBreadCrumb";
import ContentTable from "./ContentTable.jsx"; // Đã sửa từ .tsx thành .jsx

export default function ZoneCountryTable() {

    return (
        <>
            <PageBreadcrumb pageTitle="Ups " />
            <div className="space-y-5 sm:space-y-6">
                <ComponentCard title="Price Net Table" >
                    <ContentTable />
                </ComponentCard>
            </div>
        </>
    );
}