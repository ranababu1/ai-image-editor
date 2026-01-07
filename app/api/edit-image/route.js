import { NextResponse } from "next/server";
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

        // Use Gemini 2.0 Flash Preview for image generation
        if (!process.env.GOOGLE_API_KEY) {
            return NextResponse.json(
                { error: "GOOGLE_API_KEY not configured" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image" });

        // Convert image to base64 for Gemini
        const base64Image = imageBuffer.toString("base64");
        const mimeType = file.type || "image/jpeg";

        // Generate image with prompt
        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Image,
                },
            },
            prompt,
        ]);

        const response = await result.response;
        
        // Extract the generated image from response
        if (!response.candidates || !response.candidates[0]) {
            return NextResponse.json(
                { error: "No image generated" },
                { status: 500 }
            );
        }

        const candidate = response.candidates[0];
        let editedBuffer;

        // Check if the response contains an image
        if (candidate.content && candidate.content.parts) {
            const imagePart = candidate.content.parts.find(part => part.inlineData);
            if (imagePart && imagePart.inlineData) {
                editedBuffer = Buffer.from(imagePart.inlineData.data, "base64");
            } else {
                return NextResponse.json(
                    { error: "No image data in response" },
                    { status: 500 }
                );
            }
        } else {
            return NextResponse.json(
                { error: "Invalid response format" },
                { status: 500 }
            );
        }

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
