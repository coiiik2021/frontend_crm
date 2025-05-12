import PageBreadcrumb from "../../../components/admin/common/PageBreadCrumb";
import LinksExample from "../../../components/admin/links";
import PageMeta from "../../../components/admin/common/PageMeta";

export default function Links() {
  return (
    <>
      <PageMeta
        title="React.js Links Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Links page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Links" />
      <LinksExample />
    </>
  );
}
