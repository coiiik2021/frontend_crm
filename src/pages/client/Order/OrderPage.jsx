import { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import InformationOrder from "../../../components/client/order/InformationOrder";
import Products from "../../../components/client/order/Products";
import FormDetailOrder from "../../../components/client/order/FormDetailOrder";
import { GetBaseUserForSender } from "../../../service/api.admin.service";

export default function OrderPage() {
    const [currentStep, setCurrentStep] = useState(2);

    // Thêm useEffect để theo dõi thay đổi của currentStep và cuộn trang lên đầu
    useEffect(() => {
        // Cuộn trang lên đầu khi currentStep thay đổi
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }, [currentStep]);

    const [senderInfo, setSenderInfo] = useState({});


    useEffect(() => {
        const loadSender = async () => {
            const dataResponse = await GetBaseUserForSender();
            console.log(dataResponse);
            if (senderInfo === null) {
                setSenderInfo(dataResponse);
            }
        }
        loadSender();
    }, [currentStep]);

    const [consigneeFrom, setConsigneeFrom] = useState({
        id: "",
        fullName: "",
        company: "",
        email: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        postCode: "",
        country: "",
        taxCode: ""
    });

    const [consigneeTo, setConsigneeTo] = useState({
        id: "",
        fullName: "",
        company: "",
        email: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        postCode: "",
        country: "",
        taxCode: ""
    });

    const [addressBackup, setAddressBackup] = useState({

        id: "",
        name: "",
        date: "",
        time: "",
        address: "",
        notes: ""

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

    const [dataRequest, setDataRequest] = useState();

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
        if (newStep === 3) {
            setProductsErrors({});
        }
        setCurrentStep(newStep);
    };





    let content = null;
    if (currentStep === 2) {
        content = (
            <InformationOrder
                consigneeTo={consigneeTo}
                consigneeFrom={consigneeFrom}
                setConsigneeFrom={setConsigneeFrom}
                setConsigneeTo={setConsigneeTo}
                packages={packages}
                setPackages={setPackages}
                currentStep={currentStep}
                setCurrentStep={handleStepChange}
                setSelectedService={setSelectedService}
                senderInfo={senderInfo}
                setSenderInfo={setSenderInfo}
                addressBackup={addressBackup}
                setAddressBackup={setAddressBackup}
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
            <FormDetailOrder
                senderInfo={consigneeFrom}
                recipientInfo={consigneeTo}
                addressBackup={addressBackup}
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
                dataRequest={dataRequest}
                setDataRequest={setDataRequest}
            />
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
                dataRequest={dataRequest}
            />}
        </div>
    )
};
