import User from "../models/user.model.js";
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt";


const adminLogin = async (req, res) => {
    try {
        const { userName, password } = req.body
        if (!userName || !password) {
            return res.status(400).json({ message: "userName and password are required !" })
        }
        if (userName === "admin" && password === "admin123") {
            return res.status(200).json({ message: "admin login successfull" })
        }
        else {
            return res.status(401).json({ message: "Invalid admin credentials" })
        }
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", err: error.message })
    }
}

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ message: "name, email and password are required !" })
        }
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new User({
            name,
            email,
            password: hashedPassword
        })
        await user.save()
        res.status(201).json({ message: "User registered successfully" })
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", err: error.message })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: "email and password are required !" })
        }
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const validatePassword = await bcrypt.compare(password, user.password)
        if (!validatePassword) {
            return res.status(401).json({ message: "Invalid password" })
        }
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        )
        res.status(200).json({ message: "User login successful", token,user })
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error", err: error.message })
    }
}

const updateProfile = async (req, res) => {
    try{
        const {id}=req.params;
        const {name,email}=req.body;
        const user=await User.findByIdAndUpdate(id,{name,email},{new:true});        
        if(!user){  
            return res.status(404).json({message:"User not found"});
        }   
        res.status(200).json({message:"Profile updated successfully",user});    
    }catch(error){
        res.status(500).json({ error: "Internal server error", err: error.message })

    }
}   
export default {
    adminLogin,
    signup,
    login,
    updateProfile
}