import axios from "axios";

// const axiosClient = axios.create({
//     baseURL: "http://10.0.0.59:8080",
//     withCredentials: "true",
// });

// const axiosClient = axios.create({
//     baseURL: "http://localhost:5002",
//     withCredentials: "true",
// });

const axiosClient = axios.create({
    baseURL: "http://10.0.0.5:5002",
    withCredentials: "true",
});

export default axiosClient;
