const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
app.use(cors());
app.use(express.json());

// 1. MONGODB CONNECTION
const mongoURI = "mongodb://rfenil77_db_user:c0k3DFzx6goCWYnY@ac-h4ncz7a-shard-00-00.aypqvt0.mongodb.net:27017,ac-h4ncz7a-shard-00-01.aypqvt0.mongodb.net:27017,ac-h4ncz7a-shard-00-02.aypqvt0.mongodb.net:27017/?ssl=true&replicaSet=atlas-dhoxfw-shard-0&authSource=admin&appName=GCAS";

mongoose.connect(mongoURI)
    .then(() => console.log("MongoDB Atlas Connected Successfully"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// 2. CLOUDINARY CONFIGURATION
cloudinary.config({
  cloud_name: 'djlm6cbra',
  api_key: '262687152821922',
  api_secret: 'g5ZeI8Kd8WZPfyboVsx4bFOlYYk' 
});

// 3. STORAGE SETUP (Resource Type 'auto' allows PDFs and Images)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'GCAS_Applications', 
    resource_type: 'auto', 
    allowed_formats: ['jpg', 'png', 'pdf', 'jpeg'],
  },
});
const upload = multer({ storage: storage });

// 4. APPLICATION SCHEMA
const applicationSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    email: String,
    adhar: String,
    marksheet12Number: { type: String, default: "" }, // Added for search
    files: Object,
    // Admin Fields
    whofill: { type: String, default: "" },
    timing: { type: String, default: "" },
    date: { type: String, default: "" },
    medium: { type: String, default: "" },
    degree: { type: String, default: "" },
    gcasusername: { type: String, default: null },
    gcaspassword: { type: String, default: null },
    gcasfilelast: { type: Object, default: null }
});
const Application = mongoose.model('Application', applicationSchema);

// --- ROUTES ---

// A. USER SUBMISSION ROUTE
app.post('/api/apply', upload.fields([
    { name: 'marksheet10' }, { name: 'marksheet12' }, 
    { name: 'casteCert' }, { name: 'nclCert' },    
    { name: 'leavingCert' }, { name: 'incomeCert' }, 
    { name: 'photo' }
]), async (req, res) => {
    try {
        const newApp = new Application({
            ...req.body,
            files: req.files
        });
        await newApp.save();
        res.status(200).json({ success: true, message: "Saved Successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// B. ADMIN: GET ALL APPLICATIONS
app.get('/api/admin/applications', async (req, res) => {
    try {
        const apps = await Application.find().sort({ _id: -1 });
        res.json(apps);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// C. ADMIN: UPDATE RECORD (CRUD)
// This route handles text updates and the optional final file upload
app.put('/api/admin/update/:id', upload.single('gcasfilelast'), async (req, res) => {
    try {
        const updateData = { ...req.body };

        // If a new final file is uploaded, update the object
        if (req.file) {
            updateData.gcasfilelast = {
                path: req.file.path,
                filename: req.file.filename
            };
        }

        const updatedApp = await Application.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true }
        );
        res.json(updatedApp);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// D. ADMIN: DELETE RECORD
app.delete('/api/admin/delete/:id', async (req, res) => {
    try {
        await Application.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. SERVER START
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});