const express = require("express");
const router = express.Router();
const webController = require("../controllers/webController");

router.get("/", webController.test);

router.get("/webhook", webController.getWebHook);
router.post("/webhook", webController.postWebHook);

module.exports = router;
