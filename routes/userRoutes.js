const express = require("express");
const { registerUser, loginUser, getAllUsers, getUserDetails } = require("../controllers/userController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", getAllUsers);
router.post("/details", getUserDetails);

module.exports = router;
