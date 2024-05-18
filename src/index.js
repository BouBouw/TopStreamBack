const expressapi = require("@borane/expressapi");
const sengridMail = require("@sendgrid/mail");
const config = require("../config.json");
const fs = require("fs");


function listFilesInFolder(path){
    return fs.readdirSync(path, { withFileTypes: true }).flatMap(entry => {
        const subpath = `${path}/${entry.name}`;
        return entry.isDirectory() ? listFilesInFolder(subpath) : subpath;
    });
}

sengridMail.setApiKey(config.sendgrid);

const services = {
    jsonToken: new expressapi.JsonToken(config.secret),
    mysql: require("./mysql.js"),
    sengridMail,
    config
};


const httpServer = new expressapi.HttpServer(5050);

httpServer.use((req, res) => {
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");

    if(config.cors.includes(req.headers.origin))
        res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
});

for(let path of listFilesInFolder(`${__dirname}/routes`)){
    const module = require(path);

    for(let route of module){
        httpServer[route.method.toLowerCase()](
            route.endpoint,
            route.requestListener.bind(services),
            route.middlewares.map(m => m.bind(services))
        );
    }
}

httpServer.listen();