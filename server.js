var http = require('http');
var url = require('url');
var request = require('request');
var fs = require("fs");

var port = process.env.port || 1337;

http.createServer(function(req, response) {
    switch (req.url) {
    case "/":
        response.writeHead(200, { "Content-Type": "text/html" });

        fs.readFile('index.html', function(err, data) {
            if (err) throw err;
            response.end(data);
        });

        break;
    case "api":

        response.writeHead(200, { "Content-Type": "application/json" });

        console.log('Request URL = ' + req.url);
        if (req.url == '/') {
            response.end('{"message":"Expecting last.fm API params: user, api_key, [period]."}');
            return;
        }

        // get request to Last.FM
        var lastfmUrl = url.parse(req.url, true);

        //path: '/2.0/?method=user.gettoptracks&user=danlar&api_key=' + process.env.lastfmapikey + '&format=json&period=3month'

        var lastFmOptions = {
            host: 'ws.audioscrobbler.com',
            port: 80,
            path: '/2.0/?method=user.gettoptracks&format=json&user=' + lastfmUrl.query['user'] + '&api_key=' + (lastfmUrl.query['api_key'] || process.env.lastfmapikey)
                + '&period=' + lastfmUrl.query['period']
        };

        http.get(lastFmOptions, function(clientResponse) {

            var data = '';

            clientResponse.on('data', function(chunk) {
                // chunk response from last.fm
                data += chunk;
                var message = "" + chunk;
                console.log('Received response of ' + message.length + ' bytes from last.fm.');
            });

            clientResponse.on('end', function() {
                // final response from last.fm. Now sort through the data.
                var topTracks = JSON.parse(data);
                var trackModels = [];
                var j = 0; // counts trackModels
                for (var i = 0; i < topTracks.toptracks.track.length; i++) {
                    var track = topTracks.toptracks.track[i];
                    if (!track.hasOwnProperty('name')) return;

                    trackModels[j] = {
                        Title: track.name,
                        Artist: { 'Name': track.artist.name, 'Mbid': track.artist.mbid }, // *
                        Uri: track.url,
                        Duration: track.duration,
                        Mbid: track.mbid // *
                    };

                    console.log(trackModels[j]);
                    j++;
                }

                //TODO: Don't hardcode these. Get them from the client request query.
                var trackImportModel = {
                    StationId: 1,
                    LibraryId: 1,
                    Tags: 'lastfm, mar-2014, apr-2014, may-2014', // *
                    Tracks: trackModels
                };

                //response.write(JSON.stringify(trackImportModel));

                //TODO NEXT: Post trackImportModel to radiostr. Enhance radiostr to accept it.

                request.post(
                    'http://radiostr.azurewebsites.net',
                    trackImportModel,
                    function(error, radiostrResponse, body) {
                        if (!error && radiostrResponse.statusCode == 200) {
                            response.write(body);
                            // All finished
                            response.statusCode = 200;
                            response.end();
                        } else {
                            response.write(body);
                            // All finished
                            response.statusCode = 500;
                            response.end();
                        }
                    }
                );

            });

        }).on("error", function(e) {
            console.log("Got error: " + e.message);
        });

        break;
        default:
            response.writeHead(404, { "Content-Type": "text/html" });
            response.end("File not found.");
    }

}).listen(port);