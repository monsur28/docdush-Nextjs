import { getSiteInfoDirect, upsertSiteInfo } from "@/lib/hideApi/getSiteInfo";
import { verifyToken } from "@/lib/verifyToken";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const siteInfo = await getSiteInfoDirect();
    return NextResponse.json(
      { success: true, data: siteInfo },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/site-info Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch site information",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const decodedToken = await verifyToken(request);
    if (!decodedToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or missing token." },
        { status: 401 }
      );
    }

    const data = await request.json();
    const result = await upsertSiteInfo(data);

    return NextResponse.json(
      {
        success: true,
        message: result.created
          ? "Site information created successfully"
          : "Site information updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/site-info Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to save site information",
      },
      { status: 500 }
    );
  }
}
