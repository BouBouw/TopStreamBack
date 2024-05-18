const fs = require("fs");

module.exports = [
    {
        method: "GET",
        endpoint: "/assets/avatars/:id",

        middlewares: [],
        requestListener: function(req, res){
            if(!/^[1-9]\d*$/.test(req.params.id) || !fs.existsSync(`${__dirname}/../../assets/avatars/${req.params.id}.webp`))
                return res.status(200).sendFile(`${__dirname}/../../assets/avatars/default.webp`);

            res.status(200).sendFile(`${__dirname}/../../assets/avatars/${req.params.id}.webp`);
        }
    }
];