export async function GET() {
  try {
    const response = await fetch(`https://api.redgifs.com/v2/auth/temporary`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch token from RedGifs" }),
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
