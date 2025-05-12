import ComponentCard from "../common/ComponentCard";
import PageBreadcrumb from "../common/PageBreadCrumb";
import ContentTable from "./ContentTable.jsx";

export default function UserTable() {

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