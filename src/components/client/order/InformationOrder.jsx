import ComponentCard from "../../admin/common/ComponentCard.js";
import Label from "../../admin/form/Label.js";
import Select from "../../admin/form/Select.js";
import Button from "../../admin/ui/button/Button.js";
import Input from "../../admin/form/input/InputField.js";
import Form from "../../admin/form/Form.js";
import FormPackage from "./FormPackage.jsx";
import DatePicker from "../../admin/form/date-picker.tsx";
import { useState, useEffect } from "react";
import { GetCodeByCompany } from "../../../service/api.service.jsx";
import { DeleteConsigneeFavorite, GetAllConsigneeFavorite, GetZoneCountry, PostConsigneeFavorite } from "../../../service/api.admin.service.jsx";

export default function InformationOrder(props) {
    const { recipientInfo, setRecipientInfo, senderInfo, setSenderInfo, packages, setPackages, currentStep, setCurrentStep, setSelectedService } = props;

    // Khởi tạo senderForm với dữ liệu từ props
    const [senderForm, setSenderForm] = useState({
        fullName: senderInfo?.fullName || "",
        company: senderInfo?.company || "",
        email: senderInfo?.email || "",
        phone: senderInfo?.phone || "",
        taxCode: senderInfo?.taxCode || "",
        street: senderInfo?.street || "",
        city: senderInfo?.city || "",
        state: senderInfo?.state || "",
        postCode: senderInfo?.postCode || "",
        country: senderInfo?.country || ""
    });

    // Các state khác giữ nguyên...

    // Cập nhật senderForm khi senderInfo thay đổi
    useEffect(() => {
        if (senderInfo && Object.keys(senderInfo).length > 0) {
            setSenderForm({
                fullName: senderInfo.fullName || "",
                company: senderInfo.company || "",
                email: senderInfo.email || "",
                phone: senderInfo.phone || "",
                taxCode: senderInfo.taxCode || "",
                street: senderInfo.street || "",
                city: senderInfo.city || "",
                state: senderInfo.state || "",
                postCode: senderInfo.postCode || "",
                country: senderInfo.country || ""
            });
        }
    }, [senderInfo]);

    const [recipientForm, setRecipientForm] = useState(recipientInfo || {});
    const [savedList, setSavedList] = useState([]);
    const [showForm, setShowForm] = useState(true);
    const [showSavedPopup, setShowSavedPopup] = useState(false);
    const [initialNameCountry, setInitialNameCountry] = useState("USA (US)");
    const [isChangeCountry, setIsChangeCountry] = useState(false);
    const [zone, setZone] = useState({});
    const [isOpenFormPackage, setIsOpenFormPackage] = useState(false);
    const [showQuote, setShowQuote] = useState(true);

    // Thêm state cho form nhận hàng
    const [deliveryForm, setDeliveryForm] = useState({
        receiverName: "",
        deliveryDate: "",
        deliveryTime: "",
        deliveryAddress: "",
        notes: ""
    });

    // Thêm state cho lỗi form nhận hàng
    const [deliveryErrors, setDeliveryErrors] = useState({
        receiverName: false,
        deliveryDate: false,
        deliveryTime: false,
        deliveryAddress: false
    });

    // Thêm state để kiểm soát hiển thị form nhận hàng
    const [showDeliveryForm, setShowDeliveryForm] = useState(false);

    const [recipientErrors, setRecipientErrors] = useState({
        name: false,
        email: false,
        phone: false,
        street: false,
        city: false,
        state: false,
        postCode: false,
        country: false
    });

    const [senderErrors, setSenderErrors] = useState({
        name: false,
        email: false,
        phone: false,
        street: false,
        city: false,
        state: false,
        postCode: false,
        country: false
    });

    const [countryCode, setCountryCode] = useState({});
    const [countryOptions, setCountryOptions] = useState([]);

    // Thêm hàm validate cho form nhận hàng
    const validateDeliveryForm = () => {
        // Nếu form nhận hàng không được hiển thị, không cần validate
        if (!showDeliveryForm) return true;

        const newErrors = {};
        const requiredFields = ['receiverName', 'deliveryDate', 'deliveryTime', 'deliveryAddress'];

        requiredFields.forEach(field => {
            if (!deliveryForm[field]) {
                newErrors[field] = true;
            } else {
                newErrors[field] = false;
            }
        });

        setDeliveryErrors(newErrors);
        return Object.values(newErrors).every(error => !error);
    };

    // Thêm hàm xử lý thay đổi cho form nhận hàng
    const handleDeliveryChange = (e) => {
        const { name, value } = e.target;
        setDeliveryForm(prevForm => ({
            ...prevForm,
            [name]: value
        }));
    };

    const handleService = () => {
        console.log("recipient form", recipientForm);
        console.log("sender form", senderForm);
        console.log("delivery form", deliveryForm);

        if (validateRecipientForm() && validateSenderForm() && validateDeliveryForm()) {
            setRecipientInfo(recipientForm);
            setSenderInfo(senderForm); // Cập nhật senderInfo với dữ liệu mới
            setCurrentStep(3);
        } else {
            setShowForm(true);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await GetZoneCountry();
                const dataResponse = await GetAllConsigneeFavorite();
                setSavedList(dataResponse);
                localStorage.setItem("savedRecipients", JSON.stringify(data));

                const resCodeCompany = await GetCodeByCompany();
                const rawData = resCodeCompany.data.values;

                const countryDataMap = rawData.reduce((acc, item) => {
                    const originalName = item[0].trim();
                    acc[originalName] = {
                        countryCode: (originalName.match(/\(([A-Z]{2})\)/) || [])[1] || ''
                    };
                    return acc;
                }, {});

                const options = Object.keys(countryDataMap).map(country => ({
                    value: country,
                    label: country
                }));

                setCountryCode(countryDataMap);
                setCountryOptions(options);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const validateRecipientForm = () => {
        const newErrors = {};
        Object.keys(recipientForm).forEach((key) => {
            if (key !== "id") {
                if (!recipientForm[key]) {
                    newErrors[key] = true;
                } else {
                    newErrors[key] = false;
                }
            }
        });
        setRecipientErrors(newErrors);
        return Object.values(newErrors).every((error) => !error);
    };

    const validateSenderForm = () => {
        const newErrors = {};
        Object.keys(senderForm).forEach((key) => {
            if (key !== "id") {
                if (!senderForm[key]) {
                    newErrors[key] = true;
                } else {
                    newErrors[key] = false;
                }
            }
        });
        setSenderErrors(newErrors);
        return Object.values(newErrors).every((error) => !error);
    };

    const handleRecipientChange = (e) => {
        const { name, value } = e.target;
        setRecipientForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const handleSenderChange = (e) => {
        const { name, value } = e.target;
        setSenderForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (validateRecipientForm() && validateSenderForm()) {
            const dataResponse = await PostConsigneeFavorite(recipientForm);

            if (dataResponse) {
                const newList = [...savedList, dataResponse];
                setSavedList(newList);
                localStorage.setItem("savedRecipients", JSON.stringify(newList));

                // Cập nhật thông tin sender và recipient vào state chính
                setRecipientInfo(recipientForm);
                setSenderInfo(senderForm); // Cập nhật senderInfo với dữ liệu mới

                recipientForm.id = dataResponse.id;
                setShowForm(false);
                console.log("Saved sender info:", senderForm);
            }
        } else {
            setShowForm(true);
        }
    };

    const handleConfirm = (e) => {
        // Thêm preventDefault để ngăn form submit nếu nút nằm trong form
        if (e) e.preventDefault();

        if (validateRecipientForm() && validateSenderForm()) {
            // Cập nhật thông tin sender và recipient vào state chính
            setRecipientInfo(recipientForm);
            setSenderInfo(senderForm); // Cập nhật senderInfo với dữ liệu mới
            setShowForm(false); // Ẩn form sau khi xác nhận
            console.log("Form hidden after confirmation");
            console.log("Updated sender info:", senderForm);
        } else {
            console.log("Validation failed, form still showing");
            setShowForm(true);
        }
    };

    const handleSelectSaved = (idx) => {
        setRecipientForm(savedList[idx]);
        setRecipientInfo(savedList[idx]);
        setShowForm(true);
        setShowSavedPopup(false);
        console.log("Selected recipient:", savedList[idx]);
    };

    const handleDeleteSaved = async (idx, id) => {
        const newList = savedList.filter((_, i) => i !== idx);
        await DeleteConsigneeFavorite(id);
        setSavedList(newList);
        localStorage.setItem("savedRecipients", JSON.stringify(newList));
    };

    // Thêm hàm xử lý thay đổi ngày
    const handleDateChange = (dates, dateString) => {
        setDeliveryForm(prevForm => ({
            ...prevForm,
            deliveryDate: dateString
        }));
    };

    return (
        <div className="space-y-6">
            {/* Nút bên phải */}
            <div className="flex justify-end mb-4">
                <Button
                    size="sm"
                    onClick={() => setShowSavedPopup(prev => !prev)}
                    className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    {showSavedPopup ? "Đóng danh sách" : "Thông tin đã lưu"}
                </Button>
            </div>

            {/* Popup nhỏ */}
            {showSavedPopup && (
                <div className="absolute right-0 top-12 z-50 bg-white dark:bg-gray-800 border rounded-lg shadow-lg w-full max-w-md p-4 overflow-y-auto max-h-96">
                    <h4 className="text-base font-semibold mb-3">Danh sách người nhận</h4>
                    <div className="space-y-3">
                        {savedList.length === 0 && <p className="text-sm">Chưa có thông tin nào.</p>}
                        {savedList.map((item, idx) => (
                            <div key={idx} className="border rounded-md p-3 bg-gray-50 dark:bg-gray-700">
                                <div className="font-medium">{item.name} ({item.phone})</div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    {item.email}<br />
                                    {item.street}, {item.city}, {item.country}
                                </div>
                                <div className="mt-2 flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => handleSelectSaved(idx)}
                                    >
                                        Chọn
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={async () => await handleDeleteSaved(idx, item.id)}
                                    >
                                        Xoá
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Form nhập liệu - Hiển thị khi showForm = true */}
            {showForm ? (
                <ComponentCard title="Shipping Information" className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                    <Form onSubmit={async (e) => await handleSave(e)}>
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Sender Information - Left Column */}
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5 border border-gray-100 dark:border-gray-700">
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </div>
                                    <h4 className="text-base font-medium text-gray-800 dark:text-white/90">
                                        Sender Information
                                    </h4>
                                </div>

                                {/* Sender Basic Info */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="sender_name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                                        <Input
                                            type="text"
                                            id="sender_name"
                                            name="fullName"
                                            value={senderForm.fullName || ''}
                                            onChange={handleSenderChange}
                                            className={`bg-white dark:bg-gray-800 ${senderErrors.fullName ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="sender_company" className="text-gray-700 dark:text-gray-300">Company</Label>
                                        <Input
                                            type="text"
                                            id="sender_company"
                                            name="company"
                                            value={senderForm.company || ''}
                                            onChange={handleSenderChange}
                                            className={`bg-white dark:bg-gray-800 ${senderErrors.company ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="sender_email" className="text-gray-700 dark:text-gray-300">Email</Label>
                                        <Input
                                            type="text"
                                            id="sender_email"
                                            name="email"
                                            value={senderForm.email || ''}
                                            onChange={handleSenderChange}
                                            className={`bg-white dark:bg-gray-800 ${senderErrors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="sender_phone" className="text-gray-700 dark:text-gray-300">Phone</Label>
                                        <Input
                                            type="text"
                                            id="sender_phone"
                                            name="phone"
                                            value={senderForm.phone || ''}
                                            onChange={handleSenderChange}
                                            className={`bg-white dark:bg-gray-800 ${senderErrors.phone ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="sender_taxCode" className="text-gray-700 dark:text-gray-300">Tax Code</Label>
                                        <Input
                                            type="text"
                                            id="sender_taxCode"
                                            name="taxCode"
                                            value={senderForm.taxCode || ''}
                                            onChange={handleSenderChange}
                                            className={`bg-white dark:bg-gray-800 ${senderErrors.taxCode ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                                        />
                                    </div>
                                </div>

                                {/* Sender Address */}
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Address Details</h5>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <Label htmlFor="sender_street" className="text-gray-700 dark:text-gray-300">Street</Label>
                                            <Input
                                                type="text"
                                                id="sender_street"
                                                name="street"
                                                value={senderForm.street || ''}
                                                onChange={handleSenderChange}
                                                className={`bg-white dark:bg-gray-800 ${senderErrors.street ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="sender_city" className="text-gray-700 dark:text-gray-300">City</Label>
                                            <Input
                                                type="text"
                                                id="sender_city"
                                                name="city"
                                                value={senderForm.city || ''}
                                                onChange={handleSenderChange}
                                                className={`bg-white dark:bg-gray-800 ${senderErrors.city ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="sender_state" className="text-gray-700 dark:text-gray-300">State</Label>
                                            <Input
                                                type="text"
                                                id="sender_state"
                                                name="state"
                                                value={senderForm.state || ''}
                                                onChange={handleSenderChange}
                                                className={`bg-white dark:bg-gray-800 ${senderErrors.state ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="sender_postCode" className="text-gray-700 dark:text-gray-300">Post Code</Label>
                                            <Input
                                                type="text"
                                                id="sender_postCode"
                                                name="postCode"
                                                value={senderForm.postCode || ''}
                                                onChange={handleSenderChange}
                                                className={`bg-white dark:bg-gray-800 ${senderErrors.postCode ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="sender_country" className="text-gray-700 dark:text-gray-300">Country</Label>
                                            <Select
                                                options={countryOptions}
                                                placeholder="--Select Country--"
                                                onChange={(val) => {
                                                    setSenderForm({ ...senderForm, country: val });
                                                }}
                                                defaultValue={senderForm.country}
                                                className={`bg-white dark:bg-gray-800 ${senderErrors.country ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recipient Information - Right Column */}
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5 border border-gray-100 dark:border-gray-700">
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-base font-medium text-gray-800 dark:text-white/90">
                                        Recipient Information
                                    </h4>
                                </div>

                                {/* Recipient Basic Info */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="recipient_name" className="text-gray-700 dark:text-gray-300">Name</Label>
                                        <Input
                                            type="text"
                                            id="recipient_name"
                                            name="name"
                                            value={recipientForm.name || ''}
                                            onChange={handleRecipientChange}
                                            className={`bg-white dark:bg-gray-800 ${recipientErrors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="recipient_company" className="text-gray-700 dark:text-gray-300">Company</Label>
                                        <Input
                                            type="text"
                                            id="recipient_company"
                                            name="company"
                                            value={recipientForm.company || ''}
                                            onChange={handleRecipientChange}
                                            className={`bg-white dark:bg-gray-800 ${recipientErrors.company ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="recipient_email" className="text-gray-700 dark:text-gray-300">Email</Label>
                                        <Input
                                            type="text"
                                            id="recipient_email"
                                            name="email"
                                            value={recipientForm.email || ''}
                                            onChange={handleRecipientChange}
                                            className={`bg-white dark:bg-gray-800 ${recipientErrors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="recipient_phone" className="text-gray-700 dark:text-gray-300">Phone</Label>
                                        <Input
                                            type="text"
                                            id="recipient_phone"
                                            name="phone"
                                            value={recipientForm.phone || ''}
                                            onChange={handleRecipientChange}
                                            className={`bg-white dark:bg-gray-800 ${recipientErrors.phone ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                                        />
                                    </div>
                                </div>

                                {/* Recipient Address */}
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Address Details</h5>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <Label htmlFor="recipient_street" className="text-gray-700 dark:text-gray-300">Street</Label>
                                            <Input
                                                type="text"
                                                id="recipient_street"
                                                name="street"
                                                value={recipientForm.street || ''}
                                                onChange={handleRecipientChange}
                                                className={`bg-white dark:bg-gray-800 ${recipientErrors.street ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="recipient_city" className="text-gray-700 dark:text-gray-300">City</Label>
                                            <Input
                                                type="text"
                                                id="recipient_city"
                                                name="city"
                                                value={recipientForm.city || ''}
                                                onChange={handleRecipientChange}
                                                className={`bg-white dark:bg-gray-800 ${recipientErrors.city ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="recipient_state" className="text-gray-700 dark:text-gray-300">State</Label>
                                            <Input
                                                type="text"
                                                id="recipient_state"
                                                name="state"
                                                value={recipientForm.state || ''}
                                                onChange={handleRecipientChange}
                                                className={`bg-white dark:bg-gray-800 ${recipientErrors.state ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="recipient_postCode" className="text-gray-700 dark:text-gray-300">Post Code</Label>
                                            <Input
                                                type="text"
                                                id="recipient_postCode"
                                                name="postCode"
                                                value={recipientForm.postCode || ''}
                                                onChange={handleRecipientChange}
                                                className={`bg-white dark:bg-gray-800 ${recipientErrors.postCode ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="recipient_country" className="text-gray-700 dark:text-gray-300">Country</Label>
                                            <Select
                                                options={countryOptions}
                                                placeholder="--Select Country--"
                                                onChange={(val) => {
                                                    setRecipientForm({ ...recipientForm, country: val });
                                                    setInitialNameCountry(val);
                                                    setIsChangeCountry(true);
                                                    setIsOpenFormPackage(true);
                                                    setShowQuote(false);
                                                    setZone(countryCode[val.value]);
                                                }}
                                                defaultValue={recipientForm.country}
                                                className={`bg-white dark:bg-gray-800 ${recipientErrors.country ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Nút hiển thị/ẩn form nhận hàng */}
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <Button
                                size="sm"
                                type="button"
                                onClick={() => setShowDeliveryForm(!showDeliveryForm)}
                                className={`flex items-center gap-1.5 ${showDeliveryForm
                                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                                    : "bg-green-100 text-green-700 hover:bg-green-200"
                                    } px-4 py-2 rounded-md transition-colors`}
                            >
                                {showDeliveryForm ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Ẩn địa chỉ nhận hàng
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Thêm địa chỉ nhận hàng
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Form nhận hàng - chỉ hiển thị khi showDeliveryForm = true */}
                        {showDeliveryForm && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                        </svg>
                                    </div>
                                    <h4 className="text-base font-medium text-gray-800 dark:text-white/90">
                                        Thông tin nhận hàng
                                    </h4>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="receiver_name" className="text-gray-700 dark:text-gray-300">Tên người đưa</Label>
                                        <Input
                                            type="text"
                                            id="receiver_name"
                                            name="receiverName"
                                            value={deliveryForm.receiverName || ''}
                                            onChange={handleDeliveryChange}
                                            className={`bg-white dark:bg-gray-800 ${deliveryErrors.receiverName ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                                        />
                                    </div>
                                    <div>
                                        <DatePicker
                                            id="delivery_date_picker"
                                            label="Ngày nhận"
                                            placeholder="Chọn ngày nhận"
                                            onChange={handleDateChange}
                                            className={deliveryErrors.deliveryDate ? "border-red-500" : ""}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="delivery_time" className="text-gray-700 dark:text-gray-300">Giờ nhận</Label>
                                        <div className="relative">
                                            <Input
                                                type="time"
                                                id="delivery_time"
                                                name="deliveryTime"
                                                value={deliveryForm.deliveryTime || ''}
                                                onChange={handleDeliveryChange}
                                                className={`bg-white dark:bg-gray-800 ${deliveryErrors.deliveryTime ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                                            />
                                            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M10 5V10H13.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M10.0003 18.3333C14.6027 18.3333 18.3337 14.6024 18.3337 10C18.3337 5.39763 14.6027 1.66667 10.0003 1.66667C5.39795 1.66667 1.66699 5.39763 1.66699 10C1.66699 14.6024 5.39795 18.3333 10.0003 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Label htmlFor="delivery_address" className="text-gray-700 dark:text-gray-300">Địa chỉ nhận hàng</Label>
                                        <Input
                                            type="text"
                                            id="delivery_address"
                                            name="deliveryAddress"
                                            value={deliveryForm.deliveryAddress || ''}
                                            onChange={handleDeliveryChange}
                                            className={`bg-white dark:bg-gray-800 ${deliveryErrors.deliveryAddress ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Label htmlFor="delivery_notes" className="text-gray-700 dark:text-gray-300">Ghi chú</Label>
                                        <textarea
                                            id="delivery_notes"
                                            name="notes"
                                            value={deliveryForm.notes || ''}
                                            onChange={handleDeliveryChange}
                                            rows="3"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                size="sm"
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                            >
                                Save
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                type="button"
                                onClick={handleConfirm}
                                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md"
                            >
                                Confirm
                            </Button>
                        </div>
                    </Form>
                </ComponentCard>
            ) : (
                // Hiển thị khi form bị ẩn - nút để hiện lại form
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-medium text-gray-800 dark:text-white">Shipping Information</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Sender: {senderForm.fullName || 'N/A'} • Recipient: {recipientForm.name || 'N/A'}
                                {showDeliveryForm && deliveryForm.receiverName && ` • Delivery: ${deliveryForm.receiverName}`}
                            </p>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => setShowForm(true)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md flex items-center gap-1.5"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M6.8 21l3.6-3.6m-3.6 0l3.6 3.6" />
                            </svg>
                            Edit Information
                        </Button>
                    </div>
                </div>
            )}

            <FormPackage
                packages={packages}
                setPackages={setPackages}
                nameCountry={recipientForm.country}
                handleService={handleService}
                setSelectedService={setSelectedService}
                initialNameCountry={initialNameCountry}
                isChangeCountry={isChangeCountry}
                setIsChangeCountry={setIsChangeCountry}
                zone={zone}
            />
        </div>
    );
}

