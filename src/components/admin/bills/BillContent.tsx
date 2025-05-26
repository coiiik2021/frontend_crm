import { useState } from "react";
import InvoiceContent from "./invoice/InvoiceContent";
import ShippingDocumentContent from "./Shipping Document/ShippinggDocumentContent";
import { useParams } from "react-router";

const BillContent = () => {
    const [activeTab, setActiveTab] = useState("shipmad");
    const { id } = useParams<{ id: string }>();

    const renderContent = () => {
        switch (activeTab) {
            case "shipmad":
                return <div>Shipmad Content</div>;
            case "invoice":
                return <InvoiceContent />;
            case "chungtu":
                return <div>Chứng từ Content</div>;
            case "chungtukhac":
                return <ShippingDocumentContent bill_id={id || ""} />; // Replace with actual bill_id as needed
            default:
                return <div>Shipmad Content</div>;
        }
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex justify-around bg-gray-100 p-4 border-b border-gray-300">
                <button
                    onClick={() => setActiveTab("shipmad")}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg ${activeTab === "shipmad"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                        }`}
                >
                    Shipmad
                </button>
                <button
                    onClick={() => setActiveTab("invoice")}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg ${activeTab === "invoice"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                        }`}
                >
                    Invoice
                </button>
                <button
                    onClick={() => setActiveTab("chungtu")}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg ${activeTab === "chungtu"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                        }`}
                >
                    Chứng từ
                </button>
                <button
                    onClick={() => setActiveTab("chungtukhac")}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg ${activeTab === "chungtukhac"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                        }`}
                >
                    Chứng từ khác
                </button>
            </div>

            {/* Nội Dung */}
            <div className="p-4">{renderContent()}</div>
        </div>
    );
};

export default BillContent;