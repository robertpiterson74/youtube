export default function handler(req, res) {
  const targetUrl = 'https://example.com'; // Replace with your target URL
  res.writeHead(302, { Location: targetUrl });
  res.end();
}
