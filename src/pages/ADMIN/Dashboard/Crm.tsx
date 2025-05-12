import CrmStatisticsChart from "../../../components/admin/crm/CrmStatisticsChart";
import CrmMetrics from "../../../components/admin/crm/CrmMetrics";
import CrmRecentOrder from "../../../components/admin/crm/CrmRecentOrderTable";
import UpcomingSchedule from "../../../components/admin/crm/UpcomingSchedule";
import SalePieChart from "../../../components/admin/crm/SalePieChart";
import EstimatedRevenue from "../../../components/admin/crm/EstimatedRevenue";
import PageMeta from "../../../components/admin/common/PageMeta";

export default function Crm() {
  return (
    <>
      <PageMeta
        title="React.js CRM Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js CRM Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          {/* <!-- Metric Group Four --> */}
          <CrmMetrics />
          {/* <!-- Metric Group Four --> */}
        </div>

        <div className="col-span-12 xl:col-span-8">
          {/* <!-- ====== Chart Eleven Start --> */}
          <CrmStatisticsChart />
          {/* <!-- ====== Chart Eleven End --> */}
        </div>

        <div className="col-span-12 xl:col-span-4">
          {/* <!-- ====== Chart Twelve Start --> */}
          <EstimatedRevenue />
          {/* <!-- ====== Chart Twelve End --> */}
        </div>

        <div className="col-span-12 xl:col-span-6">
          {/* <!-- ====== Chart Thirteen Start --> */}
          <SalePieChart />
          {/* <!-- ====== Chart Thirteen End --> */}
        </div>

        <div className="col-span-12 xl:col-span-6">
          {/* <!-- ====== Upcoming Schedule Start --> */}
          <UpcomingSchedule />
          {/* <!-- ====== Upcoming Schedule End --> */}
        </div>

        <div className="col-span-12">
          {/* <!-- Table Four --> */}
          <CrmRecentOrder />
          {/* <!-- Table Four --> */}
        </div>
      </div>
    </>
  );
}
