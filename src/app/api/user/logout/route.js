import { NextResponse } from "next/server";
import { serialize } from "cookie";
import corsHeaders from "@/lib/cors";

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST() {
  try {
    const cookie = serialize("authToken", "", {
      httpOnly: true,
      secure: false, // change to true in production
      sameSite: "lax",
      path: "/",
      maxAge: 0, // expire immediately
    });

    const response = NextResponse.json(
      { message: "Logout successful" },
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