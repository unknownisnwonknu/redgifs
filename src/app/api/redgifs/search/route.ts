import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cookieStore = await cookies();
    const cookieToken = cookieStore.has("token");
    let bearerToken;
    const query = searchParams.get("query") || "default";
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
      cookieStore.set("token", token, {
        maxAge: 86400,
      });
      bearerToken = token;
    } else {
      bearerToken = cookieStore.get("token")?.value;
    }
    console.log(bearerToken);
    const url = `https://api.redgifs.com/v2/search/gifs?query=${query}&page=${page}&count=${count}&order=${order}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch data from RedGifs" }),
        { status: response.status }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
