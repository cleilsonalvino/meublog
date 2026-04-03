function userIsAdmin(user) {
    if (!user || typeof user !== "object") {
        return false
    }
    const flag = user.eAdmin ?? user.Eadmin
    return Number(flag) === 1
}

module.exports = {
    userIsAdmin,

    eAdmin: function (req, res, next) {
        if (req.isAuthenticated() && userIsAdmin(req.user)) {
            return next()
        }

        req.flash("error_msg", "Você precisa ser admin para acessar")
        res.redirect("/")
    },
}
