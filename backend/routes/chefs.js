const express = require("express");
const router = express.Router();
const Chef = require("../models/Chef");
const multer = require("multer");
const path = require("path");
const { auth, isAdmin } = require("../middleware/auth");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "family-restaurant/chefs",
    allowed_formats: ["jpeg", "jpg", "png", "gif"],
    resource_type: "auto",
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed"));
  },
});

// Get all chefs (public)
router.get("/", async (req, res) => {
  try {
    const chefs = await Chef.find().sort({ name: 1 });
    res.json(chefs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single chef (public)
router.get("/:id", async (req, res) => {
  try {
    const chef = await Chef.findById(req.params.id);

    if (!chef) {
      return res.status(404).json({ error: "Chef not found" });
    }

    res.json(chef);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create chef (admin only)
router.post("/", auth, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name, specialty, experience, bio } = req.body;

    console.log(
      "Creating chef with image:",
      req.file ? req.file.path : "No file uploaded",
    );

    const chef = new Chef({
      name,
      specialty,
      experience: parseInt(experience),
      bio,
      image: req.file ? req.file.path : "",
    });

    await chef.save();
    res.status(201).json(chef);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update chef (admin only)
router.put("/:id", auth, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const updates = { ...req.body };

    if (req.file) {
      console.log("Updating chef with new image:", req.file.path);
      updates.image = req.file.path;
    }

    if (updates.experience) {
      updates.experience = parseInt(updates.experience);
    }

    const chef = await Chef.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!chef) {
      return res.status(404).json({ error: "Chef not found" });
    }

    res.json(chef);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update chef availability (admin only)
router.patch("/:id/availability", auth, isAdmin, async (req, res) => {
  try {
    const { available } = req.body;

    const chef = await Chef.findByIdAndUpdate(
      req.params.id,
      { available },
      { new: true },
    );

    if (!chef) {
      return res.status(404).json({ error: "Chef not found" });
    }

    res.json(chef);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete chef (admin only)
router.delete("/:id", auth, isAdmin, async (req, res) => {
  try {
    const chef = await Chef.findByIdAndDelete(req.params.id);

    if (!chef) {
      return res.status(404).json({ error: "Chef not found" });
    }

    res.json({ message: "Chef deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
