import ComponentCard from "../../admin/common/ComponentCard.js";
import Label from "../../admin/form/Label.js";
import Select from "../../admin/form/Select.js";
import Button from "../../admin/ui/button/Button.js";
import Input from "../../admin/form/input/InputField.js";
import Form from "../../admin/form/Form.js";
import FormPackage from "./FormPackage.jsx";
import DatePicker from "../../admin/form/date-picker.tsx";
import { useState, useEffect, useRef } from "react";
import { GetCodeByCompany } from "../../../service/api.service.jsx";
import { DeleteConsigneeFavorite, GetAllConsigneeFavorite, GetAllDeliveryFavorite, GetZoneCountry, PostConsigneeFavorite } from "../../../service/api.admin.service.jsx";
import Document from "./Document.jsx";
import { FileTextIcon, PackageIcon } from "lucide-react";

export default function InformationOrder(props) {
    const { addressBackup, setAddressBackup,
        packages, setPackages, currentStep, setCurrentStep, setSelectedService } = props;

    const [isPackage, setIsPackage] = useState(true);

    const recipientInfo = props.consigneeTo;
    const setRecipientInfo = props.setConsigneeTo;
    const senderInfo = props.consigneeFrom;
    const setSenderInfo = props.setConsigneeFrom;
    const [total, setTotal] = useState({
        totalOverSize: 0,
        realVolume: 0,
        totalPackage: packages.length
    });

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
        country: senderInfo?.country || "",
        id: senderInfo?.id || ""
    });

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
                country: senderInfo.country || "",
                id: senderInfo.id || ""
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

    const [listSenderSave, setListSenderSave] = useState([]);
    const [listRecipientSave, setListRecipientSave] = useState([]);
    const [listDeliverySave, setListDeliverySave] = useState([]);


    // Thêm các state để quản lý popover
    const [showSenderPopover, setShowSenderPopover] = useState(false);
    const [showRecipientPopover, setShowRecipientPopover] = useState(false);
    const [showDeliveryPopover, setShowDeliveryPopover] = useState(false);

    // Thêm refs để xử lý click outside
    const senderPopoverRef = useRef(null);
    const recipientPopoverRef = useRef(null);
    const deliveryPopoverRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (showSenderPopover &&
                senderPopoverRef.current &&
                !senderPopoverRef.current.contains(event.target)) {
                setShowSenderPopover(false);
            }
            if (showRecipientPopover &&
                recipientPopoverRef.current &&
                !recipientPopoverRef.current.contains(event.target)) {
                setShowRecipientPopover(false);
            }
            if (showDeliveryPopover &&
                deliveryPopoverRef.current &&
                !deliveryPopoverRef.current.contains(event.target)) {
                setShowDeliveryPopover(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showSenderPopover, showRecipientPopover, showDeliveryPopover]);


    // Thêm dữ liệu mẫu cho delivery
    const deliverySampleData = [
        {
            id: "d1",
            name: "Lê Văn C",
            address: "789 Đường Cách Mạng Tháng 8, Quận 10, TP.HCM",
            date: "2023-06-15",
            time: "14:30",
            notes: "Gọi trước khi giao hàng"
        },
        {
            id: "d2",
            name: "Phạm Thị D",
            address: "101 Đường Võ Văn Tần, Quận 3, TP.HCM",
            date: "2023-06-16",
            time: "09:00",
            notes: "Để hàng tại lễ tân nếu không có người nhận"
        }
    ];

    // Component Popover tái sử dụng với xử lý dữ liệu mẫu
    const SavedItemsPopover = ({ isOpen, reference, title, items, onSelect, onDelete }) => {
        if (!isOpen) return null;

        return (
            <div
                ref={reference}
                className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 border rounded-lg shadow-lg w-72 p-3 overflow-y-auto max-h-80"
            >
                <h4 className="text-base font-semibold mb-3">{title}</h4>
                <div className="space-y-3">
                    {items.length === 0 && <p className="text-sm">Chưa có thông tin nào.</p>}
                    {items.map((item, idx) => (
                        <div key={idx} className="border rounded-md p-3 bg-gray-50 dark:bg-gray-700">
                            {/* Hiển thị thông tin người gửi/người nhận */}
                            {(item.fullName || item.name) && (
                                <div className="font-medium">
                                    {item.fullName || item.name}
                                    {item.phone && <span> ({item.phone})</span>}
                                </div>
                            )}

                            {/* Hiển thị email và công ty nếu có */}
                            {(item.email || item.company) && (
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    {item.email && <div>{item.email}</div>}
                                    {item.company && <div>{item.company}</div>}
                                </div>
                            )}

                            {/* Hiển thị địa chỉ */}
                            {(item.street || item.address) && (
                                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {item.street ? (
                                        <>
                                            {item.street}, {item.city}, {item.state} {item.postCode}<br />
                                            {item.country?.label || item.country}
                                        </>
                                    ) : (
                                        <>{item.address}</>
                                    )}
                                </div>
                            )}

                            {/* Hiển thị thông tin giao hàng */}
                            {(item.date || item.time) && (
                                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {item.date && <div>Ngày: {item.date}</div>}
                                    {item.time && <div>Giờ: {item.time}</div>}
                                    {item.notes && <div>Ghi chú: {item.notes}</div>}
                                </div>
                            )}

                            <div className="mt-2 flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => onSelect(idx)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                                >
                                    Chọn
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => onDelete(idx, item.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                                >
                                    Xoá
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };



    // Thêm state cho form nhận hàng

    // Khởi tạo ngày hiện tại theo định dạng YYYY-MM-DD
    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [deliveryForm, setDeliveryForm] = useState({
        ...addressBackup,
        date: addressBackup?.date || getCurrentDate()
    });

    // Thêm state cho lỗi form nhận hàng
    const [deliveryErrors, setDeliveryErrors] = useState({
        receiverName: false,
        receiverPhone: false,

        deliveryDate: false,
        deliveryTime: false,
        deliveryAddress: false,

    });

    // Thêm state để kiểm soát hiển thị form nhận hàng
    const [showDeliveryForm, setShowDeliveryForm] = useState(false);

    const [recipientErrors, setRecipientErrors] = useState({
        fullName: false,
        email: false,
        phone: false,
        street: false,
        city: false,
        state: false,
        postCode: false,
        country: false
    });

    const [senderErrors, setSenderErrors] = useState({
        fullName: false,
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
        const requiredFields = ['name', 'address'];

        // Ngày và giờ sẽ luôn có giá trị mặc định
        deliveryForm.date = deliveryForm.date || getCurrentDate();

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
        console.log(`Updating delivery form: ${name} = ${value}`); // Thêm log để debug

        setDeliveryForm(prevForm => {
            const updatedForm = {
                ...prevForm,
                [name]: value
            };
            console.log("Updated delivery form:", updatedForm); // Thêm log để debug
            return updatedForm;
        });

        // Xóa lỗi khi người dùng nhập giá trị
        if (deliveryErrors[name]) {
            setDeliveryErrors(prev => ({
                ...prev,
                [name]: false
            }));
        }
    };

    // Thêm useEffect để cuộn trang lên đầu khi component được render
    useEffect(() => {
        // Cuộn trang lên đầu khi component được render
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }, []);

    const handleService = () => {
        const recalculatedTotal = packages.reduce((acc, pkg) => ({
            ...acc,
            realVolume: acc.realVolume + (pkg.total?.realVolume || 0),
            totalPackage: packages.length
        }), {
            totalOverSize: 0,
            realVolume: 0,
            totalPackage: 0
        });

        setPackages(packages.map(pkg => ({ ...pkg })));

        // Tiếp tục xử lý chuyển trang
        if (validateRecipientForm() && validateSenderForm()) {
            // Cập nhật thông tin người gửi và người nhận
            setRecipientInfo({
                fullName: recipientForm.fullName || "",
                company: recipientForm.company || "",
                email: recipientForm.email || "",
                phone: recipientForm.phone || "",
                street: recipientForm.street || "",
                city: recipientForm.city || "",
                state: recipientForm.state || "",
                postCode: recipientForm.postCode || "",
                country: recipientForm.country || "",
                taxCode: recipientForm.taxCode || "",
                id: recipientForm.id || "",
            });
            setSenderInfo({
                fullName: senderForm.fullName || "",
                company: senderForm.company || "",
                email: senderForm.email || "",
                phone: senderForm.phone || "",
                taxCode: senderForm.taxCode || "",
                street: senderForm.street || "",
                city: senderForm.city || "",
                state: senderForm.state || "",
                postCode: senderForm.postCode || "",
                country: senderForm.country || "",
                id: senderForm.id || "",
            });

            console.log("Sender Info:", senderForm);
            console.log("Recipient Info:", recipientForm);

            // Cập nhật thông tin nhận hàng vào addressBackup
            const updatedAddressBackup = {
                id: deliveryForm.id || "",
                name: deliveryForm.name || "",
                phone: deliveryForm.phone || "",
                date: deliveryForm.date || "",
                time: deliveryForm.time || "",
                address: deliveryForm.address || "",
                notes: deliveryForm.notes || ""
            };

            console.log("Updating addressBackup before moving to next step:", updatedAddressBackup);
            setAddressBackup(updatedAddressBackup);

            // Ensure the parent component has the latest addressBackup value
            // by using a small timeout before changing tabs
            setTimeout(() => {
                console.log("Final addressBackup before changing step:", updatedAddressBackup);
                setCurrentStep(3);
                // Cuộn trang lên đầu khi chuyển sang bước tiếp theo
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }, 100);
        } else {
            setShowForm(true);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await GetZoneCountry();

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
        e.preventDefault(); // Ngăn chặn hành vi submit mặc định
        e.stopPropagation(); // Ngăn chặn sự kiện lan truyền

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

        // Kiểm tra cả form nhận hàng nếu nó đang được hiển thị
        const isDeliveryValid = showDeliveryForm ? validateDeliveryForm() : true;

        if (validateRecipientForm() && validateSenderForm() && isDeliveryValid) {
            // Cập nhật thông tin sender và recipient vào state chính
            setRecipientInfo(recipientForm);
            setSenderInfo(senderForm);

            // Cập nhật thông tin nhận hàng vào addressBackup
            console.log("Saving delivery form to addressBackup:", deliveryForm);
            setAddressBackup(deliveryForm);

            setShowForm(false); // Ẩn form sau khi xác nhận
        } else {
            setShowForm(true);

            // Hiển thị thông báo lỗi nếu form nhận hàng không hợp lệ
            if (showDeliveryForm && !isDeliveryValid) {
                alert("Vui lòng điền đầy đủ thông tin nhận hàng");
            }
        }
    };

    const handleSelectSaved = (idx) => {
        setRecipientForm(savedList[idx]);
        setRecipientInfo(savedList[idx]);
        setShowForm(true);
        setShowSavedPopup(false);
        console.log("Selected recipient:", savedList[idx]);
    };

    const handleSaveSender = async (e) => {
        e.preventDefault(); // Ngăn chặn hành vi submit mặc định
        e.stopPropagation(); // Ngăn chặn sự kiện lan truyền
        if (validateSenderForm()) {
            const dataReponse = { ...senderForm, isTo: 1 };
            const dataResponse = await PostConsigneeFavorite(dataReponse);

            if (dataResponse) {
                const newList = [...savedList, dataResponse];
                setSavedList(newList);
                localStorage.setItem("savedRecipients", JSON.stringify(newList));
                setSenderInfo(senderForm);
                senderForm.id = dataResponse.id;
                // setShowForm(false);
                console.log("Saved sender info:", senderForm);
            }
        } else {
            setShowForm(true);
        }
    };

    const handleSaveRecipient = async (e) => {
        e.preventDefault(); // Ngăn chặn hành vi submit mặc định
        e.stopPropagation(); // Ngăn chặn sự kiện lan truyền
        console.log(recipientForm);


        if (validateRecipientForm()) {

            console.log(recipientForm);
            const dataRequest = { ...recipientForm, isTo: 0 };

            const dataResponse = await PostConsigneeFavorite(dataRequest);

            if (dataResponse) {
                const newList = [...savedList, dataResponse];
                setSavedList(newList);
                localStorage.setItem("savedRecipients", JSON.stringify(newList));

                setRecipientInfo(recipientForm);
                recipientForm.id = dataResponse.id;
                console.log("Saved recipient info:", recipientForm);
            }
        } else {
            setShowForm(true);
        }
    };

    const handleSaveDeliveryBackup = async (e) => {
        e.preventDefault(); // Ngăn chặn hành vi submit mặc định
        e.stopPropagation(); // Ngăn chặn sự kiện lan truyền
        console.log(deliveryForm);
        if (validateDeliveryForm()) {
            console.log(deliveryForm);
            // Cập nhật thông tin nhận hàng vào addressBackup
            setAddressBackup(deliveryForm);
            setShowForm(false);
        } else {
            setShowForm(true);
        }
    };



    const handleDeleteSaved = async (idx, id) => {
        const newList = savedList.filter((_, i) => i !== idx);

        console.log("id", id);

        await DeleteConsigneeFavorite(id);
        setSavedList(newList);
        localStorage.setItem("savedRecipients", JSON.stringify(newList));
    };

    // Thêm hàm xử lý thay đổi ngày
    const handleDateChange = (dates, dateString) => {
        console.log(`Date changed to: ${dateString}`);

        setDeliveryForm(prevForm => {
            const updatedForm = {
                ...prevForm,
                date: dateString || getCurrentDate() // Sử dụng ngày hiện tại nếu không có ngày được chọn
            };
            console.log("Updated delivery form with new date:", updatedForm);
            return updatedForm;
        });

        // Xóa lỗi khi người dùng chọn ngày
        if (deliveryErrors.date) {
            setDeliveryErrors(prev => ({
                ...prev,
                date: false
            }));
        }
    };

    // Cập nhật total khi packages thay đổi
    useEffect(() => {
        const newTotal = packages.reduce((acc, pkg) => ({
            ...acc,
            realVolume: acc.realVolume + (pkg.total?.realVolume || 0),
            totalPackage: packages.length
        }), {
            totalOverSize: 0,
            realVolume: 0,
            totalPackage: 0
        });

        setTotal(newTotal);
    }, [packages]);

    // Thêm refs để theo dõi các phần tử DOM
    const savedPopupRef = useRef(null);
    const savedButtonRef = useRef(null);

    // Thêm useEffect để xử lý click bên ngoài
    useEffect(() => {
        function handleClickOutside(event) {
            if (showSavedPopup &&
                savedPopupRef.current &&
                !savedPopupRef.current.contains(event.target) &&
                savedButtonRef.current &&
                !savedButtonRef.current.contains(event.target)) {
                setShowSavedPopup(false);
            }
        }

        // Thêm event listener
        document.addEventListener("mousedown", handleClickOutside);

        // Cleanup event listener khi component unmount
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showSavedPopup]);

    // Thêm useEffect để theo dõi thay đổi của deliveryForm
    useEffect(() => {
        console.log("deliveryForm updated:", deliveryForm);
        // Đảm bảo addressBackup được cập nhật khi deliveryForm thay đổi
        setAddressBackup(deliveryForm);
    }, [deliveryForm]);

    // Cập nhật các hàm setup để sử dụng dữ liệu mẫu
    const handleSetupSenderSave = async () => {
        try {
            // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu
            // const dataResponse = await GetAllSenderFavorite();
            // setListSenderSave(dataResponse);

            // Sử dụng dữ liệu mẫu cho demo
            const dataResponse = await GetAllConsigneeFavorite(1);


            setListSenderSave(dataResponse);
            setShowSenderPopover(prev => !prev);
        } catch (error) {
            console.error("Error fetching sender data:", error);
        }
    };

    const handleSetupRecipientSave = async () => {
        try {
            const dataResponse = await GetAllConsigneeFavorite(0);
            setListRecipientSave(dataResponse);
            setShowRecipientPopover(prev => !prev);
        } catch (error) {
            console.error("Error fetching recipient data:", error);
        }
    };

    const handleSetupDeliverySave = async () => {
        try {
            // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu
            const dataResponse = await GetAllDeliveryFavorite();
            setListDeliverySave(dataResponse);

            // Sử dụng dữ liệu mẫu cho demo
            // setListDeliverySave(deliverySampleData);
            setShowDeliveryPopover(prev => !prev);
        } catch (error) {
            console.error("Error fetching delivery data:", error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Nút bên phải */}
            <div className="flex justify-end mb-4">
                <Button
                    ref={savedButtonRef}
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
                <div
                    ref={savedPopupRef}
                    className="absolute right-0 top-12 z-50 bg-white dark:bg-gray-800 border rounded-lg shadow-lg w-full max-w-md p-4 overflow-y-auto max-h-96"
                >
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
                    <Form onSubmit={(e) => {
                        e.preventDefault(); // Ngăn chặn hành vi submit mặc định
                        return false; // Không thực hiện submit
                    }}>
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

                                    <div className="relative">
                                        <button
                                            className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
                                            onClick={handleSetupSenderSave}
                                        >
                                            <span className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                                </svg>
                                                Danh sách đã lưu
                                            </span>
                                        </button>
                                        <SavedItemsPopover
                                            isOpen={showSenderPopover}
                                            reference={senderPopoverRef}
                                            title="Danh sách người gửi đã lưu"
                                            items={listSenderSave}
                                            onSelect={(idx) => {
                                                setSenderForm(listSenderSave[idx]);
                                                setSenderInfo(listSenderSave[idx]);
                                                setShowSenderPopover(false);
                                            }}
                                            onDelete={async (idx, id) => {
                                                const newList = listSenderSave.filter((_, i) => i !== idx);
                                                await DeleteConsigneeFavorite(id);
                                                setListSenderSave(newList);
                                            }}
                                        />
                                    </div>
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
                                <button

                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleSaveSender(e);
                                    }}
                                >save sender</button>
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

                                    <div className="relative">
                                        <button
                                            className="px-3 py-1.5 bg-purple-100 text-purple-600 rounded-md text-sm font-medium hover:bg-purple-200 transition-colors"
                                            onClick={handleSetupRecipientSave}
                                        >
                                            <span className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                                </svg>
                                                Danh sách đã lưu
                                            </span>
                                        </button>
                                        <SavedItemsPopover
                                            isOpen={showRecipientPopover}
                                            reference={recipientPopoverRef}
                                            title="Danh sách người nhận đã lưu"
                                            items={listRecipientSave}
                                            onSelect={(idx) => {
                                                setRecipientForm(listRecipientSave[idx]);
                                                setRecipientInfo(listRecipientSave[idx]);
                                                setShowRecipientPopover(false);
                                            }}
                                            onDelete={async (idx, id) => {
                                                const newList = listRecipientSave.filter((_, i) => i !== idx);
                                                await DeleteConsigneeFavorite(id);
                                                setListRecipientSave(newList);
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Recipient Basic Info */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="recipient_name" className="text-gray-700 dark:text-gray-300">Name</Label>
                                        <Input
                                            type="text"
                                            id="recipient_name"
                                            name="fullName"
                                            value={recipientForm.fullName || ''}
                                            onChange={handleRecipientChange}
                                            className={`bg-white dark:bg-gray-800 ${recipientErrors.fullName ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
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

                                    <div>
                                        <Label htmlFor="recipient_taxCode" className="text-gray-700 dark:text-gray-300">Tax Code</Label>
                                        <Input
                                            type="text"
                                            id="recipient_taxCode"
                                            name="taxCode"
                                            value={recipientForm.taxCode || ''}
                                            onChange={handleRecipientChange}
                                            className={`bg-white dark:bg-gray-800 ${recipientErrors.taxCode ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
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
                                <button

                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleSaveRecipient(e);
                                    }}

                                >save recipient</button>
                            </div>
                        </div>

                        {/* Nút hiển thị/ẩn form nhận hàng */}
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <Button
                                size="sm"
                                type="button" // Đảm bảo type là "button" để không submit form
                                onClick={(e) => {
                                    e.preventDefault(); // Ngăn chặn hành vi mặc định
                                    e.stopPropagation(); // Ngăn chặn sự kiện lan truyền
                                    setShowDeliveryForm(!showDeliveryForm);
                                }}
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

                                    <div className="relative">
                                        <button
                                            className="px-3 py-1.5 bg-green-100 text-green-600 rounded-md text-sm font-medium hover:bg-green-200 transition-colors"
                                            onClick={handleSetupDeliverySave}
                                        >
                                            <span className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                                </svg>
                                                Danh sách đã lưu
                                            </span>
                                        </button>
                                        <SavedItemsPopover
                                            isOpen={showDeliveryPopover}
                                            reference={deliveryPopoverRef}
                                            title="Danh sách địa chỉ giao hàng đã lưu"
                                            items={listDeliverySave}
                                            onSelect={(idx) => {
                                                setDeliveryForm(listDeliverySave[idx]);
                                                setAddressBackup(listDeliverySave[idx]);
                                                setShowDeliveryPopover(false);
                                            }}
                                            onDelete={async (idx, id) => {
                                                const newList = listDeliverySave.filter((_, i) => i !== idx);
                                                await DeleteConsigneeFavorite(id);
                                                setListDeliverySave(newList);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Tên người đưa</Label>
                                        <Input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={deliveryForm.name || ''}
                                            onChange={handleDeliveryChange}
                                            className={`bg-white dark:bg-gray-800 ${deliveryErrors.receiverName ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                                        />
                                    </div>


                                    <div>
                                        <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Số điện thoại</Label>
                                        <Input
                                            type="text"
                                            id="phone"
                                            name="phone"
                                            value={deliveryForm.phone || ''}
                                            onChange={handleDeliveryChange}
                                            className={`bg-white dark:bg-gray-800 ${deliveryErrors.receiverPhone ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                                        />
                                    </div>


                                    <div>
                                        <DatePicker
                                            id="date"
                                            label="Ngày nhận"
                                            placeholder="Chọn ngày nhận"
                                            defaultDate={deliveryForm.date || getCurrentDate()} // Sử dụng ngày hiện tại làm mặc định
                                            onChange={handleDateChange}
                                            className={deliveryErrors.date ? "border-red-500" : ""}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="time" className="text-gray-700 dark:text-gray-300">Giờ nhận</Label>
                                        <div className="relative">
                                            <Input
                                                type="time"
                                                id="time"
                                                name="time"
                                                value={deliveryForm.time || ''}
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
                                        <Label htmlFor="address" className="text-gray-700 dark:text-gray-300">Địa chỉ nhận hàng</Label>
                                        <Input
                                            type="text"
                                            id="address"
                                            name="address"
                                            value={deliveryForm.address || ''}
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
                                <button

                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleSaveDeliveryBackup(e);
                                    }}

                                >save delivery backup</button>

                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                size="sm"
                                variant="outline"
                                type="button" // Đảm bảo type là "button" để không submit form
                                onClick={(e) => {
                                    e.preventDefault(); // Ngăn chặn hành vi mặc định
                                    handleConfirm(e);
                                }}
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
                                Sender: {senderForm.fullName || 'N/A'} • Recipient: {recipientForm.fullName || 'N/A'}
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

            <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                    onClick={() => setIsPackage(true)}
                    className={`px-4 py-2 text-sm font-medium rounded-l-lg border focus:z-10 focus:ring-2 focus:ring-purple-300 transition-colors ${isPackage
                        ? "bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    <div className="flex items-center">
                        <PackageIcon className="w-4 h-4 mr-2" />
                        Packages
                    </div>
                </button>

                <button
                    onClick={() => setIsPackage(false)}
                    className={`px-4 py-2 text-sm font-medium rounded-r-lg border focus:z-10 focus:ring-2 focus:ring-purple-300 transition-colors ${!isPackage
                        ? "bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    <div className="flex items-center">
                        <FileTextIcon className="w-4 h-4 mr-2" />
                        Document
                    </div>
                </button>
            </div>


            {
                isPackage ? (
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
                ) : (
                    <Document
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
                )
            }
        </div>
    );
}
