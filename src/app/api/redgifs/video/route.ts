export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get("url");

    if (!videoUrl) {
      return new Response(JSON.stringify({ error: "Missing video URL" }), {
        status: 400,
      });
    }

    const response = await fetch(videoUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0", // Prevent potential bot blocking
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch video" }), {
        status: response.status,
      });
    }

    const contentType = response.headers.get("content-type") || "video/mp4";

    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
