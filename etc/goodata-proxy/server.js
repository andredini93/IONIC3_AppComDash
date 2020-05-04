
// var url = 'https://analytics.fluig.com/gdc';  // FLUIG ANALYTICS
var url = 'https://analytics.totvs.com.br/gdc';  // TOTVS ANALYTICS

var http = require('http'),
    httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer({});
proxy.on('proxyReq', function(proxyReq, req, res, options) {
    proxyReq.setHeader('Origin', url);
});

proxy.on('proxyRes', function (proxyRes, req, res) {

    let existingCookies = proxyRes.headers['set-cookie'],
    rewrittenCookies = [];

    if (existingCookies !== undefined) {
        if (!Array.isArray(existingCookies)) {
            existingCookies = [existingCookies];
        }

        for (let i = 0; i < existingCookies.length; i++) {
             rewrittenCookies.push(existingCookies[i].replace(/;\s*?(Secure)/i, ''));
        }

        proxyRes.headers['set-cookie'] = rewrittenCookies;
    }
});

var server = http.createServer(function(req, res) {

  proxy.web(req, res, {
    target: url,
    changeOrigin: true
  });
});

console.log("listening on port 5050")
server.listen(5050);