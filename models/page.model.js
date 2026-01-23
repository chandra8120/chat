import mongoose from "mongoose";

const pageSchema=new mongoose.Schema({
    name:{type:String,required:true},
    mobile:{type:String,required:true},
    comment:{type:String,required:true},
    description:{type:String}
})
export default mongoose.model("Page",pageSchema)