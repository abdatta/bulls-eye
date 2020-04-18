
const server = new (require('static-server'))({
  rootPath: __dirname + '/public',            // required, the root of the server file tree
  port: 3000,               // required, the port to listen
  name: 'bulls-eye',   // optional, will set "X-Powered-by" HTTP header
  host: '0.0.0.0',       // optional, defaults to any interface
  templates: {
    index: 'index.html',      // optional, defaults to 'index.html'
    notFound: 'index.html'    // optional, defaults to undefined
  }
});

server.start(() => {
  console.log('Server listening to', server.port);
});
