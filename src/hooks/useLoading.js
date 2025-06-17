import { useState } from 'react';
import { message } from 'antd';

export const useLoading = () => {
    const [loading, setLoading] = useState(false);

    const withLoading = async (operation, successMessage = 'Thao tác thành công', errorMessage = 'Có lỗi xảy ra') => {
        setLoading(true);
        try {
            await operation();
            message.success(successMessage);
        } catch (error) {
            console.error('Operation error:', error);
            message.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        withLoading
    };
}; 