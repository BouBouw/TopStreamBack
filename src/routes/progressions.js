const auth = require("../middlewares/auth.js");

module.exports = [
    {
        method: "POST",
        endpoint: "/progression",

        middlewares: [auth],
        requestListener: async function(req, res){
            if(req.user == null)
                return res.status(200).json({
                    success: false
                });

            const progressions = await this.mysql.query("SELECT 1 FROM progressions WHERE userId = ? AND videoId = ?", [req.user.id, req.body.videoId]);
            if(progressions.length == 0)
                await this.mysql.query("INSERT INTO progressions(userId, videoId, progression) VALUES (?, ?, ?)", [req.user.id, req.body.videoId, req.body.progression]);
            else
                await this.mysql.query("UPDATE progressions SET progression = ? WHERE userId = ? AND videoId = ?", [req.body.progression, req.user.id, req.body.videoId]);

            res.status(200).json({
                success: true
            });
        }
    },
    {
        method: "GET",
        endpoint: "/progressions",

        middlewares: [auth],
        requestListener: async function(req, res){
            if(req.user == null)
                return res.status(200).json({
                    success: false
                });

            res.status(200).json({
                success: true,
                progressions: await this.mysql.query("SELECT *, (SELECT refId FROM videos WHERE id = progressions.videoId) AS refId, (SELECT title FROM items WHERE id = refId) AS itemTitle FROM progressions WHERE userId = ?", [req.user.id])
            });
        }
    },
    {
        method: "DELETE",
        endpoint: "/progressions/:id",

        middlewares: [auth],
        requestListener: async function(req, res){
            if(req.user == null)
                return res.status(200).json({
                    success: false
                });

            if(!/^[1-9]\d*$/.test(req.params.id))
                return res.status(200).json({
                    success: false
                });

            await this.mysql.query("DELETE FROM progressions WHERE id = ? AND userId = ?", [req.params.id, req.user.id])

            res.status(200).json({
                success: true
            });
        }
    },
    {
        method: "GET",
        endpoint: "/progressions/:id",

        middlewares: [auth],
        requestListener: async function(req, res){
            if(req.user == null)
                return res.status(200).json({
                    success: false
                });

            if(!/^[1-9]\d*$/.test(req.params.id))
                return res.status(200).json({
                    success: false
                });

            const results = await this.mysql.query("SELECT * FROM progressions WHERE userId = ? AND videoId = ?", [req.user.id, req.params.id]);

            res.status(200).json({
                success: true,
                progression: results[0] ?? null
            });
        }
    }
];
