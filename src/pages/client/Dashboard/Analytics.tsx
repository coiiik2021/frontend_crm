import RecentOrderAnalytics from "../../../components/client/analytics/RecentOrderAnalytics";
import DemographicCard from "../../../components/client/ecommerce/DemographicCard";
import TopPages from "../../../components/client/analytics/TopPages";
import TopChannel from "../../../components/client/analytics/TopChannel";
import AnalyticsMetrics from "../../../components/client/analytics/AnalyticsMetrics";
import ActiveUsersChart from "../../../components/client/analytics/ActiveUsersChart";
import AnalyticsBarChart from "../../../components/client/analytics/AnalyticsBarChart";
import AcquisitionChannelChart from "../../../components/client/analytics/AcquisitionChannelChart";
import SessionChart from "../../../components/client/analytics/SessionChart";
import PageMeta from "../../../components/client/common/PageMeta";

export default function Analytics() {
  return (
    <>
      <PageMeta
        title="React.js Analytics Dashboard | Tailclient - React.js Admin Dashboard Template"
        description="This is React.js Analytics Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* <div className="col-span-12">
          <AnalyticsMetrics />
        </div>
        <div className="col-span-12">
          <AnalyticsBarChart />
        </div>
        <div className="col-span-12 xl:col-span-7">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <TopChannel />
            <TopPages />
          </div>
        </div>
        <div className="col-span-12 xl:col-span-5">
          <ActiveUsersChart />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <AcquisitionChannelChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <SessionChart />
        </div> */}

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-12">
          <RecentOrderAnalytics />
        </div>


      </div>
    </>
  );
}
