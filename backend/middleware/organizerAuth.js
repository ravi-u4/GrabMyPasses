const Organizer = require("../models/Organizer");

module.exports = async function (req, res, next) {
  try {
    const organizerId = req.headers["x-organizer-id"];

    if (!organizerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Organizer ID missing"
      });
    }

    const organizer = await Organizer.findById(organizerId);

    if (!organizer) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Organizer not found"
      });
    }

    req.organizer = organizer;
    next();
  } catch (err) {
    console.error("ORGANIZER AUTH ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Authentication failed"
    });
  }
};
