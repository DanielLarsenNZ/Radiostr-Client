Radiostr-Client
===============

A client app for performing useful actions against a Radiostr server. (WIP).

API
---

GET /?user=(Last-FM-Username)&api_key=(Last-FM-API-Key)&period=(Optional-Period)

Queries ws.audioscrobbler.com user.gettoptracks method, projects the result into something like:

```javascript
{
    "StationId": 1,
    "LibraryId": 1,
    "Tags": "lastfm, mar-2014, apr-2014, may-2014",
    "Tracks": [
        {
            "Title": "Blue Moon",
            "Artist": {
                "Name": "Beck",
                "Mbid": "1cc5adcd-1422-4b5c-a3cd-3ecd4f43f506"
            },
            "Uri": "http://www.last.fm/music/Beck/_/Blue+Moon",
            "Duration": "242",
            "Mbid": "ce6b6d77-822e-4b5e-91ee-1840fb1e19af"
        },
		...
```

This JSON is ready to submit to the [Radiostr](https://github.com/DanielLarsenNZ/Radiostr) Track Import API. (WIP).
