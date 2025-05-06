import { NextResponse } from "next/server";
import axios from "axios";
import { verifyToken } from "@/lib/verifyToken";

export async function POST(req) {
  try {
    // 1. Verify Token
    const decodedToken = await verifyToken(req);
    if (!decodedToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or missing token." },
        { status: 401 }
      );
    }
    const formData = await req.formData();
    const image = formData.get("image");

    const imgbbForm = new FormData();
    imgbbForm.append("image", image);

    const res = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
      imgbbForm,
      {
        headers: imgbbForm.getHeaders?.() || {}, // Optional chaining fallback
      }
    );

    const imageUrl = res.data?.data?.url;

    if (!imageUrl) {
      throw new Error("Image upload API did not return a valid URL.");
    }

    return NextResponse.json({ url: imageUrl }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
