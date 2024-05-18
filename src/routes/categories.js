const auth = require("../middlewares/auth.js");

module.exports = [
    {
        method: "GET",
        endpoint: "/categories",

        middlewares: [auth],
        requestListener: async function(req, res){
            if(req.user == null)
                return res.status(200).json({
                    success: false
                });

            res.status(200).json({
                success: true,
                categories: await this.mysql.query("SELECT * FROM categories")
            });
        }
    }
];