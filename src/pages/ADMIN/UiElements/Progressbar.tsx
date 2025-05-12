import PageBreadcrumb from "../../../components/admin/common/PageBreadCrumb";
import ProgressBarExample from "../../../components/admin/ui/progressbar";
import PageMeta from "../../../components/admin/common/PageMeta";

export default function Progressbar() {
  return (
    <>
      <PageMeta
        title="React.js List Progressbar | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Popover page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Progressbar" />
      <ProgressBarExample />
    </>
  );
}
