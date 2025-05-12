import React from "react";
import { Fade } from "react-awesome-reveal";
import Button from "../elements/Button";
import CheckStatusOrder from "./CheckStatusOrder";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Hero() {
    const [selectedCampaign, setSelectedCampaign] = useState('CHUYỂN PHÁT NHANH');

    const campaigns = {
        'CHUYỂN PHÁT NHANH': {
            description: 'Tận hưởng các ưu đãi nổi bật từ 4 hãng vận chuyển quốc tế hàng đầu:',
            benefits: [
                'UPS: Giao hàng nhanh 1–3 ngày, ưu đãi giá tốt cho doanh nghiệp xuất khẩu',
                'FedEx: Hỗ trợ thủ tục hải quan & giảm cước cho khách hàng thường xuyên',
                'DHL: Miễn phí nhận hàng tận nơi – hỗ trợ Door-to-Door toàn cầu',
                'SF Express: Giá tiết kiệm – giao hàng ổn định sang Trung Quốc & châu Á',
                'Tất cả đơn hàng đều được theo dõi 24/7 và cam kết giao đúng hẹn'
            ]
        }
        ,
        'HÀNG BIỂN GHÉP ĐI US': {
            description: 'Tối ưu chi phí, tối đa hiệu quả với dịch vụ vận chuyển đường biển ghép:',
            benefits: [
                'Giảm ngay 20% cho đơn hàng đầu tiên',
                'Vận chuyển tiết kiệm chỉ từ 50.000đ/kg',
                'Thời gian linh hoạt 25–35 ngày đến Mỹ',
                'Miễn phí đóng gỗ, đóng kiện – tiết kiệm thêm chi phí',
                'Bảo hiểm hàng hóa lên đến 100% giá trị thực tế'
            ]
        },
        'TMDT VN-US': {
            description: 'Giải pháp tối ưu cho các shop online & nhà bán hàng TMĐT Việt – Mỹ:',
            benefits: [
                'Ưu đãi 15% cho các shop TMĐT gửi hàng định kỳ',
                'Hỗ trợ đóng gói chuyên nghiệp theo yêu cầu từng đơn',
                'Miễn phí 30 ngày lưu kho tại Mỹ',
                'Lo trọn gói thủ tục hải quan 2 chiều – không phát sinh',
                'Tích hợp API** với các sàn TMĐT để đồng bộ đơn hàng'
            ]
        }
    };


    return (
        <section className="hero px-4 sm:px-6 lg:px-8 py-8 lg:py-12 bg-gradient-to-b from-blue-50 to-white">
            <div className="container mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10 xl:gap-14">
                    {/* Content Section - Left Side */}
                    <div className="w-full lg:w-1/2 lg:pl-4 xl:pl-10 order-2 lg:order-1">
                        <Fade direction="left" triggerOnce cascade damping={0.2}>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl text-theme-blue font-bold leading-tight mb-3 sm:mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Ưu đãi tháng 5
                </span>
                            </h1>

                            {/* Campaign buttons - Tối ưu cho mobile */}
                            <div className="flex flex-col sm:flex-row gap-2 mb-6 w-full">
                                {Object.keys(campaigns).map((campaign) => (
                                    <button
                                        key={campaign}
                                        onClick={() => setSelectedCampaign(campaign)}
                                        className={`flex-1 min-w-0 px-3 py-2 text-sm sm:text-base rounded-md font-medium transition-all 
        ${
                                            selectedCampaign === campaign
                                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                        style={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}
                                    >
                                        {campaign.split(' ').map((word, i, arr) => (
                                            <span key={i} className={i === arr.length - 1 ? '' : 'whitespace-nowrap'}>
          {word}{i < arr.length - 1 ? ' ' : ''}
        </span>
                                        ))}
                                    </button>
                                ))}
                            </div>

                            {/* Nội dung với hiệu ứng mượt mà */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedCampaign}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <p className="font-light text-sm sm:text-base text-gray-600 leading-relaxed mb-5 sm:mb-7">
                                        {campaigns[selectedCampaign].description}
                                        <ul className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2">
                                            {campaigns[selectedCampaign].benefits.map((benefit, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="mr-2 mt-0.5 text-theme-purple">✓</span>
                                                    <span className="text-sm sm:text-base">{benefit}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </p>
                                </motion.div>
                            </AnimatePresence>

                            {/* Các nút hành động - Tối ưu kích thước */}
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                                        const zaloURL = 'https://zaloapp.com/qr/p/1qg64agb3q6dw';

                                        if (isIOS) {
                                            // iOS: dùng location.href để tránh bị reload
                                            window.location.href = zaloURL;
                                        } else {
                                            // Android: vẫn dùng window.open nếu muốn mở tab mới
                                            window.open(zaloURL, '_blank');
                                        }
                                    }}
                                    className="flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-white text-sm sm:text-base bg-gradient-to-r from-theme-purple to-purple-600 rounded-md sm:rounded-lg shadow-sm sm:shadow-md hover:shadow-lg transition-all duration-300 hover:from-purple-600 hover:to-theme-purple transform hover:-translate-y-0.5"
                                >
                                    Nhận ưu lên đến 20%
                                    <svg
                                        className="ml-1.5 sm:ml-2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </Button>

                                <Button
                                    type="button"
                                    onClick={() => {
                                        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                                        const zaloURL = 'https://zaloapp.com/qr/p/1qg64agb3q6dw';

                                        if (isIOS) {
                                            // iOS: dùng location.href để tránh bị reload
                                            window.location.href = zaloURL;
                                        } else {
                                            // Android: vẫn dùng window.open nếu muốn mở tab mới
                                            window.open(zaloURL, '_blank');
                                        }
                                    }}
                                    className="flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-theme-purple text-sm sm:text-base bg-white border border-theme-purple rounded-md sm:rounded-lg shadow-sm sm:shadow-md hover:shadow-lg transition-all duration-300 hover:bg-gray-50 transform hover:-translate-y-0.5"
                                >
                                    Ưu đãi doanh nghiệp
                                    <svg
                                        className="ml-1.5 sm:ml-2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-theme-purple"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </Button>
                            </div>
                        </Fade>
                    </div>

                    {/* CheckStatusOrder Section - Right Side */}
                    <div className="w-full lg:w-1/2 order-1 lg:order-2">
                        <Fade direction="right" triggerOnce>
                            <div className="relative">
                                <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl sm:rounded-2xl blur opacity-75"></div>
                                <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-xl overflow-hidden p-1">
                                    <CheckStatusOrder />
                                </div>
                            </div>
                        </Fade>
                    </div>
                </div>
            </div>
        </section>
    );
}


