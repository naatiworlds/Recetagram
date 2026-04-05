exports.handler = async function (event) {
  try {
    const body = event.body || "";
    const params = new URLSearchParams(body);

    const title = params.get("title") || "";
    const text = params.get("text") || "";
    const url = params.get("url") || "";

    const redirectUrl = new URL("/share-target", "https://recetagram.local");
    if (title) redirectUrl.searchParams.set("title", title);
    if (text) redirectUrl.searchParams.set("text", text);
    if (url) redirectUrl.searchParams.set("url", url);

    return {
      statusCode: 303,
      headers: {
        Location: `${redirectUrl.pathname}${redirectUrl.search}`,
        "Cache-Control": "no-store",
      },
      body: "",
    };
  } catch (error) {
    console.error("Error processing share target:", error);
    return {
      statusCode: 303,
      headers: {
        Location: "/share-target",
        "Cache-Control": "no-store",
      },
      body: "",
    };
  }
};
