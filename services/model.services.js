import api from "../utils/api.util.js";

/* Pre-mature functions related to the model */

export const train_model = async (file) => {
    try {
        const res = await api.post("/api/train", file);
        return res.data
    } catch (error) {
        throw new Error(error)
    }
};

export const predict = async (data) => {
    try {
        const res = await api.post("/api/predict", data);
        return res.data;
    } catch (error) {
        throw new Error(error)
    }
};

export const getModelHealth = async () => {
    try {
        const res = await api.get("/api/health");
        return res.data
    } catch (error) {
        throw new Error(error)
    }
};

export const predict_batch = async (data) => {
    try {
        const res = await api.post("/api/predict_batch", data);
        return res.data
    } catch (error) {
        throw new Error(error);
    }
};

