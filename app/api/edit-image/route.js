import { NextResponse } from "next/server";
import sharp from "sharp";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export const runtime = "nodejs";

export async function POST(req) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
        }

        const formData = await req.formData();

        const file = formData.get("image");
        const prompt = formData.get("prompt");
        const resizeOption = formData.get("resizeOption");
        const width = formData.get("width") ? parseInt(formData.get("width")) : null;
        const height = formData.get("height") ? parseInt(formData.get("height")) : null;
        const format = formData.get("format") || "webp";
        const userApiKey = formData.get("apiKey");

        if (!file || !prompt) {
            return NextResponse.json({ error: "Missing input" }, { status: 400 });
        }

        if (file.size > 2 * 1024 * 1024) {
            return NextResponse.json(
                { error: "File exceeds 2MB limit" },
                { status: 413 }
            );
        }

        const imageBuffer = Buffer.from(await file.arrayBuffer());

        // Use user's API key if provided, otherwise use default
        const apiKey = userApiKey || process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "No API key provided. Please add your Google Gemini API key in Settings." },
                { status: 400 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Use Nano Banana for image generation
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-image"
        });

        // Generate new image based on the uploaded image and prompt
        const result = await model.generateContent([
            `Based on this image, ${prompt}`,
            {
                inlineData: {
                    mimeType: file.type,
                    data: imageBuffer.toString("base64")
                }
            }
        ]);

        console.log("API Response:", JSON.stringify(result.response, null, 2));

        // Check if response contains image data
        if (!result.response.candidates || !result.response.candidates[0]) {
            return NextResponse.json(
                { error: "No response from AI model" },
                { status: 500 }
            );
        }

        const imagePart = result.response.candidates[0].content.parts.find(p => p.inlineData);

        if (!imagePart) {
            return NextResponse.json(
                {
                    error: "Gemini API does not support image editing. It only analyzes images and generates text. Please use DALL-E, Stable Diffusion, or another image editing API instead.",
                    aiResponse: result.response.candidates[0].content.parts[0].text
                },
                { status: 400 }
            );
        }

        const editedBuffer = Buffer.from(
            imagePart.inlineData.data,
            "base64"
        );

        let img = sharp(editedBuffer);

        if (resizeOption === "resize" && width && height) {
            img = img.resize(width, height);
        }

        if (format === "webp") img = img.webp();
        if (format === "png") img = img.png();
        if (format === "jpg") img = img.jpeg({ quality: 90 });

        const finalBuffer = await img.toBuffer();

        return NextResponse.json({
            image: finalBuffer.toString("base64"),
            format
        });
    } catch (e) {
        console.error("Image processing error:", e);
        return NextResponse.json(
            { error: e.message || "Processing failed" },
            { status: 500 }
        );
    }
}
