const express = require("express");
const router = express.Router();
const MenuItem = require("../models/MenuItem");
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
    folder: "family-restaurant/menu-items",
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

// Get all menu items (public)
router.get("/", async (req, res) => {
  try {
    const { category, available } = req.query;
    let filter = {};

    if (category) {
      filter.category = category;
    }

    if (available !== undefined) {
      filter.available = available === "true";
    }

    const items = await MenuItem.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single menu item (public)
router.get("/:id", async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create menu item (admin only)
router.post("/", auth, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category, spicyLevel, preparationTime } =
      req.body;

    console.log(
      "Creating menu item with image:",
      req.file ? req.file.path : "No file uploaded",
    );

    const menuItem = new MenuItem({
      name,
      description,
      price: parseFloat(price),
      category,
      spicyLevel,
      preparationTime: parseInt(preparationTime),
      image: req.file ? req.file.path : "",
    });

    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update menu item (admin only)
router.put("/:id", auth, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const updates = { ...req.body };

    if (req.file) {
      console.log("Updating menu item with new image:", req.file.path);
      updates.image = req.file.path;
    }

    if (updates.price) {
      updates.price = parseFloat(updates.price);
    }

    if (updates.preparationTime) {
      updates.preparationTime = parseInt(updates.preparationTime);
    }

    const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update availability (admin only)
router.patch("/:id/availability", auth, isAdmin, async (req, res) => {
  try {
    const { available } = req.body;

    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { available },
      { new: true },
    );

    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete menu item (admin only)
router.delete("/:id", auth, isAdmin, async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get categories
router.get("/categories/all", async (req, res) => {
  try {
    const categories = await MenuItem.distinct("category");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stats
router.get("/stats/count", auth, async (req, res) => {
  try {
    const totalItems = await MenuItem.countDocuments();
    const availableItems = await MenuItem.countDocuments({ available: true });
    const outOfStockItems = await MenuItem.countDocuments({ available: false });

    // Count by category
    const categoryStats = await MenuItem.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          available: {
            $sum: { $cond: [{ $eq: ["$available", true] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      totalItems,
      availableItems,
      outOfStockItems,
      categoryStats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
