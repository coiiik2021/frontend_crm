import { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import InformationOrder from "../../../components/client/order/InformationOrder";
import Products from "../../../components/client/order/Products";
import FormDetailOrder from "../../../components/client/order/FormDetailOrder";
import * as XLSX from "xlsx";

export default function OrderPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [recipientInfo, setRecipientInfo] = useState({
        name: "",
        company: "",
        email: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        postCode: "",
        country: ""
    });
    const [packages, setPackages] = useState([
        {
            id: 1,
            length: "",
            width: "",
            height: "",
            weight: "",
            dim: 0,
            total: {
                totalWeight: 0,
                OverSize: "NO FEE",
                realVolume: 0
            }
        }
    ]);

    // Products state
    const [products, setProducts] = useState([
        {
            id: 1,
            description: "",
            quantity: 0,
            origin: "",
            unit: "",
            price: 0,
            totalPrice: 0,
        }
    ]);
    const [productsTotal, setProductsTotal] = useState({
        quantity: 1,
        price: 0,
        priceProduct: 0
    });
    const [productsErrors, setProductsErrors] = useState({});

    // Selected service state
    const [selectedService, setSelectedService] = useState(null);

    const handleStepChange = (newStep) => {
        // Clear product errors when changing steps
        if (newStep === 3) {
            setProductsErrors({});
        }
        setCurrentStep(newStep);
    };

    const exportToExcel = () => {
        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([
            // Header
            ["INVOICE"],
            [""],
            ["Date:", new Date().toLocaleDateString()],
            ["Invoice No:", `INV-${Date.now()}`],
            [""],
            // Recipient Information
            ["Recipient Information"],
            ["Name:", recipientInfo.name],
            ["Company:", recipientInfo.company],
            ["Email:", recipientInfo.email],
            ["Phone:", recipientInfo.phone],
            ["Address:", `${recipientInfo.street}, ${recipientInfo.city}, ${recipientInfo.state}, ${recipientInfo.postCode}`],
            ["Country:", recipientInfo.country],
            [""],
            // Package Information
            ["Package Information"],
            ["Total Packages:", packages.length],
            ["Total Weight:", packages.reduce((sum, pkg) => sum + (parseFloat(pkg.weight) || 0), 0).toFixed(2) + " kg"],
            ["Dimensions:", packages.map(pkg => `${pkg.length}*${pkg.width}*${pkg.height}`).join(", ")],
            [""],
            // Products Table Header
            ["Products"],
            ["No.", "Description", "Origin", "Quantity", "Unit", "Price", "Total"],
            // Products Data
            ...products.map((product, index) => [
                index + 1,
                product["Mô tả sản phẩm"],
                product["Xuất xứ"],
                product["Số lượng"],
                product["Kiểu đơn vị"],
                product["Giá trên 1 sản phẩm"],
                product["Giá Trị"]
            ]),
            [""],
            // Totals
            ["Total Products:", productsTotal.quantity],
            ["Total Value:", productsTotal.priceProduct + " USD"],
            [""],
            // Service Information
            ["Service Information"],
            ["Selected Service:", selectedService?.name || "Not selected"],
            ["Service Price:", selectedService?.price || "0 USD"]
        ]);

        // Set column widths
        const colWidths = [
            { wch: 5 },  // No.
            { wch: 40 }, // Description
            { wch: 15 }, // Origin
            { wch: 10 }, // Quantity
            { wch: 10 }, // Unit
            { wch: 15 }, // Price
            { wch: 15 }  // Total
        ];
        ws['!cols'] = colWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, "Invoice");

        // Generate filename with date
        const fileName = `Invoice_${new Date().toISOString().split('T')[0]}.xlsx`;

        // Save file
        XLSX.writeFile(wb, fileName);
    };

    let content = null;
    if (currentStep === 2) {
        content = (
            <InformationOrder
                recipientInfo={recipientInfo}
                setRecipientInfo={setRecipientInfo}
                packages={packages}
                setPackages={setPackages}
                currentStep={currentStep}
                setCurrentStep={handleStepChange}
                setSelectedService={setSelectedService}
            />
        );
    }
    else if (currentStep === 3) {
        content = (
            <Products
                products={products}
                setProducts={setProducts}
                productsTotal={productsTotal}
                setProductsTotal={setProductsTotal}
                productsErrors={productsErrors}
                setProductsErrors={setProductsErrors}
            />
        );
    }
    else if (currentStep === 4) {
        content = (
            <div>
                <div className="flex justify-end mb-4">
                    <button
                        onClick={exportToExcel}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Xuất Invoice Excel
                    </button>
                </div>
                <FormDetailOrder
                    recipientInfo={recipientInfo}
                    packages={packages}
                    products={products}
                    productsTotal={productsTotal}
                    selectedService={selectedService}
                    weight={packages.reduce((sum, pkg) => {
                        const weight = parseFloat(pkg.weight) || 0;
                        return sum + weight;
                    }, 0).toFixed(1)}
                    dimensions={packages.map(pkg => {
                        const length = pkg.length || 0;
                        const width = pkg.width || 0;
                        const height = pkg.height || 0;
                        return `${length}*${width}*${height}`;
                    }).join(", ")}
                />
            </div>
        );
    }
    else content = <div>Shipment Details</div>;

    return (
        <div style={{ margin: '0 10px', padding: '10px' }}>
            <Header currentStep={currentStep} setCurrentStep={handleStepChange} />
            {content}
            {currentStep !== 2 && <Footer
                currentStep={currentStep}
                setCurrentStep={handleStepChange}
                products={products}
                productsErrors={productsErrors}
                setProductsErrors={setProductsErrors}
            />}
        </div>
    )
};