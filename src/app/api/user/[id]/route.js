import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getClientPromise } from "@/lib/mongodb";
import corsHeaders from "@/lib/cors";

const responseHeaders = {
  ...corsHeaders,
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "no-store"
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: responseHeaders });
}

export async function GET(request, { params }) {

  try {

    const { id } = await params;   // ✅ must await

    const client = await getClientPromise();
    const db = client.db("wad-01");

    const user = await db.collection("user").findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );

    return NextResponse.json(user, {
      status: 200,
      headers: responseHeaders
    });

  } catch (error) {

    return NextResponse.json({
      message: error.toString()
    }, {
      status: 500,
      headers: responseHeaders
    });

  }
}

export async function PATCH(request, { params }) {

  try {

    const { id } = await params;
    const body = await request.json();

    const client = await getClientPromise();
    const db = client.db("wad-01");

    const updateData = {
      username: body.username,
      email: body.email,
      firstname: body.firstname,
      lastname: body.lastname,
      status: body.status
    };

    const result = await db.collection("user").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return NextResponse.json({
      success: true,
      result: result
    }, {
      status: 200,
      headers: responseHeaders
    });

  } catch (error) {

    return NextResponse.json({
      message: error.toString()
    }, {
      status: 500,
      headers: responseHeaders
    });

  }
}

export async function DELETE(request, { params }) {

  try {

    const { id } = await params;

    const client = await getClientPromise();
    const db = client.db("wad-01");

    const result = await db.collection("user").deleteOne({
      _id: new ObjectId(id)
    });

    return NextResponse.json({
      success: true,
      result: result
    }, {
      status: 200,
      headers: responseHeaders
    });

  } catch (error) {

    return NextResponse.json({
      message: error.toString()
    }, {
      status: 500,
      headers: responseHeaders
    });

  }
}