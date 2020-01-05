const config = {
    production: {
        SECRET: process.env.SECRET,
        DATABASE: process.env.MONGODB_URI
    },
    default: {
        SECRET: 'password',
        DATABASE: 'mongodb://localhost:27017/salasonline'
    }
}

exports.get = function get(env) {
    return config[env] || config.default;
}



/* Usuarios MP */
/* Vendedor */
/*{
    "id": 444651392,
    "nickname": "TETE6843612",
    "password": "qatest9443",
    "site_status": "active",
    "email": "test_user_18449935@testuser.com"
}*/
/* Comprador */
/*{
    "id":444651527,
    "nickname":"TETE531289",
    "password":"qatest7435",
    "site_status":"active",
    "email":"test_user_72945948@testuser.com"
}*/
