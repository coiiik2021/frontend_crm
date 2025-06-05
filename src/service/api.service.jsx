import axios from "./axios.customize";

const GetPriceNetViettel = async () => {
  const API =
    "/EXPORT%20-%20pkg%20Saver!A9:K52?key=AIzaSyCG2DZqV_CDvtKqDkn4acepQiWq7otowKI";
  return await axios.get(API);
};

const GetCodeByCompany = async () => {
  const API = "/zoneall!A2:F220?key=AIzaSyCG2DZqV_CDvtKqDkn4acepQiWq7otowKI";

  return await axios.get(API);
};

const GetPriceNetDHLVN = async () => {
  const API = "/DHLVN!A2:K63?key=AIzaSyCG2DZqV_CDvtKqDkn4acepQiWq7otowKI";
  return await axios.get(API);
};

const GetPriceNetDHLSin = async () => {
  const API = "/DHLSIN!A2:P64?key=AIzaSyCG2DZqV_CDvtKqDkn4acepQiWq7otowKI";
  return await axios.get(API);
};

const GetPriceNetSF = async () => {
  const API = "/SF!A2:Q67?key=AIzaSyCG2DZqV_CDvtKqDkn4acepQiWq7otowKI";
  return await axios.get(API);
};

const GetPriceNetFedEx = async () => {
  const API = "/FEdEx!A2:W49?key=AIzaSyCG2DZqV_CDvtKqDkn4acepQiWq7otowKI";
  return await axios.get(API);
};

const GetPriceNetSeaTrucking = async () => {
  const API = "/SEA!B3:K8?key=AIzaSyCG2DZqV_CDvtKqDkn4acepQiWq7otowKI";
  return await axios.get(API);
};

const GetPriceNetSeaNoTrucking = async () => {
  const API = "/SEA!B24:E29?key=AIzaSyCG2DZqV_CDvtKqDkn4acepQiWq7otowKI";
  return await axios.get(API);
};

const GetPriceNetTMDT = async () => {
  const API = "/TMDT!B1:B40?key=AIzaSyCG2DZqV_CDvtKqDkn4acepQiWq7otowKI";
  return await axios.get(API);
};

const GetTrackingOrder = (code) => {
  const prefix = code.substring(0, 2).toUpperCase();
  console.log(prefix);

  switch (prefix) {
    case "SF":
      return "SF Express";
    case "DH":
      return "DHL";
    case "UP":
      return "UPS";
    default:
      return "Không rõ hãng (Unknown)";
  }
};

export {
  GetPriceNetViettel,
  GetPriceNetDHLVN,
  GetPriceNetFedEx,
  GetPriceNetSF,
  GetPriceNetDHLSin,
  GetPriceNetSeaTrucking,
  GetPriceNetSeaNoTrucking,
  GetPriceNetTMDT,
  GetCodeByCompany,
  GetTrackingOrder,
};
