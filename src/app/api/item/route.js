import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const responseHeaders = {
    ...corsHeaders,
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
};

export async function OPTIONS(req) {
    return new Response(null, {
        status: 200,
        headers: responseHeaders,
    });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || "1"); 
    const limit = parseInt(searchParams.get('limit') || "5"); 
    const skip = (page - 1) * limit; 

    const client = await getClientPromise();
    const db = client.db("wad-01");

    const items = await db.collection("item")
        .find({})
        .skip(skip)   
        .limit(limit) 
        .toArray();

    const total = await db.collection("item").countDocuments({});

    return NextResponse.json({ 
        items: items, 
        total: total,
        page: page,
        totalPages: Math.ceil(total / limit)
    }, { 
        headers: responseHeaders 
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: responseHeaders });
  }
}

export async function POST(req) {
    try {
        const data = await req.json();
        const itemName = data.name;
        const itemPrice = data.price;
        const itemCategory = data.category;

        const client = await getClientPromise();
        const db = client.db("wad-01");

        const result = await db.collection("item").insertOne({
            itemName: itemName,
            itemCategory: itemCategory,
            itemPrice: itemPrice,
            status: "ACTIVE"
        });

        return NextResponse.json({
            id: result.insertedId
        }, {
            status: 200,
            headers: responseHeaders
        });
    } catch (exception) {
        console.log("exception", exception.toString());
        return NextResponse.json({
            message: exception.toString()
        }, {
            status: 400,
            headers: responseHeaders
        });
    }
}