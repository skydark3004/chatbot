const express = require("express");
const router = express.Router();
const webController = require("./../controllers/webController");

router.route("/").get(webController.test);
router
  .route("/webhook")
  .get(webController.getWebHook)
  .post(webController.postWebHook);

module.exports = router;
