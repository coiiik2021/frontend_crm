import PageBreadcrumb from "../../../components/admin/common/PageBreadCrumb";
import TooltipExample from "../../../components/admin/ui/tooltip";
import PageMeta from "../../../components/admin/common/PageMeta";

export default function Tooltips() {
  return (
    <div>
      <PageMeta
        title="React.js Tooltips Tabs | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Tabs  page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Tooltips" />
      <TooltipExample />
    </div>
  );
}
