import { useState } from "react";
import InvoiceContent from "./invoice/InvoiceContent";
import InvoiceHomeBill from "./invoice/InvoiceHomeBill";
import ShippingDocumentContent from "./Shipping Document/ShippinggDocumentContent";
import { useParams } from "react-router";

const BillContent = () => {
  const [activeTab, setActiveTab] = useState("homebill");
  const { id } = useParams<{ id: string }>();

  const renderContent = () => {
    switch (activeTab) {
      case "homebill":
        return <InvoiceHomeBill />;
      case "shipmark":
        return <div>shipmark Content</div>;
      case "awb":
        return <div>awb Content</div>;
      case "invoice":
        return <InvoiceContent />;
      case "invoiceOther":
        return <ShippingDocumentContent bill_id={id || ""} />; // Replace with actual bill_id as needed
      default:
        return <InvoiceHomeBill />;
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-around bg-gray-100 p-4 border-b border-gray-300">
        <button
          onClick={() => setActiveTab("homebill")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg ${
            activeTab === "homebill"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Home Bill
        </button>
        <button
          onClick={() => setActiveTab("shipmark")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg ${
            activeTab === "shipmark"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          shipping mark
        </button>
        <button
          onClick={() => setActiveTab("awb")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg ${
            activeTab === "awb"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          awb
        </button>
        <button
          onClick={() => setActiveTab("invoice")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg ${
            activeTab === "invoice"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Invoice
        </button>

        <button
          onClick={() => setActiveTab("invoiceOther")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg ${
            activeTab === "invoiceOther"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Invoice Other
        </button>
      </div>

      {/* Nội Dung */}
      <div className="p-4">{renderContent()}</div>
    </div>
  );
};

export default BillContent;
