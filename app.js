var http = require('http');
//var socket = require('socket.io');
var express = require('express');
var app = express();
var server = http.createServer(app);
//var io = socket(server);
var cookieParser = require('cookie-parser');
var pg = require('pg');

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("password44"));
app.use( express.static('./'));
app.set('view engine', 'ejs');
app.set('views', './views');

var utils = require('./utils.js')
var dtbs = require('./databases.js')
var job_offers = [];
var service_offers = [];
var offer_types = ["job_offer", "service_offer"]
var users = new Map();
var dataPool = new pg.Pool({
    host: 'localhost',
    database: 'solana_project',
    user: 'postgres',
    password: 'password123'
});

//login & logout

function authorize(req, res, next) {
        if ( req.signedCookies.username ) {
            (async () => {
                var pwd = await dtbs.getPassword(req.signedCookies.username,dataPool);
                if( !users.has(req.signedCookies.username) && pwd == "" ){
                    res.cookie('username', '', { maxAge: -1 } );
                    res.redirect('/login?returnUrl='+req.url);
                }else if(users.has(req.signedCookies.username) && pwd == "" && req.signedCookies.ctrlnum != users.get(req.signedCookies.username).ctrlNum){
                    res.cookie('username', '', { maxAge: -1 } );
                    res.redirect('/login?returnUrl='+req.url);
                }else{
                    if(!users.has(req.signedCookies.username)){
                        users.set(req.signedCookies.username,new utils.User());
                        users.get(req.signedCookies.username).logged = true;
                        users.get(req.signedCookies.username).ctrlNum = req.signedCookies.ctrlNum;

                    }
                    users.get(req.signedCookies.username).time = utils.REFRESH_VALID_TIME;
                    req.username = req.signedCookies.username;
                    next();
                }
            })();
        } else {
            res.redirect('/login?returnUrl='+req.url);
        }
}

app.get( '/logout', (req, res) => {
    usr = req.signedCookies.username;
    if(users.has(usr) && !users.get(usr).logged )
        users.get(usr).time = 1;
    res.cookie('username', '', { maxAge: -1 } );
    res.redirect('/');
});

app.get( '/login', (req, res) => {
    res.render('login');
})

app.post( '/login', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    (async () => {
        var pwd = await dtbs.getPassword(username,dataPool);
        if ( pwd == password && pwd != "" ) {
            if( !users.has(username) ){
                users.set(username,new utils.User());
                users.get(username).logged = true;
            }
            res.cookie('username', username, { signed: true });
            res.redirect(req.query.returnUrl);
        } else {
            res.render( 'login', { message : "Incorrect username or password." });
        }
    })()
});

//register

app.get( '/register', (req, res) => {
    res.render('register');
});

app.post( '/register', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var rs = 3;
    (async () => {
        rs = await dtbs.register(username,password,dataPool,res);
        if(rs == 0){
            res.render('register', { message : "Registration successful!" })
        }else if(rs == 1){
            res.render('register', { message : "Username occupied!" });
        }else if(rs == 2){
            res.render('register', { message : "Password too short" });
        }else{
            res.render('register', { message : "Registration unsuccessful!" });
        }
    })()
});

//main

app.get('/', (req, res) => {
    if ( req.signedCookies.username ) {
        res.render('app', {logged: true, username: req.signedCookies.username});
    }else{
        res.render('app', {logged: false});
    }
});

//post offer

app.get('/post_offer', authorize, (req, res) => {
    res.render('post_offer', {username: req.signedCookies.username, offer_types: offer_types});
});

app.post('/post_offer', authorize, (req, res) => {
    var username = req.signedCookies.username;
    var description = req.body.description;
    var latitude = Number.parseFloat(req.body.latitude);
    var longitude = Number.parseFloat(req.body.longitude);
    var radius = Number.parseFloat(req.body.radius);
    var offerType = req.body.offerType;
    if(Number.isNaN(latitude) || Number.isNaN(longitude) || Number.isNaN(radius))
        res.render( 'post_offer', { username: req.signedCookies.username, offer_types: offer_types, message : "Latitude, longitude and radius must be numeric." });
    else if(description == "")
        res.render( 'post_offer', { username: req.signedCookies.username, offer_types: offer_types, message : "Description must not be empty." });
    else{
        (async () => {
            if(offerType == "job_offer")
                await dtbs.addJobOffer(dataPool, username, description, latitude, longitude, radius);
            else if(offerType == "service_offer")
                await dtbs.addServiceOffer(dataPool, username, description, latitude, longitude, radius);
        })()
        if(offerType == "job_offer")
            res.redirect("/job_offers");
        else if(offerType == "service_offer")
            res.redirect("/service_offers");
        else
            res.redirect("/");
    }
});

//job_offers; npp = number per page, np = number of page counting from 0

app.get('/job_offers', authorize, (req, res) => {
    ret = utils.nav_browse(req, job_offers.length);
    if( req.signedCookies.username ) {
        res.render('job_offers', {logged: true, username: req.signedCookies.username, job_offers: job_offers.slice(ret.begv, ret.endv), off_num: ret.mx_num, begv: ret.begv, endv: ret.endv, npp: ret.npp, np: ret.np});
    }else{
        res.render('job_offers', {logged: false, job_offers: job_offers.slice(ret.begv, ret.endv), off_num: ret.mx_num, begv: ret.begv, endv: ret.endv, npp: ret.npp, np: ret.np});
    }
});

//home, to do: delete offer

app.get('/home', authorize, (req, res) => {
    var j_offers = [];
    var s_offers = [];
    var username = req.signedCookies.username;
    (async () => {
        j_offers = await dtbs.getJobOffersForUser(dataPool, username);
        s_offers = await dtbs.getServiceOffersForUser(dataPool, username);
        res.render('home', {username: req.signedCookies.username, job_offers: j_offers, service_offers: s_offers});
    })()
});

//service_offers

app.get('/service_offers', authorize, (req, res) => {
    ret = utils.nav_browse(req, service_offers.length);
    if( req.signedCookies.username ) {
        res.render('service_offers', {logged: true, username: req.signedCookies.username, service_offers: service_offers.slice(ret.begv, ret.endv), off_num: ret.mx_num, begv: ret.begv, endv: ret.endv, npp: ret.npp, np: ret.np});
    }else{
        res.render('service_offers', {logged: false, service_offers: service_offers.slice(ret.begv, ret.endv), off_num: ret.mx_num, begv: ret.begv, endv: ret.endv, npp: ret.npp, np: ret.np});
    }
});

//offer

app.get('/offer', authorize, (req, res) => {
    (async () => {
        var offer_type = req.query.offertype;
        var offer_type_n;
        var offer_id = req.query.offerid;
        var offer;
        if(offer_type == 1){
            offer = await dtbs.getJobOfferByID(dataPool, offer_id);
            offer_type_n = "Job offer";
        }
        else if(offer_type == 2){
            offer = await dtbs.getServiceOfferByID(dataPool, offer_id);
            offer_type_n = "Service offer";
        }
        res.render('offer', {username: req.signedCookies.username, offer: offer, offer_type_n: offer_type_n, offer_type: offer_type});
    })()
});

//actualize data, to do: control logged in users

setInterval( function() {
    (async () => {
        job_offers = await dtbs.getJobOffers(dataPool);
        service_offers = await dtbs.getServiceOffers(dataPool);
    })()
}, 1000 );


//socket

//io.on('connection', function(socket) {});



server.listen(process.env.PORT || 3030);