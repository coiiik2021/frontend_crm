import PageBreadcrumb from "../../../components/admin/common/PageBreadCrumb";
import ComponentCard from "../../../components/admin/common/ComponentCard";
import PageMeta from "../../../components/admin/common/PageMeta";
import BasicTableOne from "../../../components/admin/tables/BasicTables/BasicTableOne";
import BasicTableTwo from "../../../components/admin/tables/BasicTables/BasicTableTwo";
import BasicTableThree from "../../../components/admin/tables/BasicTables/BasicTableThree";
import BasicTableFour from "../../../components/admin/tables/BasicTables/BasicTableFour";
import BasicTableFive from "../../../components/admin/tables/BasicTables/BasicTableFive";

export default function BasicTables() {
  return (
    <>
      <PageMeta
        title="React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Basic Tables" />
      <div className="space-y-6">
        <ComponentCard title="Basic Table 1">
          <BasicTableOne />
        </ComponentCard>
        <ComponentCard title="Basic Table 2">
          <BasicTableTwo />
        </ComponentCard>
        <ComponentCard title="Basic Table 3">
          <BasicTableThree />
        </ComponentCard>
        <ComponentCard title="Basic Table 4">
          <BasicTableFour />
        </ComponentCard>
        <ComponentCard title="Basic Table 5">
          <BasicTableFive />
        </ComponentCard>
      </div>
    </>
  );
}
