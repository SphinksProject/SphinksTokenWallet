# Sphinks Token Wallet #

### How to use the Sphinks Token Wallet? ###

After downloading the latest version from http://sphinks.org:8080/api/wallet, extract the Sphinks Token Wallet folders from the archive, then simply click on start.html to open the app in your default browser (it can also then be added to bookmarks). No installation or local server needed. Works in Chrome, Firefox and Safari on Win64, MacOS64 and Linux64.

### How to update the Sphinks Token Wallet? ###

Before update, make sure that you have backed-up your wallet files (go to "Account", "Backup wallet"), then just delete the old version and extract the new version.

###  Dashboard is empty and no balance is showing ###

It is probably that the node you are connected to is down.
Look at the navigation bar, at the top of the page.
If the circle next to `Node` is red, click on it and select another node from the list.

# Developers #

### Build from source ###

1) Install gulp.

<pre>npm install -g gulp-cli</pre>

2) Open a console to the path of the Wallet folder and install all the needed dependencies.

<pre>npm install</pre>

3) Build:

<pre>gulp</pre>

##### OR #####

4) Run the Sphinks Token Wallet as App (packaged with Chromium browser).

<pre>npm run devApp</pre>

##### OR #####

5) Build Sphinks Token Wallet apps, default set to : win64,osx64,linux64.

<pre>gulp build-app</pre>

### Known issues ###

- Sometimes, depending the node used, unconfirmed data to sign is not incoming from websocket.
