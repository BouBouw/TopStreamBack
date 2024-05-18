const expressapi = require("@borane/expressapi");

module.exports = [
    {
        method: "POST",
        endpoint: "/auth/login",

        middlewares: [],
        requestListener: async function(req, res){
            const results = await this.mysql.query("SELECT id, resetId FROM users WHERE email = ? AND password = ?", [req.body.email, expressapi.sha256(req.body.password)]);
            if(results.length == 0)
                return res.status(200).json({
                    success: false,
                    error: "Email ou mot de passe erroné."
                });

            res.status(200).json({
                success: true,
                token: this.jsonToken.sign({
                    expireTimestamp: Date.now() + 1000 * 60 * 60 * 24 * 14,
                    resetId: results[0].resetId,
                    id: results[0].id
                })
            });
        }
    }
];