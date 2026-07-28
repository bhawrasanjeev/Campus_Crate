const Item = require("../models/Item");

const calculateTextSimilarity = (text1, text2) => {
    if (!text1 || !text2) return 0;
    const words1 = text1.toLowerCase().trim().split(/\s+/);
    const words2 = text2.toLowerCase().trim().split(/\s+/);
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    let commonCount = 0;
    set1.forEach(word => {
        if (set2.has(word)) commonCount++;
    });
    const maxLen = Math.max(set1.size, set2.size);
    return maxLen === 0 ? 0 : commonCount / maxLen;
};

const findMatchesForItem = async (newItem) => {
    try {
        const targetType = newItem.type === "lost" ? "found" : "lost";
        const potentialMatches = await Item.find({
            type: targetType,
            status: "active",
            _id: { $ne: newItem._id }
        });

        const scoredMatches = [];

        for (const item of potentialMatches) {
            let score = 0;
            const reasons = [];

            if (newItem.category && item.category && newItem.category.toLowerCase() === item.category.toLowerCase()) {
                score += 20;
                reasons.push("Same category");
            }

            if (newItem.location && item.location && newItem.location.toLowerCase() === item.location.toLowerCase()) {
                score += 25;
                reasons.push("Same location");
            }

            if (newItem.date && item.date) {
                const date1 = new Date(newItem.date).toDateString();
                const date2 = new Date(item.date).toDateString();
                if (date1 === date2) {
                    score += 20;
                    reasons.push("Same date");
                }
            }

            const titleSim = calculateTextSimilarity(newItem.title, item.title);
            if (titleSim > 0) {
                const titleScore = 15 * titleSim;
                score += titleScore;
                if (titleSim >= 0.5) reasons.push("Similar title");
            }

            if (newItem.tags && item.tags && newItem.tags.length > 0 && item.tags.length > 0) {
                const tags1 = new Set(newItem.tags.map(t => t.toLowerCase()));
                const tags2 = new Set(item.tags.map(t => t.toLowerCase()));
                let matchingTags = 0;
                tags1.forEach(tag => {
                    if (tags2.has(tag)) matchingTags++;
                });
                const tagRatio = matchingTags / Math.max(tags1.size, tags2.size);
                const tagScore = 10 * tagRatio;
                score += tagScore;
                if (matchingTags > 0) reasons.push("Matching tags");
            }

            const descSim = calculateTextSimilarity(newItem.description, item.description);
            if (descSim > 0) {
                const descScore = 10 * descSim;
                score += descScore;
                if (descSim >= 0.4) reasons.push("Similar description");
            }

            if (score >= 60) {
                scoredMatches.push({
                    matchedItemId: item._id,
                    score: parseFloat(score.toFixed(2)),
                    reasons
                });
            }
        }

        scoredMatches.sort((a, b) => b.score - a.score);
        return scoredMatches;
    } catch (error) {
        console.error("Match Service Error:", error);
        return [];
    }
};

module.exports = { findMatchesForItem };