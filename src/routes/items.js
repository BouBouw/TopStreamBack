const auth = require("../middlewares/auth.js");

module.exports = [
    {
        method: "GET",
        endpoint: "/items",

        middlewares: [auth],
        requestListener: async function(req, res){
            if(req.user == null)
                return res.status(200).json({
                    success: false
                });

            if(Object.keys(req.query).includes("top")){
                const results = await this.mysql.query("SELECT items.* FROM items JOIN likes ON likes.itemId = items.id WHERE likes.up = 1 GROUP BY items.id ORDER BY COUNT(likes.id) DESC LIMIT 10");

                return res.status(200).json({
                    success: true,
                    items: results
                });
            }

            if(Object.keys(req.query).includes("last")){
                const results = await this.mysql.query("SELECT * FROM items ORDER BY id DESC LIMIT 10");

                return res.status(200).json({
                    success: true,
                    items: results
                });
            }

            if(Object.keys(req.query).includes("ids")){
                const results = await this.mysql.query("SELECT * FROM items WHERE id IN (?)", [
                    req.query.ids.split(",").filter(part => /^[1-9]\d*$/.test(part)).map(Number)
                ]);

                return res.status(200).json({
                    success: true,
                    items: results
                });
            }

            const title = req.query.title ?? "";
            const types = (req.query.types ?? "").split(",").filter(part => /^\d+$/.test(part)).map(Number);
            const categories = (req.query.categories ?? "").split(",").filter(part => /^[1-9]\d*$/.test(part)).map(Number);
            const companies = (req.query.companies ?? "").split(",").filter(part => /^[1-9]\d*$/.test(part)).map(Number);
            

            const query = ["SELECT *, (SELECT GROUP_CONCAT(up) FROM likes WHERE itemId = items.id) AS likes"];
            const params = [];

            if(categories.length != 0){
                query.push(", (SELECT COUNT(categoryId) FROM category_item WHERE itemId = items.id AND categoryId IN (?)) AS categoriesCount");
                params.push(categories);
            }

            if(companies.length != 0){
                query.push(", (SELECT COUNT(companyId) FROM company_item WHERE itemId = items.id AND companyId IN (?)) AS companiesCount");
                params.push(companies);
            }

            query.push(" FROM items HAVING 1 = 1");

            if(categories.length != 0){
                query.push(" AND categoriesCount = ?");
                params.push(categories.length);
            }

            if(companies.length != 0){
                query.push(" AND companiesCount = ?");
                params.push(companies.length);
            }

            if(title != ""){
                query.push(" AND title LIKE ?");
                params.push(`%${title}%`);
            }

            if(types.length != 0){
                query.push(" AND movie IN (?)");
                params.push(types);
            }

            query.push(" ORDER BY id DESC");

            res.status(200).json({
                success: true,
                items: await this.mysql.query(query.join(""), params)
            });
        }
    },
    {
        method: "GET",
        endpoint: "/items/likes",

        middlewares: [auth],
        requestListener: async function(req, res){
            if(req.user == null)
                return res.status(200).json({
                    success: false
                });

            res.status(200).json({
                success: true,
                items: await this.mysql.query("SELECT items.* FROM items JOIN likes ON items.id = likes.itemId WHERE likes.userId = ? ORDER BY likes.id DESC", [req.user.id])
            });
        }
    },
    {
        method: "GET",
        endpoint: "/items/:id",

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

            const results = await this.mysql.query(`SELECT *,
                (SELECT GROUP_CONCAT(categoryId) FROM category_item WHERE itemId = items.id) AS categories,
                (SELECT GROUP_CONCAT(companyId) FROM company_item WHERE itemId = items.id) AS companies,
                (SELECT GROUP_CONCAT(up) FROM likes WHERE itemId = items.id) AS likes,
                (SELECT up FROM likes WHERE itemId = items.id AND userId = ?) AS userLike
                FROM items WHERE id = ?`, [req.user.id, req.params.id]);

            if(results.length == 0)
                return res.status(200).json({
                    success: false
                });

            return res.status(200).json({
                success: true,
                item: {
                    ...results[0],

                    userLike: results[0].userLike,

                    categories: results[0].categories == null ? [] : results[0].categories.split(",").map(Number),
                    companies: results[0].companies == null ? [] : results[0].companies.split(",").map(Number),
                    likes: results[0].likes == null ? [] : results[0].likes.split(",").map(Number),

                    episodes: results[0].movie == 1 ? undefined : await this.mysql.query("SELECT * FROM episodes WHERE itemId = ?", [req.params.id])
                }
            });
        }
    },
    {
        method: "POST",
        endpoint: "/items/:id/like",

        middlewares: [auth],
        requestListener: async function(req, res){
            if(req.user == null)
                return res.status(200).json({
                    success: false
                });

            if(!/^[1-9]\d*$/.test(req.params.id) || ![0, 1].includes(req.body.up))
                return res.status(200).json({
                    success: false
                });

            const results = await this.mysql.query("SELECT 1 FROM items WHERE id = ?", [req.params.id]);
            if(results.length == 0)
                return res.status(200).json({
                    success: false
                });

            const likes = await this.mysql.query("SELECT up FROM likes WHERE userId = ? AND itemId = ?", [req.user.id, req.params.id]);
            if(likes.length == 0)
                await this.mysql.query("INSERT INTO likes(userId, itemId, up) VALUES (?, ?, ?)", [req.user.id, req.params.id, req.body.up]);
            else if(likes[0].up != req.body.up)
                await this.mysql.query("UPDATE likes SET up = ? WHERE userId = ? AND itemId = ?", [req.body.up, req.user.id, req.params.id]);

            res.status(200).json({
                success: true
            });
        }
    },
    {
        method: "POST",
        endpoint: "/items/:id/unlike",

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

            await this.mysql.query("DELETE FROM likes WHERE userId = ? AND itemId = ?", [req.user.id, req.params.id]);

            res.status(200).json({
                success: true
            });
        }
    },
    {
        method: "GET",
        endpoint: "/items/:id/suggestions",

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

            return res.status(200).json({
                success: true,
                items: await this.mysql.query(`SELECT * FROM (
                    SELECT items.*, COUNT(category_item.itemId) FROM items
                    JOIN category_item ON items.id = category_item.itemId
                    WHERE category_item.categoryId IN (
                        SELECT category_item.categoryId
                        FROM category_item
                        WHERE category_item.itemId = ?
                    )
                    GROUP BY items.id ORDER BY COUNT(category_item.itemId) DESC LIMIT 10
                ) AS suggestions ORDER BY RAND() LIMIT 5`, [req.params.id])
            });
        }
    }
];