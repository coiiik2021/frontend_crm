import ComponentCard from "../../common/ComponentCard";
import PageBreadcrumb from "../../common/PageBreadCrumb";
import ContentTable from "./ContentTable.jsx"; // Đã sửa từ .tsx thành .jsx

export default function ChuyenTuyenTable() {

    return (
        <>
            <PageBreadcrumb pageTitle="Price NET Chuyên Tuyến" />
            <div className="space-y-5 sm:space-y-6">
                <ComponentCard title="Chuyên tuyến Table">
                    <ContentTable />
                </ComponentCard>
            </div>
        </>
    );
}