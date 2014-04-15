var http = require('http');
var lastResponse;

process.on('uncaughtException', function(err) {
    lastResponse.end('error');
    console.log('Caught exception: ' + err);
});



var fileServer = http.createServer(function (req, res) { 
    lastResponse = res;    
    var parsedUrl = url.parse(req.url, true);        
        res.end('HEllo');
});

fileServer.listen(8081);
// Intentionally cause an exception, but don't catch it.
console.log('This will not run.');