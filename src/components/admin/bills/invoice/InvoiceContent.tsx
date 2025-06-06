import InvoiceDetail from "./InvoiceDetail";
import LayoutInvoice from "./LayoutInvoice";

export default function InvoiceContent({ bill_id }: { bill_id: string }) {
  return (
    <div>
      {/* <PageMeta
                title="React.js Invoices Dashboard | TailAdmin - Next.js Admin Dashboard Template"
                description="This is React.js Invoices Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            /> */}
      <LayoutInvoice pageTitle="Invoices" />
      <InvoiceDetail bill_id={bill_id} />
    </div>
  );
}
