import PortfolioPerformance from "../../../components/admin/charts/line/PortfolioPerformance";
import PageMeta from "../../../components/admin/common/PageMeta";
import DividendChart from "../../../components/admin/stocks/DividendChart";
import LatestTransactions from "../../../components/admin/stocks/LatestTransactions";
import StockMetricsList from "../../../components/admin/stocks/StockMetricsList";
import TrendingStocks from "../../../components/admin/stocks/TrendingStocks";
import WatchList from "../../../components/admin/stocks/WatchList";

export default function Stocks() {
  return (
    <>
      <PageMeta
        title="React.js Stocks Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Stocks Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          {/* <!-- Metric Group Five --> */}
          <StockMetricsList />
          {/* <!-- Metric Group Five --> */}
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-8">
          {/* <!-- ====== Chart Fourteen Start --> */}
          <div>
            <PortfolioPerformance />
          </div>
          {/* <!-- ====== Chart Fourteen End --> */}
          {/* <!-- ====== Trending Stocks Start --> */}
          <TrendingStocks />
          {/* <!-- ====== Trending Stocks End --> */}
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-4">
          {/* <!-- ====== Chart Fifteen Start --> */}
          <DividendChart />
          {/* <!-- ====== Chart Fifteen End --> */}
          {/* <!-- ====== Chart Fifteen Start --> */}
          <WatchList />
          {/* <!-- ====== Chart Fifteen End --> */}
        </div>

        <div className="col-span-12">
          {/* <!-- Table Five --> */}
          <LatestTransactions />
        </div>
      </div>
    </>
  );
}
