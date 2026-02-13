import { NextResponse } from "next/server";
import { getClientPromise } from "@/lib/mongodb";
import { verifyJWT } from "@/lib/auth";
import { ObjectId } from "mongodb";
import corsHeaders from "@/lib/cors";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request) {
  try {
    const token = request.cookies.get("authToken")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    const decoded = verifyJWT(token);

    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401, headers: corsHeaders }
      );
    }

    const client = await getClientPromise();
    const db = client.db("wad-01");

    const user = await db.collection("user").findOne(
      { _id: new ObjectId(decoded.userId) },
      { projection: { password: 0 } }
    );

    return NextResponse.json(user, {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    return NextResponse.json(
      { message: error.toString() },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PATCH(request) {
  try {
    const token = request.cookies.get("authToken")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    const decoded = verifyJWT(token);

    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401, headers: corsHeaders }
      );
    }

    const formData = await request.formData();

    const removeImage = formData.get("removeImage");

    const firstname = formData.get("firstname");
    const lastname = formData.get("lastname");
    const email = formData.get("email");
    const file = formData.get("profileImage");

    let fileName = null;

    if (file && file.size > 0) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { message: "Only image files allowed" },
          { status: 400, headers: corsHeaders }
        );
      }

      const fileExtension = file.name.split(".").pop();
      fileName = uuidv4() + "." + fileExtension;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadPath = path.join(
        process.cwd(),
        "public",
        "uploads",
        fileName
      );

      await writeFile(uploadPath, buffer);
    }

    const client = await getClientPromise();
const db = client.db("wad-01");

// Get current user (needed for deleting old image)
const currentUser = await db.collection("user").findOne({
  _id: new ObjectId(decoded.userId),
});

const updateData = {
  firstname,
  lastname,
  email,
};

// If uploading new image
if (fileName) {
  // Delete old image if exists
  if (currentUser.profileImage) {
    const oldImagePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      currentUser.profileImage
    );

    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }

  updateData.profileImage = fileName;

}
// If only removing image (no new upload)
else if (removeImage === "true") {
  if (currentUser.profileImage) {
    const oldImagePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      currentUser.profileImage
    );

    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }

  updateData.profileImage = null;
}

    await db.collection("user").updateOne(
      { _id: new ObjectId(decoded.userId) },
      { $set: updateData }
    );

    return NextResponse.json(
      { message: "Profile updated successfully" },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    return NextResponse.json(
      { message: error.toString() },
      { status: 500, headers: corsHeaders }
    );
  }
}