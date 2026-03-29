const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require("./routes/categoryRoutes"); 
const adminRoutes = require("./routes/adminRoures"); 
const adminuserRoutes = require("./routes/adminuserRoutes"); 
const subcategoryRoutes = require("./routes/subcategoryRoutes");
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use('/uploads', express.static('uploads')); 
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes); 
app.use("/api/admin", adminRoutes); 
app.use('/api/services', require('./routes/serviceRoutes'));
app.use("/api/adminUser", adminuserRoutes); 

connectDB();

app.get("/", (req, res) => res.send("API is running..."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});