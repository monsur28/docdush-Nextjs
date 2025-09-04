import { NextResponse } from "next/server";
import axios from "axios";
import { verifyToken } from "@/lib/verifyToken";

export async function POST(req) {
  try {
    // 1. Verify user token (good practice)
    const decodedToken = await verifyToken(req);
    if (!decodedToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or missing token." },
        { status: 401 }
      );
    }

    // 2. Get the image from the incoming request
    const formData = await req.formData();
    const image = formData.get("image");

    if (!image) {
      return NextResponse.json(
        { success: false, message: "No image file found in the request." },
        { status: 400 }
      );
    }

    // 3. Create a new FormData for the ImgBB request
    const imgbbFormData = new FormData();
    imgbbFormData.append("image", image);

    // 4. Make the POST request to ImgBB
    // Axios will automatically set the correct 'Content-Type: multipart/form-data' header.
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
      imgbbFormData
    );

    // 5. Check the response and return the URL
    const imageUrl = response.data?.data?.url;
    if (!imageUrl) {
      console.error("ImgBB API Error:", response.data);
      throw new Error("Image upload failed to return a valid URL.");
    }

    return NextResponse.json({ url: imageUrl }, { status: 200 });
  } catch (error) {
    // Log the detailed error for debugging
    console.error(
      "Upload error:",
      error.response ? error.response.data : error.message
    );

    return NextResponse.json(
      { error: "Failed to upload image. Please try again later." },
      { status: 500 }
    );
  }
}
