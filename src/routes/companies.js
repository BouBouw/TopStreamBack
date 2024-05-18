const auth = require("../middlewares/auth.js");

module.exports = [
    {
        method: "GET",
        endpoint: "/companies",

        middlewares: [auth],
        requestListener: async function(req, res){
            if(req.user == null)
                return res.status(200).json({
                    success: false
                });

            res.status(200).json({
                success: true,
                companies: await this.mysql.query("SELECT * FROM companies")
            });
        }
    }
];