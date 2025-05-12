"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderProvider = OrderProvider;
exports.useOrder = useOrder;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var OrderContext = (0, react_1.createContext)();
function OrderProvider(_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)({
        name: "",
        company: "",
        email: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        postCode: "",
        country: ""
    }), recipientInfo = _b[0], setRecipientInfo = _b[1];
    var _c = (0, react_1.useState)([]), packages = _c[0], setPackages = _c[1];
    return ((0, jsx_runtime_1.jsx)(OrderContext.Provider, { value: {
            recipientInfo: recipientInfo,
            setRecipientInfo: setRecipientInfo,
            packages: packages,
            setPackages: setPackages
        }, children: children }));
}
function useOrder() {
    var context = (0, react_1.useContext)(OrderContext);
    if (!context) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
}
