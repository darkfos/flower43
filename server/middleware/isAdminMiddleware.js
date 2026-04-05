const isAdminMiddleware = (req, res, next) => {
    const userData = req.user;
    
    console.log(userData, userData?.role === 'admin');

    if (userData.role === 'admin') {
        return next();
    }

    res.status(400).json({
        message: 'Пользователь не является администратором'
    })
}

module.exports = isAdminMiddleware;