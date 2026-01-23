import mongoose from "mongoose";

const cordinateSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
}, { timestamps: true });   
export default mongoose.model("Cordinate",cordinateSchema)