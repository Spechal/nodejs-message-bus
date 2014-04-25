nodejs-message-bus
==================

A simple email message bus http server.  Send a request with valid values and send some emails.

#Usage

Basic usage:
Get the code and install the required dependencies, which is nodemailer
```
git clone https://github.com/Spechal/nodejs-message-bus.git
cd nodejs-message-bus
npm install
```
Configure the bin/server.js allowed_emails list variable to include groups of email addresses to send to.  **The name of the group is the to value in your POST request.**

Start the server; it runs on 127.0.0.1:4321 by default.
```
node bin/server.js
```
Post to the server with the following parameters:
```json
{
 to: 'group-key-value',
 subj: 'Subject',
 body: 'Message'
}
```
i.e.
```
curl --data "to=group1&body=some message\n\n-root&subj=new subject" http://127.0.0.1:4321
```
