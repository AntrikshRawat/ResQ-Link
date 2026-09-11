const http = require('http');

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
    }).on('error', reject);
  });
}

(async () => {
  console.log('1. Fetching /dashboard/records');
  const page1 = await fetch('http://localhost:3001/dashboard/records');
  console.log('Page 1 status:', page1.status);
  const links1 = page1.data.match(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi) || [];
  console.log('CSS links in Page 1:', links1);

  // Extract CSS href
  for (const link of links1) {
    const m = link.match(/href=["']([^"']+)["']/i);
    if (m) {
      const cssUrl = 'http://localhost:3001' + m[1];
      const cssRes = await fetch(cssUrl);
      console.log('Fetched CSS:', m[1], 'Status:', cssRes.status, 'Size:', cssRes.data.length);
    }
  }

  console.log('\n2. Refreshing (Fetching /dashboard/records again)');
  const page2 = await fetch('http://localhost:3001/dashboard/records');
  console.log('Page 2 status:', page2.status);
  const links2 = page2.data.match(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi) || [];
  console.log('CSS links in Page 2:', links2);

  for (const link of links2) {
    const m = link.match(/href=["']([^"']+)["']/i);
    if (m) {
      const cssUrl = 'http://localhost:3001' + m[1];
      const cssRes = await fetch(cssUrl);
      console.log('Fetched CSS 2:', m[1], 'Status:', cssRes.status, 'Size:', cssRes.data.length);
    }
  }
})();
