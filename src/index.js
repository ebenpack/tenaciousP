function promiseDelay(delay){
    return new Promise(function(resolve, reject) {
        setTimeout(function(){
            resolve();
        }, delay);
    });
}

/**
 * A decorator that calls the given function (which returns
 * a promise), and if it fails retries with a configurable
 * delay backoff (default is exponential delay backoff).
 * A certain number of attempts are made before ultimately
 * rejecting.
 * @param  {Function} fn
 * @param  {number} delay
 * @param  {number} tries
 * @param  {Function} backoffFn
 * @return {Function}
 */
function tenaciousP(fn, delay, tries, backoffFn) {
    var context,
        args,
        resolve,
        reject,
        p;

    p = new Promise(function(res, rej) {
        resolve = res;
        reject = rej;
    });

    /**
     * Make an attempt. If the promise attempt is
     * rejected, and there are still tries left,
     * another attempt is scheduled, with some amount of delay.
     * If the attempt is successful, the promise is resolved.
     */
    function attempt() {
        context = context || this;
        args = args || arguments;
        backoffFn = backoffFn || function(delay) {
            return delay * 2
        };
        fn.apply(context, args)
            .then(function(value) {
                // If successful, resolve the
                // promise.
                return resolve(value);
            })
            .catch(function(reason) {
                // If unsucessful, and there are still
                // tries left, try, try again.
                if (tries > 0) {
                    // Increase delay, and decrease
                    // number of tries left.
                    delay = backoffFn(delay);
                    tries = tries - 1;
                    return promiseDelay(delay)
                        .then(function(){
                            attempt();
                        });
                } else {
                    // If out of tries, reject with
                    // value of final rejection.
                    return reject(reason);
                }
            });
        return p;
    }
    return attempt;
}

module.exports = tenaciousP;