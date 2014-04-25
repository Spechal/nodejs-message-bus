/**
 * message-bus: A simple email message bus http server
 * @author Travis Crowder <travis.crowder@spechal.com>
 */

/**
 * would be nice to have:
 * - fire routine ... emails everyone on all email lists
 */

/**
 * Hashmap of array of addresses the program can send to
 * i.e. If a user submits to=group1, the addresses in the "group1" array will be mailed
 */
var allowed_emails = {
    'group1': [
        'user@domain.com'
    ]
}

/**
 * Get data via POST or GET (GET seems to be broken ... querystring package issue?)
 * @type {string}
 */
var requestType = 'POST';

/**
 * Port to listen on
 * @type {number}
 */
var httpPort = 4321;

/**
 * nodemailer SMTP options
 */
var smtpOptions = {

}

/**
 * nodemailer mail options
 */
var mailerOptions = {
    from: 'root <root@localhost>',
    subject: 'Message from message-bus',
    text: 'Default message'
}

/**
 * PHP in_array
 * @param needle
 * @param haystack
 * @returns {boolean}
 */
function in_array(needle, haystack){
    if(haystack instanceof Array){
        for(var i = 0; i < haystack.length; i++){
            if(haystack[i] == needle){
                return true;
            }
        }
    } else {
        for(var p in haystack){
            if(haystack[p] === needle){
                return true;
            }
        }
    }
    return false;
}

/**
 * PHP array_keys
 * @param data
 * @returns {*}
 */
function array_keys(data){
    if(data instanceof Array){
        var ret = [];
        for(var i = 0; i < data.length; i++){
            ret.push(data[i]);
        }
        return ret;
    } else if(data instanceof Object){
        return Object.keys(data);
    }
    return false;
}

/**
 * Escape meta characters in regular expression
 * @param string
 * @returns {XML|string|void}
 */
function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

/**
 * Replace all instances of a string
 * @param find
 * @param replace
 * @param str
 * @returns {XML|string|void}
 */
function replaceAll(find, replace, str) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

/**
 * Replace newline characters with EOL characters
 * @param data
 * @returns {XML|string|void}
 */
function nl2eol(data){
    return replaceAll('\\n', endOfLine, data);
}

var http = require('http');
var qs = require('querystring');
var mailer = require('nodemailer');
var endOfLine = require('os').EOL;

var smtpTransport = mailer.createTransport("SMTP", smtpOptions);

http.createServer(function(req, res){
    if(req.method == requestType){
        // do stuff
        var body = '';

        req.on('data', function(data){
            body += data;
            if(body > 1e6){
                // request too large
                res.writeHead(413, {"Content-Type": "text/plain"});
                res.write('Data submission was too large.');
                res.end();
                res.connection.destroy();
            }
        });

        req.on('end', function(){
            // DATA will hold the query string hashmap
            var DATA = qs.parse(body);

            if(DATA != null){
                if(in_array(DATA.to, array_keys(allowed_emails))){
                    // override mailOptions with DATA values
                    mailerOptions.to = allowed_emails[DATA.to].join(',');
                    if(DATA.subj != null){
                        mailerOptions.subject = DATA.subj;
                    }
                    mailerOptions.text = nl2eol(DATA.body);
                    // good to go - send message
                    smtpTransport.sendMail(mailerOptions, function(error, result){
                        if(!error){
                            res.writeHead(200, {"Content-Type": "text/plain"});
                            res.write('Transaction complete. [' + result.message + ']');
                        } else {
                            // email failure
                            console.log(error);
                            res.writeHead(503, {"Content-Type": "text/plain"});
                            res.write('Unable to send message. [' + error.message + ']');
                        }
                        smtpTransport.close();
                    });
                } else {
                    // invalid email address
                    res.writeHead(400, {"Content-Type": "text/plain"});
                    res.write('Invalid addressee [' + DATA.to + '].');
                }
            } else {
                // no data
                res.writeHead(400, {"Content-Type": "text/plain"});
                res.write('No data supplied.');
            }
        });
        // always end
        res.end();

    } else {
        // unsupported method
        res.writeHead(501, {"Content-Type": "text/plain"});
        res.write('Unsupported method.  Use ' + requestType + '.');
        res.end();
    }
}).listen(httpPort);
