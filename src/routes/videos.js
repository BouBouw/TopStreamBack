const auth = require("../middlewares/auth.js");

module.exports = [
    {
        method: "GET",
        endpoint: "/videos/movies/:id",

        middlewares: [auth],
        requestListener: async function requestListener(req, res){
            if(req.user == null)
                return res.status(200).json({
                    success: false
                });

            if(!/^[1-9]\d*$/.test(req.params.id))
                return res.status(200).json({
                    success: false
                });

            const results = await this.mysql.query("SELECT link FROM videos WHERE refId = ? AND movie = ?", [req.params.id, 1]);
            if(results.length == 0)
                return res.status(200).json({
                    success: false
                });

            res.status(200).json({
                success: true,
                link: results[0].link
            });
        }
    },
    {
        method: "GET",
        endpoint: "/videos/episodes/:id",

        middlewares: [auth],
        requestListener: async function requestListener(req, res){
            if(req.user == null)
                return res.status(200).json({
                    success: false
                });

            if(!/^[1-9]\d*$/.test(req.params.id))
                return res.status(200).json({
                    success: false
                });

            const results = await this.mysql.query("SELECT link FROM videos WHERE refId = ? AND movie = ?", [req.params.id, 0]);
            if(results.length == 0)
                return res.status(200).json({
                    success: false
                });

            res.status(200).json({
                success: true,
                link: results[0].link
            });
        }
    }
];