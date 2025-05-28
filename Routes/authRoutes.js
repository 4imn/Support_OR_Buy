const express = require("express");
const router = express.Router();
const authController = require("../Controllers/authController");
const { verifyToken } = require("../Middlewares/authMiddleware");
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", verifyToken, (req, res) => {
  res.json({ message: "🟢 You have successfully logged out." });
});
module.exports = router;
