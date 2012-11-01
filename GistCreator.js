var express = require('express'),
    app = express.createServer(),
	rest = require('restler'),
    fs = require('fs'),
	url = require("url");
    app.use(express.cookieParser());
    app.use(express.session({
	secret: "gistCreator!"
}));
app.use(express.bodyParser());

//t2-support-gists account
//var AccessToken = "f5492bbe3bf7b492f281d422d008cd28c260cb38";

//kristsauders account
var AccessToken = "102571f9af56bff41c1b62c9e0b4de3fb5724fef";

//If some files aren't getting added, or too many files are added, check this reguler expression
//It looks at each file folder and adds only those that include these strings
var re = new RegExp(/(jsp|js|rb|yml|js|txt|aspx|config|readme|php)/i);

var g = fs.readFileSync(__dirname + '/GistIDs.txt', 'ascii');
var Gists = JSON.parse(g);
var args = process.argv;

function createGist(PostData) {
    console.log('Creating ' + PostData['description'] + ' at url ' + 'https://api.github.com/gists?access_token=' + AccessToken);
	rest.post('https://api.github.com/gists?access_token=' + AccessToken, {
		data: JSON.stringify(PostData),
		headers: {
			"Accept": "application/json",
			"Authorization": "BEARER " + AccessToken
		}
	}).on('complete', function(data, response) {
		if (response.statusCode == 201) {
            Gists[data.description] = data.id;
			console.log(data.description + ': https://gist.github.com/' + data.id);
		}
		else {
            Gists[data.description] = JSON.stringify(data);
			console.log('Failure for ' + PostData['description'] + ' : ' + JSON.stringify(data));
		}
	});
}

function updateGist(PostData, GistID) {
	console.log('Updating ' + PostData['description'] + ' at url ' + 'https://api.github.com/gists/' + GistID + '?access_token=' + AccessToken);
	rest.patch('https://api.github.com/gists/' + GistID + '?access_token=' + AccessToken, {
		data: JSON.stringify(PostData),
		headers: {
			"Accept": "application/json",
			"Authorization": "BEARER " + AccessToken
		}
	}).on('complete', function(data, response) {
		if (response.statusCode == 200) {
			Gists[data.description] = data.id;
			console.log(data.description + ': https://gist.github.com/' + data.id);
		}
		else {
			Gists[data.description] = JSON.stringify(data);
			console.log('Failure for ' + PostData['description'] + ' : ' + JSON.stringify(data));
		}
	});
}

if((args.length == 6) && (args[2] == 'create') && (args[4] != 'all')) {
    console.log('Creating new Gist for app at ' + args[4]);
    var PostData = {};
    PostData['public'] = args[3];
    PostData['description'] = args[5];
    PostData['files'] = {};
	var files = fs.readdirSync(args[4]);
	for (var file in files) {
        var f = files[file];
		if (files[file].match(re)) {
            var data = fs.readFileSync(args[4] + '/' + f, 'ascii');
            PostData['files'][f] = {'content':data};
		}
	}
    createGist(PostData);
}

if((args.length == 7) && (args[2] == 'update') && (args[5] != 'all')) {
    console.log('Updating Gist with ID ' + args[4] + ' for app at ' + args[5]);
    var PostData = {};
    PostData['public'] = args[3];
    PostData['description'] = args[6];
    PostData['files'] = {};
	var files = fs.readdirSync(args[5]);
	for (var file in files) {
        var f = files[file];
		if (files[file].match(re)) {
            var data = fs.readFileSync(args[5] + '/' + f, 'ascii');
            PostData['files'][f] = {'content':data};
		}
	}
    updateGist(PostData, args[4]);
}

// Experimental - Update all gists with IDs in the gistIDs.txt file
if((args.length == 6) && (args[2] == 'update') && (args[4] == 'all')) {
    var services = fs.readdirSync(args[5]);
    for (var service in services) {
    	var s = services[service];
		if ((s != 'README') && (s != '.git')) {
			var languages = fs.readdirSync(args[5] + '/' + s);
			for (var language in languages) {
				var l = languages[language];
				if (l != '.DS_Store') {
					var apps = fs.readdirSync(args[5] + '/' + s + '/' + l);
					for (var app in apps) {
						var a = apps[app];
						if (a != '.DS_Store') {
                            var PostData = {};
                            PostData['public'] = true;
                            PostData['description'] = s + ' ' + l + ' ' + a;
                            PostData['files'] = {};
							var files = fs.readdirSync(args[5] + '/' + s + '/' + l + '/' + a);
							for (var file in files) {
                                var f = files[file];
								if (files[file].match(re)) {
                                    var data = fs.readFileSync(args[5] + '/' + s + '/' + l + '/' + a + '/' + f, 'ascii');
                                    PostData['files'][f] = {'content':data};
								}
							}
                            updateGist(PostData, Gists[PostData['description']]);
						}
					}
				}
			}
		}
	}
}

// Experimental - Create all gists in repository
if((args.length == 6) && (args[2] == 'create') && (args[4] == 'all')) {
    var services = fs.readdirSync(args[5]);
	for (var service in services) {
		var s = services[service];
		if ((s != 'README') && (s != '.git')) {
			var languages = fs.readdirSync(args[5] + '/' + s);
			for (var language in languages) {
				var l = languages[language];
				if (l != '.DS_Store') {
					var apps = fs.readdirSync(args[5] + '/' + s + '/' + l);
					for (var app in apps) {
						var a = apps[app];
						if (a != '.DS_Store') {
                            var PostData = {};
                            PostData['public'] = true;
                            PostData['description'] = s + ' ' + l + ' ' + a;
                            PostData['files'] = {};
							var files = fs.readdirSync(args[5] + '/' + s + '/' + l + '/' + a);
							for (var file in files) {
                                var f = files[file];
								if (files[file].match(re)) {
                                    var data = fs.readFileSync(args[5] + '/' + s + '/' + l + '/' + a + '/' + f, 'ascii');
                                    PostData['files'][f] = {'content':data};
								}
							}
                            createGist(PostData);
						}
					}
				}
			}
		}
	}
    setTimeout(function() {
        console.log('All Gists should be done now, writing to file. If any complete after this point, they might not get saved.');
    }, 9000);
    setTimeout(function() {
        fs.writeFileSync('/home/ec2-user/Gist Creator/GistIDs.txt', JSON.stringify(Gists), 'ascii');
        console.log('Wrote Gist IDs to file /home/ec2-user/Gist Creator/GistIDs.txt');
        var GistLinks = {};
        for(var gist in Gists) {
            GistLinks[gist] = 'https://gist.github.com/' + Gists[gist];
        }
        fs.writeFileSync('/home/ec2-user/Gist Creator/GistLinks.txt', JSON.stringify(GistLinks), 'ascii');
        console.log('Wrote Gist Links to file /home/ec2-user/Gist Creator/GistLinks.txt');
    }, 10000);
}




//There's already an oauth token, but in case you need another, this should help. 
//You'll have to uncomment the line at the bottom starting up the server, and then go to
//code-api-att.com:8085/oauth
app.get('/oauth', function(req, res) {
    if (!req.query.code) {
		res.send('<form method="post">' + '<p><input type="submit" value="Submit" /></p>' + '</form>');
	}
	else {
		rest.post('https://github.com/login/oauth/access_token', {
			data: {
				"client_id": "15b8a75f0d11336f78fe",
				"client_secret": "c76f9deb423fc5645533eded666b282ee1091e13",
				"code": req.query.code
			}, headers: { "Accept": "application/json" }
		}).on('complete', function(data, response) {
			if (response.statusCode == 200) {
                console.log(data);
				var AT = data.access_token;
				rest.get('https://api.github.com/gists?access_token=' + AT).on('complete', function(data, response) {
                    res.send(JSON.stringify(data));
				});
			}
		});
	}
});

app.post('/oauth', function(req, res) {
    req.session.phone = req.body.phone;
	res.redirect('https://github.com/login/oauth/authorize?client_id=15b8a75f0d11336f78fe&scope=user,repo,public_repo,gist');
});

//Careful with this, it's a way to delete a ton of Gists
app.get('/deleteAll', function(req, res) {
	rest.get('https://api.github.com/gists?access_token=' + AccessToken).on('complete', function(data, response) {
        for(var i in data) {
            console.log('Deleting Gist with ID: ' + data[i].id);
            rest.del('https://api.github.com/gists/' + data[i].id + '?access_token=' + AccessToken, {
                data: {
                    
                    }, headers: { "Accept": "application/json" }
            }).on('complete', function(data, response) {
                console.log(response.statusCode);
            });
        }
		res.send(JSON.stringify(data, null, "\t"));
	});
});

//Only start this up when needing a new oauth token.
//app.listen(8085);
//console.log('Started up successfully.');