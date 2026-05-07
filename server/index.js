const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const app = express();

app.use(cors());
app.use(express.json());

/* =========================================
   MONGODB CONNECTION
========================================= */

const mongoURI =
    "mongodb://rfenil77_db_user:c0k3DFzx6goCWYnY@ac-h4ncz7a-shard-00-00.aypqvt0.mongodb.net:27017,ac-h4ncz7a-shard-00-01.aypqvt0.mongodb.net:27017,ac-h4ncz7a-shard-00-02.aypqvt0.mongodb.net:27017/?ssl=true&replicaSet=atlas-dhoxfw-shard-0&authSource=admin&appName=GCAS";

mongoose.connect(mongoURI)
    .then(() => {
        console.log("✅ MongoDB Atlas Connected Successfully");
    })
    .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err);
    });

/* =========================================
   CLOUDINARY CONFIG
========================================= */

cloudinary.config({
    cloud_name: 'djlm6cbra',
    api_key: '262687152821922',
    api_secret: 'g5ZeI8Kd8WZPfyboVsx4bFOlYYk'
});

/* =========================================
   MULTER MEMORY STORAGE
========================================= */

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024 // 20MB
    }
});

/* =========================================
   SCHEMA
========================================= */

const applicationSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    mobile: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    adhar: {
        type: String,
        required: true
    },

    marksheet12Number: {
        type: String,
        default: ""
    },

    files: {
        type: Object,
        default: {}
    },

    whofill: {
        type: String,
        default: ""
    },

    timing: {
        type: String,
        default: ""
    },

    date: {
        type: String,
        default: ""
    },

    medium: {
        type: String,
        default: ""
    },

    degree: {
        type: String,
        default: ""
    },

    gcasusername: {
        type: String,
        default: null
    },

    gcaspassword: {
        type: String,
        default: null
    },

    gcasfilelast: {
        type: Object,
        default: null
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

const Application = mongoose.model('Application', applicationSchema);

/* =========================================
   HELPER FUNCTION
========================================= */

function generateMarksheetNumber() {

    const year = new Date().getFullYear();

    const random = Math.floor(
        Math.random() * 10000
    ).toString().padStart(4, '0');

    return `GCAS/${year}/${random}`;
}

/* =========================================
   CLOUDINARY FILE UPLOAD FUNCTION
========================================= */

async function uploadToCloudinary(file) {

    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "GCAS_Applications",
                resource_type: "auto",
                public_id:
                    Date.now() +
                    "-" +
                    file.originalname.replace(/\.[^/.]+$/, "")
            },

            (error, result) => {

                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        streamifier
            .createReadStream(file.buffer)
            .pipe(stream);
    });
}

/* =========================================
   USER SUBMIT APPLICATION
========================================= */

app.post(
    '/api/apply',

    upload.fields([
        { name: 'marksheet10' },
        { name: 'marksheet12' },
        { name: 'casteCert' },
        { name: 'nclCert' },
        { name: 'leavingCert' },
        { name: 'incomeCert' },
        { name: 'photo' }
    ]),

    async (req, res) => {

        try {

            const uploadedFiles = {};

            for (const [key, files] of Object.entries(req.files || {})) {

                uploadedFiles[key] = [];

                for (const file of files) {

                    const result =
                        await uploadToCloudinary(file);

                    uploadedFiles[key].push({

                        url: result.secure_url,

                        type: file.mimetype,

                        name: file.originalname

                    });
                }
            }

            const newApp = new Application({

                name: req.body.name,

                mobile: req.body.mobile,

                email: req.body.email,

                adhar: req.body.adhar,

                marksheet12Number:
                    req.body.marksheet12Number ||
                    generateMarksheetNumber(),

                files: uploadedFiles,

                whofill: req.body.whofill || "",

                timing: req.body.timing || "",

                date:
                    req.body.date ||
                    new Date().toISOString().split('T')[0],

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

            res.status(500).json({
                error: err.message
            });
        }
    }
);

/* =========================================
   GET ALL APPLICATIONS
========================================= */

app.get('/api/admin/applications', async (req, res) => {

    try {

        const apps = await Application.find()
            .sort({ createdAt: -1 });

        res.json(apps);

    } catch (err) {

        console.error("Fetch Error:", err);

        res.status(500).json({
            error: err.message
        });
    }
});

/* =========================================
   GET SINGLE APPLICATION
========================================= */

app.get('/api/admin/application/:id', async (req, res) => {

    try {

        const appData =
            await Application.findById(req.params.id);

        if (!appData) {

            return res.status(404).json({
                error: "Application not found"
            });
        }

        res.json(appData);

    } catch (err) {

        console.error("Fetch Error:", err);

        res.status(500).json({
            error: err.message
        });
    }
});

/* =========================================
   UPDATE APPLICATION
========================================= */

app.put(
    '/api/admin/update/:id',

    upload.single('gcasfilelast'),

    async (req, res) => {

        try {

            const updateData = { ...req.body };

            delete updateData._id;
            delete updateData.__v;
            delete updateData.createdAt;

            if (req.file) {

                const result =
                    await uploadToCloudinary(req.file);

                updateData.gcasfilelast = {

                    url: result.secure_url,

                    type: req.file.mimetype,

                    name: req.file.originalname,

                    uploadDate: new Date()

                };
            }

            const updatedApp =
                await Application.findByIdAndUpdate(

                    req.params.id,

                    updateData,

                    {
                        new: true,
                        runValidators: true
                    }
                );

            if (!updatedApp) {

                return res.status(404).json({
                    error: "Application not found"
                });
            }

            console.log(
                `✅ Updated application: ${updatedApp._id}`
            );

            res.json({

                success: true,

                message: "Application updated successfully",

                data: updatedApp
            });

        } catch (err) {

            console.error("Update Error:", err);

            res.status(500).json({
                error: err.message
            });
        }
    }
);

/* =========================================
   DELETE APPLICATION
========================================= */

app.delete('/api/admin/delete/:id', async (req, res) => {

    try {

        const deletedApp =
            await Application.findByIdAndDelete(
                req.params.id
            );

        if (!deletedApp) {

            return res.status(404).json({
                error: "Application not found"
            });
        }

        res.json({

            success: true,

            message: "Application deleted successfully"

        });

    } catch (err) {

        console.error("Delete Error:", err);

        res.status(500).json({
            error: err.message
        });
    }
});

/* =========================================
   STATS
========================================= */

app.get('/api/admin/stats', async (req, res) => {

    try {

        const total =
            await Application.countDocuments();

        const completed =
            await Application.countDocuments({

                gcasusername: { $ne: null },

                gcaspassword: { $ne: null }
            });

        const pending = total - completed;

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const todayApps =
            await Application.countDocuments({

                createdAt: {
                    $gte: today
                }
            });

        res.json({

            total,

            completed,

            pending,

            todayApplications: todayApps

        });

    } catch (err) {

        console.error("Stats Error:", err);

        res.status(500).json({
            error: err.message
        });
    }
});

/* =========================================
   SEARCH
========================================= */

app.get('/api/admin/search', async (req, res) => {

    try {

        const { q, type } = req.query;

        let searchQuery = {};

        if (type === 'name') {

            searchQuery = {
                name: {
                    $regex: q,
                    $options: 'i'
                }
            };

        } else if (type === 'marksheet') {

            searchQuery = {
                marksheet12Number: {
                    $regex: q,
                    $options: 'i'
                }
            };

        } else if (type === 'mobile') {

            searchQuery = {
                mobile: {
                    $regex: q,
                    $options: 'i'
                }
            };

        } else {

            searchQuery = {

                $or: [

                    {
                        name: {
                            $regex: q,
                            $options: 'i'
                        }
                    },

                    {
                        marksheet12Number: {
                            $regex: q,
                            $options: 'i'
                        }
                    },

                    {
                        mobile: {
                            $regex: q,
                            $options: 'i'
                        }
                    }

                ]
            };
        }

        const results =
            await Application.find(searchQuery)
                .sort({ createdAt: -1 });

        res.json(results);

    } catch (err) {

        console.error("Search Error:", err);

        res.status(500).json({
            error: err.message
        });
    }
});

/* =========================================
   HEALTH CHECK
========================================= */

app.get('/api/health', (req, res) => {

    res.json({

        status: 'OK',

        timestamp: new Date(),

        database:
            mongoose.connection.readyState === 1
                ? 'Connected'
                : 'Disconnected'
    });
});

/* =========================================
   ROOT
========================================= */

app.get('/', (req, res) => {

    res.json({

        message: 'GCAS API Server Running',

        version: '1.0.0'

    });
});

/* =========================================
   GLOBAL ERROR
========================================= */

app.use((err, req, res, next) => {

    console.error("Global Error:", err);

    res.status(500).json({

        error: "Internal Server Error",

        message: err.message
    });
});

/* =========================================
   404
========================================= */

app.use((req, res) => {

    res.status(404).json({

        error: "Route not found",

        path: req.originalUrl
    });
});

/* =========================================
   SERVER START
========================================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {

    console.log(`🚀 Server running on port ${PORT}`);

    console.log(
        `📡 API URL: http://localhost:${PORT}`
    );

    console.log(
        `✅ MongoDB: ${
            mongoose.connection.readyState === 1
                ? 'Connected'
                : 'Disconnected'
        }`
    );

    console.log(`☁️ Cloudinary Configured`);
});