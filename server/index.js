// const express = require('express');
// const mongoose = require('mongoose');
// const multer = require('multer');
// const cors = require('cors');
// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');

// const app = express();
// app.use(cors());
// app.use(express.json());

// // 1. MONGODB CONNECTION
// const mongoURI = "mongodb://rfenil77_db_user:c0k3DFzx6goCWYnY@ac-h4ncz7a-shard-00-00.aypqvt0.mongodb.net:27017,ac-h4ncz7a-shard-00-01.aypqvt0.mongodb.net:27017,ac-h4ncz7a-shard-00-02.aypqvt0.mongodb.net:27017/?ssl=true&replicaSet=atlas-dhoxfw-shard-0&authSource=admin&appName=GCAS";

// mongoose.connect(mongoURI)
//     .then(() => console.log("MongoDB Atlas Connected Successfully"))
//     .catch(err => console.error("MongoDB Connection Error:", err));

// // 2. CLOUDINARY CONFIGURATION
// cloudinary.config({
//   cloud_name: 'djlm6cbra',
//   api_key: '262687152821922',
//   api_secret: 'g5ZeI8Kd8WZPfyboVsx4bFOlYYk' 
// });

// // 3. STORAGE SETUP (Resource Type 'auto' allows PDFs and Images)
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'GCAS_Applications', 
//     resource_type: 'auto', 
//     allowed_formats: ['jpg', 'png', 'pdf', 'jpeg'],
//   },
// });
// const upload = multer({ storage: storage });

// // 4. APPLICATION SCHEMA
// const applicationSchema = new mongoose.Schema({
//     name: String,
//     mobile: String,
//     email: String,
//     adhar: String,
//     marksheet12Number: { type: String, default: "" }, // Added for search
//     files: Object,
//     // Admin Fields
//     whofill: { type: String, default: "" },
//     timing: { type: String, default: "" },
//     date: { type: String, default: "" },
//     medium: { type: String, default: "" },
//     degree: { type: String, default: "" },
//     gcasusername: { type: String, default: null },
//     gcaspassword: { type: String, default: null },
//     gcasfilelast: { type: Object, default: null }
// });
// const Application = mongoose.model('Application', applicationSchema);

// // --- ROUTES ---

// // A. USER SUBMISSION ROUTE
// app.post('/api/apply', upload.fields([
//     { name: 'marksheet10' }, { name: 'marksheet12' }, 
//     { name: 'casteCert' }, { name: 'nclCert' },    
//     { name: 'leavingCert' }, { name: 'incomeCert' }, 
//     { name: 'photo' }
// ]), async (req, res) => {
//     try {
//         const newApp = new Application({
//             ...req.body,
//             files: req.files
//         });
//         await newApp.save();
//         res.status(200).json({ success: true, message: "Saved Successfully!" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // B. ADMIN: GET ALL APPLICATIONS
// app.get('/api/admin/applications', async (req, res) => {
//     try {
//         const apps = await Application.find().sort({ _id: -1 });
//         res.json(apps);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // C. ADMIN: UPDATE RECORD (CRUD)
// // This route handles text updates and the optional final file upload
// app.put('/api/admin/update/:id', upload.single('gcasfilelast'), async (req, res) => {
//     try {
//         const updateData = { ...req.body };

//         // If a new final file is uploaded, update the object
//         if (req.file) {
//             updateData.gcasfilelast = {
//                 path: req.file.path,
//                 filename: req.file.filename
//             };
//         }

//         const updatedApp = await Application.findByIdAndUpdate(
//             req.params.id, 
//             updateData, 
//             { new: true }
//         );
//         res.json(updatedApp);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // D. ADMIN: DELETE RECORD
// app.delete('/api/admin/delete/:id', async (req, res) => {
//     try {
//         await Application.findByIdAndDelete(req.params.id);
//         res.json({ message: "Deleted successfully" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // 5. SERVER START
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`Server is running on port ${PORT}`);
// });
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
    .then(() => console.log("✅ MongoDB Atlas Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// 2. CLOUDINARY CONFIGURATION
cloudinary.config({
    cloud_name: 'djlm6cbra',
    api_key: '262687152821922',
    api_secret: 'g5ZeI8Kd8WZPfyboVsx4bFOlYYk'
});

// 3. STORAGE SETUP (Resource Type 'auto' allows PDFs and Images)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    // params: {
    //     folder: 'GCAS_Applications',
    //     resource_type: 'auto',
    //     allowed_formats: ['jpg', 'png', 'pdf', 'jpeg'],
    // },
    params: async (req, file) => {
    let resourceType = 'image';

    // If file is PDF → treat as RAW
    if (file.mimetype === 'application/pdf') {
        resourceType = 'raw';
    }

    return {
        folder: 'GCAS_Applications',
        resource_type: resourceType,
        public_id: Date.now() + '-' + file.originalname,
    };
    },
});
const upload = multer({ storage: storage });

// 4. APPLICATION SCHEMA
const applicationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    adhar: { type: String, required: true },
    marksheet12Number: { type: String, default: "" },
    files: { type: Object, default: {} },
    // Admin Fields
    whofill: { type: String, default: "" },
    timing: { type: String, default: "" },
    date: { type: String, default: "" },
    medium: { type: String, default: "" },
    degree: { type: String, default: "" },
    gcasusername: { type: String, default: null },
    gcaspassword: { type: String, default: null },
    gcasfilelast: { type: Object, default: null },
    createdAt: { type: Date, default: Date.now }
});

const Application = mongoose.model('Application', applicationSchema);

// --- ROUTES ---

// A. USER SUBMISSION ROUTE
app.post('/api/apply', upload.fields([
    { name: 'marksheet10' },
    { name: 'marksheet12' },
    { name: 'casteCert' },
    { name: 'nclCert' },
    { name: 'leavingCert' },
    { name: 'incomeCert' },
    { name: 'photo' }
]), async (req, res) => {
    try {
        // Extract marksheet12 number from the uploaded file or request body
        const marksheet12Number = req.body.marksheet12Number || generateMarksheetNumber();
        
        const newApp = new Application({
            name: req.body.name,
            mobile: req.body.mobile,
            email: req.body.email,
            adhar: req.body.adhar,
            marksheet12Number: marksheet12Number,
            //files: req.files,
            files: Object.fromEntries(
                    Object.entries(req.files || {}).map(([key, value]) => [
                    key,
                    value.map(file => ({
                        url: file.path,
                          type: file.mimetype,
                        name: file.originalname
                    }))
                  ])  
            ),
            whofill: req.body.whofill || "",
            timing: req.body.timing || "",
            date: req.body.date || new Date().toISOString().split('T')[0],
            medium: req.body.medium || "",
            degree: req.body.degree || ""
        });
        
        await newApp.save();
        res.status(200).json({ 
            success: true, 
            message: "Application Saved Successfully!",
            applicationId: newApp._id 
        });
    } catch (err) {
        console.error("Submission Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Helper function to generate unique marksheet number
function generateMarksheetNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `GCAS/${year}/${random}`;
}

// B. ADMIN: GET ALL APPLICATIONS
app.get('/api/admin/applications', async (req, res) => {
    try {
        const apps = await Application.find().sort({ createdAt: -1 });
        console.log(`📊 Retrieved ${apps.length} applications`);
        res.json(apps);
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// C. ADMIN: GET SINGLE APPLICATION BY ID
app.get('/api/admin/application/:id', async (req, res) => {
    try {
        const app = await Application.findById(req.params.id);
        if (!app) {
            return res.status(404).json({ error: "Application not found" });
        }
        res.json(app);
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// D. ADMIN: UPDATE RECORD (CRUD)
app.put('/api/admin/update/:id', upload.single('gcasfilelast'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        
        // Remove fields that shouldn't be updated directly
        delete updateData._id;
        delete updateData.__v;
        delete updateData.createdAt;
        
        // If a new final file is uploaded, update the object
        if (req.file) {
                updateData.gcasfilelast = {
                url: req.file.path, // Use 'url' to match your frontend logic
                type: req.mimetype,
                name: req.file.originalname,
                uploadDate: new Date()
            };
        }
        
        const updatedApp = await Application.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!updatedApp) {
            return res.status(404).json({ error: "Application not found" });
        }
        
        console.log(`✅ Updated application: ${updatedApp._id}`);
        res.json({ 
            success: true, 
            message: "Application updated successfully",
            data: updatedApp 
        });
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// E. ADMIN: DELETE RECORD
app.delete('/api/admin/delete/:id', async (req, res) => {
    try {
        const deletedApp = await Application.findByIdAndDelete(req.params.id);
        
        if (!deletedApp) {
            return res.status(404).json({ error: "Application not found" });
        }
        
        console.log(`🗑️ Deleted application: ${deletedApp._id} - ${deletedApp.name}`);
        res.json({ 
            success: true, 
            message: "Application deleted successfully",
            deletedId: req.params.id
        });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// F. ADMIN: GET STATISTICS
app.get('/api/admin/stats', async (req, res) => {
    try {
        const total = await Application.countDocuments();
        const completed = await Application.countDocuments({
            gcasusername: { $ne: null },
            gcaspassword: { $ne: null }
        });
        const pending = total - completed;
        
        // Get today's applications
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayApps = await Application.countDocuments({
            createdAt: { $gte: today }
        });
        
        res.json({
            total,
            completed,
            pending,
            todayApplications: todayApps
        });
    } catch (err) {
        console.error("Stats Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// G. ADMIN: SEARCH APPLICATIONS
app.get('/api/admin/search', async (req, res) => {
    try {
        const { q, type } = req.query;
        
        let searchQuery = {};
        if (type === 'name') {
            searchQuery = { name: { $regex: q, $options: 'i' } };
        } else if (type === 'marksheet') {
            searchQuery = { marksheet12Number: { $regex: q, $options: 'i' } };
        } else if (type === 'mobile') {
            searchQuery = { mobile: { $regex: q, $options: 'i' } };
        } else {
            searchQuery = {
                $or: [
                    { name: { $regex: q, $options: 'i' } },
                    { marksheet12Number: { $regex: q, $options: 'i' } },
                    { mobile: { $regex: q, $options: 'i' } }
                ]
            };
        }
        
        const results = await Application.find(searchQuery).sort({ createdAt: -1 });
        res.json(results);
    } catch (err) {
        console.error("Search Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// H. HEALTH CHECK ENDPOINT
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// I. ROOT ENDPOINT
app.get('/', (req, res) => {
    res.json({
        message: 'GCAS API Server is Running',
        version: '1.0.0',
        endpoints: {
            'POST /api/apply': 'Submit new application',
            'GET /api/admin/applications': 'Get all applications',
            'GET /api/admin/application/:id': 'Get single application',
            'PUT /api/admin/update/:id': 'Update application',
            'DELETE /api/admin/delete/:id': 'Delete application',
            'GET /api/admin/stats': 'Get statistics',
            'GET /api/admin/search': 'Search applications',
            'GET /api/health': 'Health check'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Global Error:", err);
    res.status(500).json({ 
        error: "Internal Server Error",
        message: err.message 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: "Route not found",
        path: req.originalUrl 
    });
});

// 5. SERVER START
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server is running on port ${PORT}`);
    console.log(`📡 API URL: http://localhost:${PORT}`);
    console.log(`✅ MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    console.log(`☁️ Cloudinary: Configured\n`);
});