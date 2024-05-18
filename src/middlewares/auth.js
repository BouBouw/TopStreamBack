module.exports = async function(req){
    req.user = null;

    if(!Object.keys(req.headers).includes("authorization") || req.headers.authorization.split(" ").length != 2)
        return;

    const decodedToken = this.jsonToken.verify(req.headers.authorization.split(" ")[1]);
    if(decodedToken == null || decodedToken.expireTimestamp < Date.now())
        return;

    const results = await this.mysql.query("SELECT id, email, resetId, accessLevel, createdTimestamp FROM users WHERE id = ?", [decodedToken.id]);
    if(results.length == 1 && decodedToken.resetId == results[0].resetId)
        req.user = results[0];
};