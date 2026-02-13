import { NextResponse } from "next/server";
import { getClientPromise } from "@/lib/mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import corsHeaders from "@/lib/cors";

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const username = body.username;
    const password = body.password;

    if (!username || !password) {
      return NextResponse.json(
        { message: "Missing username or password" },
        { status: 400, headers: corsHeaders }
      );
    }

    const client = await getClientPromise();
    const db = client.db("wad-01");

    const user = await db.collection("user").findOne({
      username: username,
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401, headers: corsHeaders }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401, headers: corsHeaders }
      );
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const cookie = serialize("authToken", token, {
      httpOnly: true,
      secure: false, // change to true in production
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    const response = NextResponse.json(
      { message: "Login successful" },
      { status: 200, headers: corsHeaders }
    );

    response.headers.set("Set-Cookie", cookie);

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: error.toString() },
      { status: 500, headers: corsHeaders }
    );
  }
}