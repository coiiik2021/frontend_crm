import EcommerceMetrics from "../../../components/client/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../../components/client/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../../components/client/ecommerce/StatisticsChart";
import MonthlyTarget from "../../../components/client/ecommerce/MonthlyTarget";
import RecentOrders from "../../../components/client/ecommerce/RecentOrders";
import DemographicCard from "../../../components/client/ecommerce/DemographicCard";
import PageMeta from "../../../components/client/common/PageMeta";

export default function Ecommerce() {
  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />

          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}
