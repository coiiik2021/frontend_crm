import PageBreadcrumb from "../../../components/admin/common/PageBreadCrumb";
import ComponentCard from "../../../components/admin/common/ComponentCard";
import LineChartOne from "../../../components/admin/charts/line/LineChartOne";
import LineChartTwo from "../../../components/admin/charts/line/LineChartTwo";
import LineChartThree from "../../../components/admin/charts/line/LineChartThree";
import PageMeta from "../../../components/admin/common/PageMeta";

export default function LineChart() {
  return (
    <>
      <PageMeta
        title="React.js Chart Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Chart Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Line Chart" />
      <div className="space-y-6">
        <ComponentCard title="Line Chart 1">
          <LineChartOne />
        </ComponentCard>
        <ComponentCard title="Line Chart 2">
          <LineChartTwo />
        </ComponentCard>
        <ComponentCard title="Line Chart 3">
          <LineChartThree />
        </ComponentCard>
      </div>
    </>
  );
}
