// src/app/api/team/route.js
import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";

const COLLECTION_NAME = "team";

// GET all team members
export async function GET() {
  try {
    const db = await connectDB();
    const teamMembers = await db
      .collection(COLLECTION_NAME)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(teamMembers, { status: 200 });
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

// POST a new team member
export async function POST(request) {
  try {
    const data = await request.json();

    if (!data.name || !data.designation || !data.description) {
      return NextResponse.json(
        { error: "Name, designation, and description are required" },
        { status: 400 }
      );
    }

    const db = await connectDB();

    const newTeamMember = {
      name: data.name,
      designation: data.designation,
      description: data.description,
      photoUrl: data.photoUrl || "",
      createdAt: new Date(),
    };

    const result = await db
      .collection(COLLECTION_NAME)
      .insertOne(newTeamMember);

    return NextResponse.json(
      { _id: result.insertedId, ...newTeamMember },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating team member:", error);
    return NextResponse.json(
      { error: "Failed to create team member" },
      { status: 500 }
    );
  }
}
