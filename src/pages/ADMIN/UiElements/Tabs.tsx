import PageBreadcrumb from "../../../components/admin/common/PageBreadCrumb";
import TabExample from "../../../components/admin/ui/tabs";
import PageMeta from "../../../components/admin/common/PageMeta";

export default function Tabs() {
  return (
    <>
      <PageMeta
        title="React.js Spinners Tabs | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Tabs page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Tabs" />
      <TabExample />
    </>
  );
}
