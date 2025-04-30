import { cookies } from "next/headers";

export async function GET(request: Request) {
  console.log("here");
  if (!process.env.REDGIFS_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing API Key" }), {
      status: 500,
    });
  }
  try {
    const { searchParams } = new URL(request.url);
    const cookieStore = await cookies();
    const cookieToken = cookieStore.has("token");
    let bearerToken;
    const page = searchParams.get("page") || "1";
    const count = searchParams.get("count") || "3";
    const order = searchParams.get("order") || "latest";

    if (!cookieToken) {
      const tokenResponse = await fetch(
        "https://api.redgifs.com/v2/auth/temporary"
      );
      if (!tokenResponse.ok) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch token from RedGifs" }),
          { status: tokenResponse.status }
        );
      }
      const { token } = await tokenResponse.json();
      console.log(token);
      cookieStore.set("token", token, {
        maxAge: 86400,
      });
      bearerToken = token;
    } else {
      bearerToken = cookieStore.get("token")?.value;
    }

    const tagsResponse = await fetch("https://api.redgifs.com/v1/tags", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!tagsResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch tags from RedGifs" }),
        { status: tagsResponse.status }
      );
    }
    const { tags } = await tagsResponse.json();
    const length = tags.length;
    const minCeiled = Math.ceil(0);
    const maxFloored = Math.floor(length);
    const randomTag =
      tags[Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled)]
        .name;
    const slugifyTag = randomTag.toLowerCase().split(" ").join("-");
    const response = await fetch(
      `https://api.redgifs.com/v2/gifs/search?search_text=${slugifyTag}&page=${page}&count=${count}&order=${order}&type=g`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch data from RedGifs" }),
        { status: response.status }
      );
    }

    const data = await response.json();
    data.tag = randomTag;
    return new Response(JSON.stringify(data), {
      status: 200,
    });
  } catch {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
