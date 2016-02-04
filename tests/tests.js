var assert = require('chai');
var tenaciousP = require('../src/index.js');
suite('tenaciousp', function() {
    function promiseGenerator(N) {
        // Returns a function that, when called, returns a
        // promise that rejects if it has been called
        // fewer than N times, and resolves when it has
        // been called N or more times. This allows us
        // to simulate a promise that rejects some number
        // of times, but eventually resolves.
        var attemptsMade = 0;
        return function(result) {
            attemptsMade++;
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    if (attemptsMade <= N) {
                        reject(new Error('REJECTED'));
                    } else {
                        resolve(result + (attemptsMade - 1));
                    }
                }, 5);
            });
        };
    }

    test('retry promise resolves', function() {
        // A promise that resolves on the nth attempt,
        // where at least n attempts are made (i.e.
        // we expect this to resolve).
        var attempts = 6;
        var initialDelay = 5;
        var xAttempts = promiseGenerator(attempts);
        // Due to the exponential backoff, the expected delay
        // is the sum of the powers of two, multiplied
        // by the initial delay.
        var expectedDelay = (
            (Math.pow(2, attempts + 1) - 1) *
            (initialDelay + 2)
        );
        this.timeout(expectedDelay);
        return tenaciousP(
            xAttempts,
            initialDelay,
            attempts
        )('SUCCESS');
    });

    test('retry promise retries with exponential backoff delay', function() {
        var attempts = 5;
        var initialDelay = 20;
        var xAttempts = promiseGenerator(attempts);
        var expectedDelay = (
            (Math.pow(2, attempts + 1) - 1) *
            (initialDelay + 2)
        );
        this.timeout(expectedDelay);
        return tenaciousP(
            xAttempts,
            initialDelay,
            attempts
        )('SUCCESS');
    });

    test('retry promise retries with custom (constant) delay', function() {
        var attempts = 5;
        var initialDelay = 20;
        var xAttempts = promiseGenerator(attempts);
        var expectedDelay = (
            (attempts + 2) *
            initialDelay
        );
        this.timeout(expectedDelay);
        return tenaciousP(
            xAttempts,
            initialDelay,
            attempts,
            function(delay) {
                return delay;
            }
        )('SUCCESS');
    });

    test('retry promise rejects', function() {
        // A promise that resolves on the nth attempt,
        // where fewer than n attempts are made (i.e. we expect 
        // this to reject).
        var attempts = 6;
        var initialDelay = 5;
        var xAttempts = promiseGenerator(attempts);
        var expectedDelay = (
            (Math.pow(2, attempts + 1) - 1) *
            (initialDelay + 2)
        );
        this.timeout(expectedDelay);
        return new Promise(function(resolve, rejecy) {
            tenaciousP(
                    xAttempts,
                    initialDelay,
                    attempts - 1
                )('SUCCESS')
                .then(function(data) {
                    reject(
                        "Function incorrectly resolved, when " +
                        "it should have rejected after " +
                        attempts +
                        " attempts."
                    );
                })
                .catch(function(e) {
                    resolve(
                        'Promise correctly rejected when ' +
                        attempts +
                        ' were rejected.'
                    );
                });
        });
    });
});