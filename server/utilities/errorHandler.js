/**
 * Modified from the Connect project: https://github.com/senchalabs/connect/blob/master/lib/middleware/errorHandler.js
 *
 * Flexible error handler, providing (_optional_) stack traces and logging
 * and error message responses for requests accepting text, html, or json.
 *
 * Options:
 *
 *   - `showStack` respond with both the error message and stack trace. Defaults to `false`
 *   - `showMessage`, respond with the exception message only. Defaults to `false`
 *   - `dumpExceptions`, dump exceptions to stderr (without terminating the process). Defaults to `false`
 *   - `logErrors`, will dump a log entry and stack trace into the gievn file. Defaults to `false`
 *
 * Text:
 *   By default, and when _text/plain_ is accepted a simple stack trace
 *   or error message will be returned.
 *
 * JSON:
 *   When _application/json_ is accepted, connect will respond with
 *   an object in the form of `{ "error": error }`.
 *
 * HTML:
 *   When accepted connect will output a nice html stack trace.
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

var fs = require('fs');

exports = module.exports = function errorHandler(options){

    options = options || {};
    // defaults
    var showStack = options.showStack
        , showMessage = options.showMessage
        , dumpExceptions = options.dumpExceptions
        , logErrors = options.logErrors
        , logErrorsStream = false;

    if(options.logErrors)
        logErrorsStream = fs.createWriteStream(logErrors, {'flags': 'a', encoding: 'utf-8', mode: 0666});

    return function errorHandler (err, req, res, next) {

        var accept = req.headers.accept || '';

        if (res.statusCode < 400) res.statusCode = 500;

        if(dumpExceptions) {
            var body = err.message ? {message: err.message} : err;
            if (err.saveResult){ body.saveResult = err.saveResult; }
            var status = err.statusCode || 500;
            logError(err, status, body);
        }

        if(logErrors){
            var now = new Date();
            logErrorsStream.write(now.toJSON() + ' - Error Happened: \n' + err.stack + "\n");
        }

        if(showStack) {
            if (res.statusCode === 403) {
                var json = JSON.stringify({
                    auth: {
                        status: "error",
                        message: err.message,
                        stack: err.stack
                    }
                })
                res.setHeader('Content-Type', 'application/json');
                res.status(403).json(json);
            } else {
                var json = JSON.stringify({
                    error: "There was a server error generating the content.",
                    stack: err.stack
                });
                res.setHeader('Content-Type', 'application/json');
                //res.end(json);
                (err.statusCode) ? res.status(err.statusCode).json(json) : res.json(json);
            }
        }else{
            if (res.statusCode === 403) {

                console.log("ERROR : "+err)
                var json = JSON.stringify({
                    authentication: {
                        status: "error",
                        message: err.message
                    }
                });
                res.setHeader('Content-Type', 'application/json');
                res.status(403).json(json);
            } else {
                var json = JSON.stringify({
                    error: "There was a server error generating the content."
                });
                res.setHeader('Content-Type', 'application/json');
                //res.end(json);
                (err.statusCode) ? res.status(err.statusCode).json(json) : res.json(json);
            }
        }
    };

    function logError(err, status, body){
        setTimeout(log,0); // let response write to console, then error
        function log(){
            var stack = '';
            var msg = '--------------\nStatus: '+status + ' ' +
                (typeof body === 'string' ? body : ('\n'+JSON.stringify(body, null, 2)));
            // log all inner errors too
            while(err) {
                stack = err.stack || stack; // get deepest stack
                err = err.innerError;
                if (err && err.message){
                    msg += '\n'+err.message;
                }
            }
            // log deepest stack
            if(stack) {msg += '\n'+stack; }
            console.error('%s\n--------------'.debug,msg);
        }
    }
};
