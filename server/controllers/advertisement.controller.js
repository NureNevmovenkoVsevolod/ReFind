import Advertisement from "../models/advertisement.model.js";

export const getFinds = async (req, res) => {
  try {
    const finds = await Advertisement.findAll({
      where: {
        type: "finds",
        mod_check: true,
      },
      order: [["createdAt", "DESC"]],
    });

    res.json(finds);
  } catch (error) {
    console.error("Error fetching finds:", error);
    res.status(500).json({ message: "Failed to fetch finds" });
  }
};

export const getLosses = async (req, res) => {
  try {
    const losses = await Advertisement.findAll({
      where: {
        type: "losses",
        mod_check: true,
      },
      order: [["createdAt", "DESC"]],
    });

    res.json(losses);
  } catch (error) {
    console.error("Error fetching losses:", error);
    res.status(500).json({ message: "Failed to fetch losses" });
  }
};
