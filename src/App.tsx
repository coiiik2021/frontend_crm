import { BrowserRouter as Router, Routes, Route } from "react-router";
import Ecommerce from "./pages/ADMIN/Dashboard/Ecommerce";
import Stocks from "./pages/ADMIN/Dashboard/Stocks";
import Crm from "./pages/ADMIN/Dashboard/Crm";
import Marketing from "./pages/ADMIN/Dashboard/Marketing";
import Analytics from "./pages/ADMIN/Dashboard/Analytics";
import SignIn from "./pages/ADMIN/AuthPages/SignIn";
import SignUp from "./pages/ADMIN/AuthPages/SignUp";
import NotFound from "./pages/ADMIN/OtherPage/NotFound";
// import UserProfiles from "./pages/UserProfiles";
import Carousel from "./pages/ADMIN/UiElements/Carousel";
import Maintenance from "./pages/ADMIN/OtherPage/Maintenance";
import FiveZeroZero from "./pages/ADMIN/OtherPage/FiveZeroZero";
import FiveZeroThree from "./pages/ADMIN/OtherPage/FiveZeroThree";
import Videos from "./pages/ADMIN/UiElements/Videos";
import Images from "./pages/ADMIN/UiElements/Images";
import Alerts from "./pages/ADMIN/UiElements/Alerts";
import Badges from "./pages/ADMIN/UiElements/Badges";
import Pagination from "./pages/ADMIN/UiElements/Pagination";
import Avatars from "./pages/ADMIN/UiElements/Avatars";
import Buttons from "./pages/ADMIN/UiElements/Buttons";
import ButtonsGroup from "./pages/ADMIN/UiElements/ButtonsGroup";
import Notifications from "./pages/ADMIN/UiElements/Notifications";
import LineChart from "./pages/ADMIN/Charts/LineChart";
import BarChart from "./pages/ADMIN/Charts/BarChart";
import PieChart from "./pages/ADMIN/Charts/PieChart";
import Invoices from "./pages/ADMIN/Invoices";
import ComingSoon from "./pages/ADMIN/OtherPage/ComingSoon";
import FileManager from "./pages/ADMIN/FileManager";
import Calendar from "./pages/ADMIN/Calendar";
import BasicTables from "./pages/ADMIN/Tables/BasicTables";
import DataTables from "./pages/ADMIN/Tables/DataTables";
import PricingTables from "./pages/ADMIN/PricingTables";
import Faqs from "./pages/ADMIN/Faqs";
import Chats from "./pages/ADMIN/Chat/Chats";
import FormElements from "./pages/ADMIN/Forms/FormElements";
import FormLayout from "./pages/ADMIN/Forms/FormLayout";
import Blank from "./pages/ADMIN/Blank";
import EmailInbox from "./pages/ADMIN/Email/EmailInbox";
import EmailDetails from "./pages/ADMIN/Email/EmailDetails";

import TaskKanban from "./pages/ADMIN/Task/TaskKanban";
import BreadCrumb from "./pages/ADMIN/UiElements/BreadCrumb";
import Cards from "./pages/ADMIN/UiElements/Cards";
import Dropdowns from "./pages/ADMIN/UiElements/Dropdowns";
import Links from "./pages/ADMIN/UiElements/Links";
import Lists from "./pages/ADMIN/UiElements/Lists";
import Popovers from "./pages/ADMIN/UiElements/Popovers";
import Progressbar from "./pages/ADMIN/UiElements/Progressbar";
import Ribbons from "./pages/ADMIN/UiElements/Ribbons";
import Spinners from "./pages/ADMIN/UiElements/Spinners";
import Tabs from "./pages/ADMIN/UiElements/Tabs";
import Tooltips from "./pages/ADMIN/UiElements/Tooltips";
import Modals from "./pages/ADMIN/UiElements/Modals";
import ResetPassword from "./pages/ADMIN/AuthPages/ResetPassword";
import TwoStepVerification from "./pages/ADMIN/AuthPages/TwoStepVerification";
import Success from "./pages/ADMIN/OtherPage/Success";
import AppLayoutAdmin from "./layout/admin/AppLayoutAdmin";
import { ScrollToTop } from "./components/admin/common/ScrollToTop";
import TaskList from "./pages/ADMIN/Task/TaskList";
import Saas from "./pages/ADMIN/Dashboard/Saas";
import UserProfiles from "./pages/ADMIN/UserProfiles.jsx";
import ShipmentTable from "./components/admin/shipment-table/ShipmentTable.jsx";
import ShipmentDetail from "./components/admin/shipment-detail/ShipmentDetail";
import AppLayoutClient from "./layout/client/AppLayoutClient";
import HomePage from "./pages/client/HomePage.jsx";
import GetAQuote from "./part/GetAQuote.jsx";
import OrderPage from "./pages/client/Order/OrderPage.jsx";
import ManagerTable from "./components/admin/manager-table/ManagerTable.jsx";
import SaleTable from "./components/admin/sale-table/SaleTable";
import UserTable from "./components/admin/user-table/UserTable.jsx";
import UpsTable from "./components/admin/priceNet/ups-table/UpsTable.jsx";
import DhlTable from "./components/admin/priceNet/dhl-table/DhlTable.jsx";
import SfTable from "./components/admin/priceNet/sf-table/SfTable.jsx";
import FedexTable from "./components/admin/priceNet/fedex-table/FedexTable.jsx";
import ZoneCountryTable from "./components/admin/priceNet/zone-country/ZoneCountryTable.jsx";
import BillTable from "./components/admin/bills/BillTable.jsx";
import ProtectedRoute from './ProtectedRoute';
import BillContent from "./components/admin/bills/BillContent.jsx";
import CsTable from "./components/admin/cs-table/CsTable";
import TransporterTable from "./components/admin/transporter-table/TransporterTable";
import AccountantTable from "./components/admin/accountant-table/AccountantTable";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "EMPLOYEE", "CS", "TRANSPORTER"]}>
              <AppLayoutAdmin />
            </ProtectedRoute>
          }>
            <Route index path="/quan-ly" element={<Ecommerce />} />
            <Route path="/quan-ly/analytics" element={<Analytics />} />
            <Route path="/quan-ly/marketing" element={<Marketing />} />
            <Route path="/quan-ly/crm" element={<Crm />} />
            <Route path="/quan-ly/stocks" element={<Stocks />} />
            <Route path="/quan-ly/saas" element={<Saas />} />

            {/* Others Page */}
            <Route path="/quan-ly/profile" element={<UserProfiles />} />

            <Route path="/quan-ly/user-table" element={<UserTable />} />
            <Route path="/quan-ly/manager-table" element={<ManagerTable />} />
            <Route path="/quan-ly/sale-table" element={<SaleTable />} />

            <Route path="/quan-ly/ups-table" element={<UpsTable />} />
            <Route path="/quan-ly/dhl-table" element={<DhlTable />} />
            <Route path="/quan-ly/fedex-table" element={<FedexTable />} />
            <Route path="/quan-ly/sf-table" element={<SfTable />} />
            <Route path="/quan-ly/bill-content/:id" element={<BillContent />} />

            <Route
              path="/quan-ly/zone-country"
              element={<ZoneCountryTable />}
            />



            <Route path="/calendar" element={<Calendar />} />
            <Route path="/invoice" element={<Invoices />} />
            <Route path="/faq" element={<Faqs />} />
            <Route path="/pricing-tables" element={<PricingTables />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />
            <Route path="/form-layout" element={<FormLayout />} />

            {/* Applications */}
            <Route path="/chat" element={<Chats />} />

            <Route path="/task-list" element={<TaskList />} />
            <Route path="/task-kanban" element={<TaskKanban />} />
            <Route path="/file-manager" element={<FileManager />} />

            {/* Email */}

            <Route path="/inbox" element={<EmailInbox />} />
            <Route path="/inbox-details" element={<EmailDetails />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />
            <Route path="/data-tables" element={<DataTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/breadcrumb" element={<BreadCrumb />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/buttons-group" element={<ButtonsGroup />} />
            <Route path="/cards" element={<Cards />} />
            <Route path="/carousel" element={<Carousel />} />
            <Route path="/dropdowns" element={<Dropdowns />} />
            <Route path="/images" element={<Images />} />
            <Route path="/links" element={<Links />} />
            <Route path="/list" element={<Lists />} />
            <Route path="/modals" element={<Modals />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/pagination" element={<Pagination />} />
            <Route path="/popovers" element={<Popovers />} />
            <Route path="/progress-bar" element={<Progressbar />} />
            <Route path="/ribbons" element={<Ribbons />} />
            <Route path="/spinners" element={<Spinners />} />
            <Route path="/tabs" element={<Tabs />} />
            <Route path="/tooltips" element={<Tooltips />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
            <Route path="/pie-chart" element={<PieChart />} />
          </Route>
          <Route element={<AppLayoutClient />}>
            <Route index path="/" element={<HomePage />} />
            <Route index path="/gia-van-chuyen" element={<GetAQuote />} />
          </Route>

          <Route element={
            <ProtectedRoute allowedRoles={["USER"]}>
              <AppLayoutClient />
            </ProtectedRoute>
          }>
            <Route index path="/tao-don-hang" element={<OrderPage />} />
          </Route>

          {/* Dashboard Layout */}

          <Route element={

            <ProtectedRoute allowedRoles={["ADMIN", "USER", "MANAGER", "TRANSPORTER", "CS", "ACCOUNTANT"]}>
              <AppLayoutAdmin />
            </ProtectedRoute>
          }>
            <Route path="/quan-ly/shipment" element={<BillTable />} />

            <Route
              path="/quan-ly/shipment-detail"
              element={<ShipmentDetail />}
            />

            <Route path="/quan-ly/my-debits" element={<ShipmentTable />} />
          </Route>

          <Route element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <AppLayoutAdmin />
            </ProtectedRoute>
          }>
            <Route path="/quan-ly/user-table" element={<UserTable />} />

            <Route path="/quan-ly/cs-table" element={<CsTable />} />
            <Route path="/quan-ly/transporter-table" element={<TransporterTable />} />
            <Route path="/quan-ly/accountant-table" element={<AccountantTable />} />

            {/* Others Page */}
            <Route path="/quan-ly/profile" element={<UserProfiles />} />
          </Route>


          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/two-step-verification"
            element={<TwoStepVerification />}
          />
          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/success" element={<Success />} />
          <Route path="/five-zero-zero" element={<FiveZeroZero />} />
          <Route path="/five-zero-three" element={<FiveZeroThree />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
        </Routes>
      </Router >
    </>
  );
}
