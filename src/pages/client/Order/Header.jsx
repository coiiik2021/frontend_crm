import React from 'react';
import { motion } from 'framer-motion';

const Header = ({ currentStep, setCurrentStep }) => {
    const steps = [
        { id: 1, title: "Shipment Details" },
        { id: 2, title: "Information Order" },
        { id: 3, title: "Products" },
        { id: 4, title: "Form Detail Order" }
    ];

    const handleStepClick = (stepId) => {
        // Cho phép quay lại các bước trước
        if (stepId < currentStep) {
            setCurrentStep(stepId);
        }
        // Không cho phép nhảy tới các bước sau
        // Chỉ cho phép đi tiếp khi đã hoàn thành bước hiện tại
    };

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center">
                            <motion.div
                                className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer
                                    ${currentStep >= step.id ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                                onClick={() => handleStepClick(step.id)}
                                whileHover={currentStep >= step.id ? { scale: 1.1 } : {}}
                                whileTap={currentStep >= step.id ? { scale: 0.9 } : {}}
                            >
                                {step.id}
                            </motion.div>
                            <span className="text-sm mt-2 text-gray-600">{step.title}</span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-1 mx-4 ${currentStep > step.id ? 'bg-purple-600' : 'bg-gray-200'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default Header;