# Tenacious P
## These promises just don't quit!

A small function decorator which accepts a promise generating function, and calls the given function. If it fails, the operation is retried with a configurable delay backoff (default is exponential delay backoff). A certain number of attempts are made before ultimately rejecting.

As an example, an HTTP request that may intermittently fail can be made to be automatically reattempted. Conveniently, the fulfillment and rejection handlers do not need to be altered in any way to accomodate the reattempts.

    var tenaciousP = require('tenaciousP');
    function makeRequest(url){
        return request(url);
    }
    tenaciousP(
        makeRequest, 
        20, // Use an initial 20ms delay
        5, // Make 5 attempts
        function(delay) {
            return delay + 20; // Linearly increase delay 
        }
    )('https://example.com')
    .then(function(response) {
        console.log(response);
    })
    .catch(function(err){
        console.log(err);
    });