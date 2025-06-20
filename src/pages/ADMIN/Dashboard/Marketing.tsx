import TrafficStats from "../../../components/admin/marketing/TrafficStats";
import MarketingMetricsCards from "../../../components/admin/marketing/MarketingMetricsCards";
import TrafficSource from "../../../components/admin/marketing/TrafficSource";
import ImpressionChart from "../../../components/admin/marketing/ImpressionChart";
import FeaturedCampaign from "../../../components/admin/marketing/FeaturedCampaign";
import PageMeta from "../../../components/admin/common/PageMeta";

export default function Marketing() {
  return (
    <>
      <PageMeta
        title="React.js Marketing Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Marketing Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          {/* <!-- Metric Group Three --> */}
          <MarketingMetricsCards />
          {/* <!-- Metric Group Three --> */}
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-8">
          {/* <!-- ====== Chart Eight Start --> */}
          <ImpressionChart />
          {/* <!-- ====== Chart Eight End --> */}

          {/* <!-- ====== Table Three Start --> */}
          <FeaturedCampaign />
          {/* <!-- ====== Table Three End --> */}
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-4">
          {/* <!-- ====== Traffic Stats Start --> */}

          <TrafficStats />
          {/* <!-- ====== Traffic Stats End --> */}

          {/* <!-- ====== Traffic Source Start --> */}
          <TrafficSource />
          {/* <!-- ====== Traffic Source End --> */}
        </div>
      </div>
    </>
  );
}
