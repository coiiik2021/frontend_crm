import { useEffect, useState } from "react";
import InvoiceMain from "./InvoiceMain";
import InvoiceSidebar from "./InvoiceSidebar";
import { useParams } from "react-router";
import axios from "axios";

type RecipientInfo = {
  name: string;
  company: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  postCode: string;
  email: string;
};

type Package = {
  weight: string;
  length: number;
  width: number;
  height: number;
};

type Product = {
  id: string;
  description: string;
  origin: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  price: number;
  totalPrice: number;
};

type SelectedService = {
  serviceName: string;
  price: number;
  details: string;
  priceNet: number;
  totalPrice: number;
  carrier: string;
  constPPXD: number;
  constVAT: number; // Added missing property
  zone: string; // Added missing property
  service: string; // Added missing property
  additionalProperty1?: string; // Add any other missing properties as optional if needed
  additionalProperty2?: number; // Example for optional properties
};

export default function InvoiceDetail({ bill_id }: { bill_id: string }) {
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo | null>(
    null
  );
  const [packages, setPackages] = useState<Package[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsTotal, setProductsTotal] = useState<{ priceProduct: number }>({
    priceProduct: 0,
  });
  const [selectService, setSelectService] = useState<SelectedService | null>(
    null
  );
  const { id: urlId } = useParams<{ id: string }>();
  const id = bill_id || urlId; // Ưu tiên props, fallback sang URL
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) {
          console.error("Invoice ID is missing");
          return;
        }

        const dataRequestAPI = await axios.get(
          "http://localhost:8080/api/invoice/" + id
        );

        const data = dataRequestAPI.data.data;
        console.log("Fetched invoice data:", data);

        if (data) {
          setRecipientInfo(data.recipientInfo || null);
          setPackages(data.packages || []);
          setProducts(data.products || []);
          setProductsTotal(data.productsTotal || { priceProduct: 0 });
          setSelectService(data.selectService || null);
        } else {
          console.error("No data returned from API");
        }

      } catch (error) {
        console.error("Error fetching invoice data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col w-full h-full gap-6 sm:gap-5 xl:flex-row">
      {/* <!-- Invoice Sidebar Start --> */}
      <div className="w-full xl:w-64 flex-shrink-0">
        <InvoiceSidebar bill_id={id || ""} />
      </div>
      {/* <!-- Invoice Sidebar End --> */}

      {/* <!-- Invoice Mainbox Start --> */}
      <div className="w-full overflow-x-auto">
        {recipientInfo && selectService ? (
          <InvoiceMain
            bill_id={bill_id}
            recipientInfo={recipientInfo}
            packages={packages}
            products={products}
            productsTotal={productsTotal}
            selectedService={selectService}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full min-h-[200px]">
            <p className="text-gray-500">Loading invoice details...</p>
          </div>
        )}
      </div>
      {/* <!-- Invoice Mainbox End --> */}
    </div>
  );
}
