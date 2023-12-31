const moment = require("moment-timezone");
const jwt = require('jsonwebtoken');
const CryptoJS = require("crypto-js");

const json2sql = require("../utils/Json2Sql");
const SqlConnection = require("../utils/SqlConnection");
const configFile = require("../config-apps.json");

const Users = "Users";

// Generate token
exports.getToken = async (info) => {
    let message = "access granted";

    // config file
    const configApp = configFile.default;
    info.timezone = configApp.timeZone;

    const userApp = await getUserApp(info);
    if (userApp === false) return {
        status: 401,
        success: false,
        message: "invalid data",
        token: {}
    };

    const data = {
        userApp,
        timeZone: info.timezone,
        iss: "auth-ok"
    };

    // generate Token
    const token = jwt.sign(data, "PUBLIC", { algorithm: 'HS256' });

    return {
        status: 200 ,
        success: true,
        message,
        token
    };
};


// Check token - return decode
exports.checkToken = async (token, decode = true) => {
    try {
        // check Token
        const decoded = jwt.verify(token, "PUBLIC");
        
        return (decode === true) 
        ? { status: 200, success: true, message: "token ok!", token: decoded }
        : { status: 200, success: true, message: "token ok!", token: {} };

    } catch(err) {
        return res.status(401).json({ 
            success: false,
            message: "error checking token",
            description: `${err.name} - ${err.message}`
        });
    }
};


// Construct User Data
async function getUserApp(data){
    let userApp = {};
    let userBd = [];

    if(data === null) {
        userApp = {
            id: "myId",
            firstName: "firstName",
            lastName: "lastName",
            region: configFile.default.city,
            phoneNumber: "310XXXXXXX",
            email: "xxxxx@correo.com",
            alias: "Customer",
            rol: 0
        };

    } else {
        // auth user - client
        userBd = await getUserBd(data);

        if (userBd.length === 0) return false;

        userBd = userBd[0];

        const prePass = CryptoJS.AES.decrypt(userBd.MyPassword.toString(), configFile.cryptoKey);
        const MyPass = prePass.toString(CryptoJS.enc.Utf8);
        if (data.password.trim() != MyPass.trim()) return false;

        userApp = {
            id: userBd.IdUser.toString(),
            firstName: userBd.FirstName,
            lastName: userBd.LastName,
            region: userBd.IdRegion,
            phoneNumber: userBd.PhoneNumber,
            email: userBd.Email,
            alias: userBd.Alias,
            rol: userBd.IdRole
        };
    }
    return userApp;
};


// obtener datos de usuario - authenticate
async function getUserBd(data){
    const columns = {
        "U.*": true,
        "R.IdRole": true,
        "P.MyPassword": true
    };

    const conditions = {
        "U.IdUser": data.username,
        "(U.IsActive = 1 AND U.IsDeleted = 0)": undefined,
        "(R.IsActive = 1 AND R.IsDeleted = 0)": undefined,
        "(P.IsActive = 1 AND P.IsDeleted = 0)": undefined
    };

    const join = {
        "R" : {
            $innerJoin: {
                $table: "UsersRole",
                $on: { 'U.IdUser': { $eq: '~~R.IdUser' } }
            }
        },
        "P" : {
            $innerJoin: {
                $table: "UsersPassword",
                $on: { 'U.IdUser': { $eq: '~~P.IdUser' } }
            }
        }
    };

    const query = json2sql.createSelectQuery(Users, join, columns, conditions, undefined, undefined, undefined);
    query.sql = query.sql.replace("`Users`", "`Users` AS `U`");
    query.sql = query.sql.replace(/`/g, '');
    query.sql = query.sql.replace(/  /g, ' ');

    try {
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;
    } catch (error) {
        console.log("Error al selecionar el registro.");
        console.error(error);
    }
};


//return { status: 200 , success: true, "message": "message", "token": "123" };
