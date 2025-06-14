import { useEffect, useState } from "react";
import { GetUserOfManager } from "../../../service/api.admin.service";
import { TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

export default function UserOfManager({ user }) {
    const [dataUser, setDataUser] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const dataUserResponse = await GetUserOfManager(user?.id);

                // Kiểm tra cấu trúc dữ liệu trả về
                console.log("API response:", dataUserResponse);

                // Kiểm tra xem dataUserResponse có phải là mảng không
                if (Array.isArray(dataUserResponse)) {
                    setDataUser(dataUserResponse);
                } else if (dataUserResponse && Array.isArray(dataUserResponse.data)) {
                    // Nếu dữ liệu nằm trong thuộc tính data
                    setDataUser(dataUserResponse.data);
                } else {
                    console.error("Unexpected API response format:", dataUserResponse);
                    setError("Dữ liệu không đúng định dạng");
                    setDataUser([]);
                }
            } catch (err) {
                console.error("Error loading user data:", err);
                setError("Không thể tải dữ liệu người dùng");
                setDataUser([]);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            loadData();
        }
    }, [user?.id]);

    // Hàm tính tuổi từ ngày sinh
    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return "";

        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    // Hàm định dạng ngày tháng
    const formatDate = (dateString) => {
        if (!dateString) return "";

        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    return (
        <>
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
                    Danh sách người dùng
                </h3>

                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-red-500">{error}</div>
                ) : dataUser.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Không có dữ liệu người dùng</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    {[
                                        { key: "fullName", label: "Họ và tên" },
                                        { key: "email", label: "Email" },
                                        { key: "phone", label: "Số điện thoại" },
                                        { key: "dateOfBirth", label: "Tuổi" },
                                        { key: "createdAt", label: "Ngày bắt đầu" },
                                        { key: "kpi", label: "KPI" },
                                    ].map(({ key, label }) => (
                                        <th
                                            key={key}
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                                        >
                                            {label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                                {dataUser.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {item.fullName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {item.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {item.phone}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {calculateAge(item.dateOfBirth)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(item.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {item.kpi}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
