import {
    getAllStreamerChannels,
    createStreamerChannel,
} from "../models/streamerChannel.model.js";

export const listarCanales = async (req, res) => {
    try {
        const data = await getAllStreamerChannels();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo los canales", error });
    }
};

export const registrarCanal = async (req, res) => {
    try {
        const nuevo = await createStreamerChannel(req.body);
        res.status(201).json(nuevo);
    } catch (err) {
        res.status(500).json({ message: "Error registrando canal", error: err });
    }
};
