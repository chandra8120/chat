import Cordinates from "../models/cordinates.model.js";

const createCordinate = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const newCordinate = new Cordinates({ latitude, longitude });
        const savedCordinate = await newCordinate.save();
        res.status(201).json(savedCordinate);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }   
};

const getAllCordinates = async (req, res) => {
    try {
        const cordinates = await Cordinates.find();
        res.status(200).json(cordinates);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};
export default { createCordinate, getAllCordinates };