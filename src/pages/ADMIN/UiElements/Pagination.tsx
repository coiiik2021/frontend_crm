import PageBreadcrumb from "../../../components/admin/common/PageBreadCrumb";
import PaginationExample from "../../../components/admin/ui/pagination";
import PageMeta from "../../../components/admin/common/PageMeta";

export default function Pagination() {
  return (
    <div>
      <PageMeta
        title="React.js  Pagination | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Pagination  page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Pagination" />
      <PaginationExample />
    </div>
  );
}
