exports.getPassword = async function(username,pool){
    var result = await pool.query(`SELECT * FROM users WHERE username='${username}'`);
    if(result.rows.length == 0)
        return "";
    return result.rows[0].password;
}

exports.register = async function(username,password,pool){
    if(password.length < 4)
        return 2;
    var result = await pool.query(`SELECT * FROM users WHERE username='${username}'`);
    if(result.rows.length > 0)
        return 1;
    await pool.query(`INSERT INTO users (username,password) VALUES ('${username}','${password}')`);
    return 0;
}

exports.getJobOffers = async function(pool){
    var result = await pool.query(`SELECT * FROM job_offers WHERE contract=false ORDER BY post_date DESC`);
    return result.rows;
}

exports.getJobOffersForUser = async function(pool, username){
    var result = await pool.query(`SELECT * FROM job_offers WHERE username='${username}' ORDER BY post_date DESC`);
    return result.rows;
}

exports.getJobOfferByID = async function(pool, id){
    var result = await pool.query(`SELECT * FROM job_offers WHERE offerID='${id}' ORDER BY post_date DESC`);
    return result.rows[0];
}

exports.addJobOffer = async function(pool, user, desc, lat, lon, rad){
    await pool.query(`INSERT INTO job_offers (username,description,latitude,longitude,radius,post_date,contract) VALUES ('${user}','${desc}','${lat}','${lon}','${rad}',CURRENT_DATE,false)`);
    return 0;
}

exports.getServiceOffers = async function(pool){
    var result = await pool.query(`SELECT * FROM service_offers WHERE contract=false ORDER BY post_date DESC`);
    return result.rows;
}

exports.getServiceOffersForUser = async function(pool, username){
    var result = await pool.query(`SELECT * FROM service_offers WHERE username='${username}' ORDER BY post_date DESC`);
    return result.rows;
}

exports.getServiceOfferByID = async function(pool, id){
    var result = await pool.query(`SELECT * FROM service_offers WHERE offerID='${id}' ORDER BY post_date DESC`);
    return result.rows[0];
}

exports.addServiceOffer = async function(pool, user, desc, lat, lon, rad){
    await pool.query(`INSERT INTO service_offers (username,description,latitude,longitude,radius,post_date,contract) VALUES ('${user}','${desc}','${lat}','${lon}','${rad}',CURRENT_DATE,false)`);
    return 0;
}
