import axios from "axios";

const api = axios.create({
    BASE_URL : `${process.env.MODEL_URI}`
});

export default api