import ComponentCard from "../../admin/common/ComponentCard.js";
import Label from "../../admin/form/Label.js";
import Select from "../../admin/form/Select.js";
import Button from "../../admin/ui/button/Button.js";
import Input from "../../admin/form/input/InputField.js";
import Form from "../../admin/form/Form.js";
import FormPackage from "./FormPackage.jsx";
import { useState, useEffect } from "react";
import { GetCodeByCompany } from "../../../service/api.service.jsx";
import { DeleteConsigneeFavorite, GetAllConsigneeFavorite, GetZoneCountry, PostConsigneeFavorite } from "../../../service/api.admin.service.jsx";

export default function InformationOrder(props) {
    const { recipientInfo, setRecipientInfo, packages, setPackages, currentStep, setCurrentStep, setSelectedService } = props;
    const [form, setForm] = useState(recipientInfo);
    const [savedList, setSavedList] = useState([]);
    const [showForm, setShowForm] = useState(true);
    const [showSavedPopup, setShowSavedPopup] = useState(false);
    const [initialNameCountry, setInitialNameCountry] = useState("USA (US)");
    const [isChangeCountry, setIsChangeCountry] = useState(false);
    const [zone, setZone] = useState({});
    const [isOpenFormPackage, setIsOpenFormPackage] = useState(false);
    const [showQuote, setShowQuote] = useState(true);

    const [errors, setErrors] = useState({
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

    const handleService = () => {
        console.log("form", form);

        if (validateForm()) {
            setRecipientInfo(form);
            setCurrentStep(3);
        } else {
            setShowForm(true);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Gọi API để lấy dữ liệu
                const data = await GetZoneCountry();
                const dataResponse = await GetAllConsigneeFavorite();

                console.log("data zone", dataResponse);

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

                // Tạo mảng options cho Select component
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

    const validateForm = () => {
        const newErrors = {};
        Object.keys(form).forEach((key) => {
            if (key !== "id") {
                if (!form[key]) {
                    newErrors[key] = true;
                } else {
                    newErrors[key] = false;
                }
            }
        });
        setErrors(newErrors);
        return Object.values(newErrors).every((error) => !error);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };


    const handleSave = async (e) => {
        e.preventDefault();

        const dataResponse = await PostConsigneeFavorite(form);

        console.log("dataResponse", dataResponse);
        if (validateForm()) {
            const newList = [...savedList, dataResponse];
            setSavedList(newList);
            localStorage.setItem("savedRecipients", JSON.stringify(newList));
            setRecipientInfo(form);
            form.id = dataResponse.id;
            console.log(form);
            setShowForm(false);
        } else {
            setShowForm(true);
        }

    };

    const handleConfirm = () => {
        if (validateForm()) {
            setRecipientInfo(form);
            setShowForm(false);
        } else {
            setShowForm(true);
        }
    };

    const handleSelectSaved = (idx) => {
        setForm(savedList[idx]);
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


    return (
        <div className="relative">
            {/* Nút bên phải */}
            <div className="flex justify-end mb-4">
                <Button size="sm" onClick={() => setShowSavedPopup(prev => !prev)}>
                    {showSavedPopup ? "Đóng danh sách đã lưu" : "Thông tin đã được lưu"}
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

            {/* Form nhập liệu */}
            {showForm && (
                <ComponentCard title="Information Order">
                    <Form onSubmit={async (e) => await handleSave(e)}>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="col-span-full">
                                <h4 className="pb-4 text-base font-medium text-gray-800 border-b border-gray-200 dark:border-gray-800 dark:text-white/90">
                                    Recipient Information
                                </h4>
                            </div>


                            {['name', 'company', 'email', 'phone', 'street', 'city', 'state', 'postCode'].map((field, idx) => (
                                <div key={idx} >
                                    <Label htmlFor={field}>{`${field.charAt(0).toUpperCase() + field.slice(1)}`}</Label>
                                    <Input
                                        type="text"
                                        id={field}
                                        value={form[field]}
                                        onChange={e => setForm({ ...form, [field]: e.target.value })}
                                        className={errors[field] ? "border-red-500" : ""}
                                    />
                                </div>
                            ))}
                            <div>
                                <Label htmlFor="country">Country</Label>
                                <Select
                                    options={countryOptions}
                                    placeholder="--Select Country--"
                                    onChange={(val) => {
                                        setForm({ ...form, country: val });
                                        setInitialNameCountry(val);
                                        setIsChangeCountry(true); // Đánh dấu đã thay đổi country
                                        setIsOpenFormPackage(true); // Hiển thị thông tin package
                                        setShowQuote(false); // Ẩn phần báo giá
                                        setZone(countryCode[val.value]);
                                    }}
                                    defaultValue={form.country}
                                    className={`bg-gray-50 dark:bg-gray-800 ${errors.country ? "border-red-500" : ""}`}
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button size="sm">Save</Button>
                                <Button size="sm" variant="outline" onClick={handleConfirm}>
                                    Confirm
                                </Button>
                            </div>
                        </div>
                    </Form>
                </ComponentCard>
            )}

            {!showForm && (
                <div style={{ textAlign: 'center', margin: '16px 0' }}>
                    <Button size="sm" onClick={() => setShowForm(true)}>
                        Hiện lại thông tin
                    </Button>
                </div>
            )}

            <FormPackage
                packages={packages}
                setPackages={setPackages}
                nameCountry={form.country}
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

