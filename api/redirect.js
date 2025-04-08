export default function handler(req, res) {
  res.writeHead(302, {
    Location: 'https://example.com', // replace with your target
  });
  res.end();
}
