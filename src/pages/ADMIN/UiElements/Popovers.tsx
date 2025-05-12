import PageBreadcrumb from "../../../components/admin/common/PageBreadCrumb";
import PageMeta from "../../../components/admin/common/PageMeta";
import PopoverExample from "../../../components/admin/ui/popover";

export default function Popovers() {
  return (
    <div>
      <PageMeta
        title="React.js List Popover | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Popover  page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Popovers" />
      <PopoverExample />
    </div>
  );
}
