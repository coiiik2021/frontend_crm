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
    console.log("API", API);
    return await axios.get(API);
};


// price gas Oline
const GetPriceAllGasoline = async (name) => {
    const API = `price-gas-oline/all?name=${name}`;
    return await axios.get(API);
}

const PostPriceGasoline = async (data) => {
    const API = `price-gas-oline`;
    return await axios.post(API, data);
}

const DeletePriceGasonline = async (id) => {
    const API = `price-gas-oline/${id}`;
    return await axios.delete(API);
}


// const net 

const GetConstNet = async (name) => {
    const API = `const-net?name=${name}`;
    return await axios.get(API);
}

const PutConstNet = async (data) => {
    const API = `const-net`;
    return await axios.put(API, data);
}

const PostConstNet = async (data) => {
    const API = `const-net`;
    return await axios.post(API, data);
}

export { GetPriceNet, PostPriceNet, PostZoneCountry, GetZoneCountry, GetAZoneCountry, GetAPriceNet, GetPriceAllGasoline, PostPriceGasoline, DeletePriceGasonline };

export { GetConstNet, PutConstNet, PostConstNet };