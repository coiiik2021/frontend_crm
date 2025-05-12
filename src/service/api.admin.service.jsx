import axios from "./axios.admin.customize";

// price net
const GetPriceNet = async (name) => {
    const API = `/prices?name=${name}`;
    return await axios.get(API);
};

const PostPriceNet = async (name, data) => {
    const API = `/prices?name=${name}`;
    data = {
        data: data,
    }
    return await axios.post(API, data);
};

// country
const GetZoneCountry = async () => {
    const API = `/zone-country/all`;
    return await axios.get(API);
}

const PostZoneCountry = async (data) => {
    const API = `/zone-country`;
    data = {
        data: data,
    }
    return await axios.post(API, data);
}

const GetAZoneCountry = async (name) => {
    const API = `/zone-country?name=${name}`;
    return await axios.get(API);
}


const GetAPriceNet = async (name, zone, weight) => {
    const API = `/prices/getPriceNet?name=${name}&weight=${weight}&zone=${zone}`;
    console.log(API);
    return await axios.get(API);
};


export { GetPriceNet, PostPriceNet, PostZoneCountry, GetZoneCountry, GetAZoneCountry, GetAPriceNet };
