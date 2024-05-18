const expressapi = require("@borane/expressapi");
const auth = require("../middlewares/auth.js");
const sharp = require("sharp");
const fs = require("fs");

module.exports = [
    {
        method: "GET",
        endpoint: "/user",

        middlewares: [auth],
        requestListener: function(req, res){
            if(req.user == null)
                return res.status(200).json({
                    success: false
                });

            res.status(200).json({
                success: true,
                user: req.user
            });
        }
    },
    {
        method: "POST",
        endpoint: "/user/email",

        middlewares: [auth],
        requestListener: async function(req, res){
            if(req.user == null)
                return res.status(200).json({
                    success: false
                });

            const results = await this.mysql.query("SELECT 1 FROM users WHERE email = ? AND id != ?", [req.body.email, req.user.id]);
            if(results.length == 1)
                res.status(200).json({
                    success: false
                });

            await this.mysql.query("UPDATE users SET email = ? WHERE id = ?", [req.body.email, req.user.id]);

            res.status(200).json({
                success: true
            });
        }
    },
    {
        method: "POST",
        endpoint: "/user/password",

        middlewares: [auth],
        requestListener: async function(req, res){
            if(req.user == null)
                return res.status(200).json({
                    success: false
                });

            await this.sengridMail.send({
                to: req.user.email,
                from: "noreply@topstream.fr",
                subject: "Modification de votre mot de passe.",
                html: `<p>Vous disposez de 20min pour modifier votre mot de passe grace  à ce <a href="https://topstream.fr/password?token=${
                    this.jsonToken.sign({
                        type: "password",
                        userId: req.user.id,
                        expireTimestamp: Date.now() + 1000 * 60 * 20
                    })
                }">lien</a>.</p>`
            });

            res.status(200).json({
                success: true
            });
        }
    },
    {
        method: "POST",
        endpoint: "/user/edit-password",

        middlewares: [],
        requestListener: async function(req, res){
            if(!Object.keys(req.body).includes("token"))
                return res.status(200).json({
                    success: false
                });
        
            const decodedToken = this.jsonToken.verify(req.body.token);
            if(decodedToken == null || decodedToken.expireTimestamp < Date.now())
                return res.status(200).json({
                    success: false
                });

            if(decodedToken.type != "password")
                return res.status(200).json({
                    success: false
                });

            await this.mysql.query("UPDATE users SET password = ?, resetId = resetId + 1 WHERE id = ?", [expressapi.sha256(req.body.password), decodedToken.userId])

            res.status(200).json({
                success: true
            });
        }
    },
    {
        method: "POST",
        endpoint: "/user/avatar",

        middlewares: [auth],
        requestListener: async function(req, res){
            if(req.user == null)
                return res.status(200).json({
                    success: false
                });

            try{
                const buffer = await sharp(Buffer.from(req.body, "base64"))
                    .webp()
                    .toBuffer();

                if(buffer.length > 3 * 1024 * 1024)
                    return res.status(200).json({
                        success: false,
                        error: "Avatar size > 3mo."
                    });

                fs.writeFileSync(`${__dirname}/../assets/avatars/${req.user.id}.webp`, buffer);
            }catch{
                return res.status(200).json({
                    success: false
                });
            }

            res.status(200).json({
                success: true
            });
        }
    },
    {
        method: "DELETE",
        endpoint: "/user/avatar",

        middlewares: [auth],
        requestListener: function(req, res){
            if(req.user == null)
                return res.status(200).json({
                    success: false
                });

            if(fs.existsSync(`${__dirname}/../assets/avatars/${req.user.id}.webp`))
                fs.rmSync(`${__dirname}/../assets/avatars/${req.user.id}.webp`)

            res.status(200).json({
                success: true
            });
        }
    }
];