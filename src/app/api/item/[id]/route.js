import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getClientPromise } from "@/lib/mongodb";
import corsHeaders from "@/lib/cors";

const responseHeaders = {
    ...corsHeaders,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-store, no-cache, must-revalidate",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: responseHeaders });
}

export async function PATCH(request, { params }) {
  try {
    console.log("==> Starting PATCH...");

    const { id } = await params;
    console.log("==> ID to update:", id);

    const body = await request.json();
    console.log("==> Body received:", body);

    const client = await getClientPromise();
    const db = client.db("wad-01");

    const result = await db.collection("item").updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
            itemName: body.name,     
            itemCategory: body.category, 
            itemPrice: body.price      
        } 
      }
    );

    console.log("==> Update Result:", result);

    return NextResponse.json({ success: true, result }, { headers: responseHeaders });
  } catch (error) {
    console.error("==> PATCH Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: responseHeaders });
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const client = await getClientPromise();
    const db = client.db("wad-01");
    
    const result = await db.collection("item").findOne({ 
      _id: new ObjectId(id) 
    });

    return NextResponse.json(result, { headers: responseHeaders });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: responseHeaders });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const client = await getClientPromise();
    const db = client.db("wad-01");

    await db.collection("item").deleteOne({
      _id: new ObjectId(id)
    });

    return NextResponse.json({ success: true }, { headers: responseHeaders });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: responseHeaders });
  }
}