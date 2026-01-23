import Page from "../models/page.model.js";

const createPage = async (req, res) => {
  try {
    const { name, mobile, comment, description } = req.body;    
    const page = new Page({ name, mobile, comment, description });   
    await page.save();    
    res.status(201).json({ message: "Page created successfully", page });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  } 
};

const getPages = async (req, res) => {
    try {
        const {limit = 10, page = 1} = req.query;
        const pages = await Page.find()
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        const total = await Page.countDocuments();
        res.status(200).json({ pages, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {       
        res.status(500).json({ message: "Server error", error: error.message });
    }   
};
export default {
  createPage,
  getPages
};