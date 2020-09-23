var proxy = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(proxy('/locales/**', { target: 'http://localhost:8080/', ws: true, logLevel: 'debug'}));
    app.use(proxy('/emf/**', { target: 'http://localhost:8080/', ws: true }));
    app.use(proxy('/system/**', { target: 'http://localhost:8080/', ws: true }));
    app.use(proxy('/logout', { target: 'http://localhost:8080/', ws: true }));
    app.use(proxy('/components/reports/*', { target: 'http://localhost:8080/', ws: true }));
    app.use(proxy('/script/**', { target: 'http://localhost:8080/', ws: true }));
    app.use(proxy('/masterdata/**', { target: 'http://localhost:8080/', ws: true }));
    app.use(proxy('/topic/**', { target: 'http://localhost:8080/', ws: true }));
    app.use(proxy('/nrstudio-websocket/**', { target: 'http://localhost:8080/', ws: true }));
};
