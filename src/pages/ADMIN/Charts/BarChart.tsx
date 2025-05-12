import PageBreadcrumb from "../../../components/admin/common/PageBreadCrumb";
import ComponentCard from "../../../components/admin/common/ComponentCard";
import BarChartOne from "../../../components/admin/charts/bar/BarChartOne";
import BarChartTwo from "../../../components/admin/charts/bar/BarChartTwo";
import PageMeta from "../../../components/admin/common/PageMeta";

export default function BarChart() {
  return (
    <div>
      <PageMeta
        title="React.js Chart Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Chart Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Bar Chart" />
      <div className="space-y-6">
        <ComponentCard title="Bar Chart 1">
          <BarChartOne />
        </ComponentCard>
        <ComponentCard title="Bar Chart 2">
          <BarChartTwo />
        </ComponentCard>
      </div>
    </div>
  );
}
