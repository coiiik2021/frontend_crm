import PageBreadcrumb from "../common/PageBreadCrumb.tsx";
import ComponentCard from "../common/ComponentCard.tsx";
import ContentTable from "./ContentTable.jsx";

export default function ShipmentTable() {
  return (
    <>
      <PageBreadcrumb pageTitle="Shipment" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Shipments ">
          <ContentTable />
        </ComponentCard>
      </div>
    </>
  );
}
