const ImageKit = require("imagekit");

let imagekit = null;

if (
    process.env.IMAGEKIT_PUBLIC_KEY &&
    process.env.IMAGEKIT_PRIVATE_KEY &&
    process.env.IMAGEKIT_URL_ENDPOINT
) {
    imagekit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });
    console.log("✅ ImageKit Cloud Service initialized successfully.");
} else {
    console.warn("⚠️ ImageKit environment variables missing in server/.env (IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT)");
}

const uploadToImageKit = async (fileBufferOrBase64, fileName = "campus_crate_item.jpg") => {
    if (!imagekit) {
        throw new Error("ImageKit is not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in server/.env");
    }

    const response = await imagekit.upload({
        file: fileBufferOrBase64, // base64 string, binary buffer, or image URL
        fileName: fileName,
        folder: "/CampusCrate"
    });

    return response.url;
};

module.exports = {
    imagekit,
    uploadToImageKit
};
