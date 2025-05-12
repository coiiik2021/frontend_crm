import PageBreadcrumb from "../../../components/admin/common/PageBreadCrumb";
import ComponentCard from "../../../components/admin/common/ComponentCard";
import PieChartOne from "../../../components/admin/charts/pie/PieChartOne";
import PieChartTwo from "../../../components/admin/charts/pie/PieChartTwo";
import PageMeta from "../../../components/admin/common/PageMeta";

export default function PieChart() {
  return (
    <div>
      <PageMeta
        title="React.js Chart Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Chart Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Pie Chart" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ComponentCard title="Bar Chart 1">
          <PieChartOne />
        </ComponentCard>
        <ComponentCard title="Bar Chart 2">
          <PieChartTwo />
        </ComponentCard>
      </div>
    </div>
  );
}
