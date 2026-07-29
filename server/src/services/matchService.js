const Item = require("../models/items");

// Helper function to find potential matches between lost and found items
const findPotentialMatches = async (item) => {
    try {
        const oppositeType = item.type === "lost" ? "found" : "lost";

        const matches = await Item.find({
            type: oppositeType,
            category: item.category,
            status: "active",
            _id: { $ne: item._id }
        }).populate("postedBy", "name email avatar");

        return matches;
    } catch (error) {
        console.error("Error finding potential matches:", error);
        return [];
    }
};

module.exports = {
    findPotentialMatches
};
