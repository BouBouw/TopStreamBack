const expressapi = require("@borane/expressapi");

module.exports = [
    {
        method: "POST",
        endpoint: "/auth/register",

        middlewares: [],
        requestListener: async function(req, res){
            const results = await this.mysql.query("SELECT email FROM users WHERE email = ?", [req.body.email]);
            if(results.length > 0)
                return res.status(200).json({
                    success: false,
                    error: "Email indisponible."
                });

            const response = await this.mysql.query("INSERT INTO users(email, password) VALUES(?, ?)", [req.body.email, expressapi.sha256(req.body.password)]);
            
            res.status(200).json({
                success: true,
                token: this.jsonToken.sign({
                    expireTimestamp: Date.now() + 1000 * 60 * 60 * 24 * 14,
                    id: response.insertId,
                    resetId: 0
                })
            });
        }
    }
];