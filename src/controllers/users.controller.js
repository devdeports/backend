const CryptoJS = require("crypto-js");
const json2sql = require("../utils/Json2Sql");
const SqlConnection = require("../utils/SqlConnection");
const configFile = require("../config-apps.json");

// models
const model = require("../models/users");

// Create user
exports.addUser = async (data) => {
    const newUser = { ...model.user, ...data };
    const userApp = await addUserApp(newUser);

    return {
        status: 200 ,
        success: true,
        message: "user created",
        data: userApp
    };
};

// Create pass user
exports.addPassword = async (user, pass) => {
    await removePassword(user)
    await assignPassword({ user, pass });

    return {
        success: true,
        message: "User password create successfully."
    };
};

// Create rol user
exports.addRol = async (user, rol) => {
    await assignRol({ user, rol });

    return {
        success: true,
        message: "User rol create successfully."
    };
};

// Edit user
exports.editUser = async (data) => {
    const conditions = { "id": data.id };
    delete data.id;
    delete data.userId;

    const userApp = await editUserApp(data, conditions);

    return {
        status: 200 ,
        success: true,
        message: "user edited",
        data: userApp
    };
};

// List users
exports.getUsers = async (filters = {}) => {
    const userApp = await getUserBd(filters);

    return {
        status: 200 ,
        success: true,
        message: "users listed",
        data: userApp
    };
};

// insert new user
async function addUserApp(data){
    try {
        const query = json2sql.createInsertQuery("Users", data);
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;

    } catch (error) {
        throw error;
    }
};

// assign password
async function assignPassword(data){
    try {
        const info = {
            idUser: data.user,
            myPassword: CryptoJS.AES.encrypt(data.pass.toString(), configFile.cryptoKey).toString(),
        };

        const query = json2sql.createInsertQuery("UsersPassword", info);
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;

    } catch (error) {
        throw error;
    }
};

// remove password
async function removePassword(data){
    try {
        const query = json2sql.createDeleteQuery("UsersPassword", { IdUser: data, IsActive: 1 });
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;

    } catch (error) {
        throw error;
    }
};

// assign rol
async function assignRol(data){
    try {
        const info = {
			idRole: data.rol,
			idUser: data.user,
			comment: "New User",
			isActive: 1
        };

        const query = json2sql.createInsertQuery("UsersRole", info);
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;

    } catch (error) {
        throw error;
    }
};

// edit user
async function editUserApp(values, conditions){
    try {
        const query = json2sql.createUpdateQuery("Users", values, conditions);
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;

    } catch (error) {
        throw error;
    }
};

// get users filters
async function getUserBd(data){
    const columns = {
        "U.*": true,
        "R.IdRole": true
    };

    const rols = { "(R.IsActive = 1 AND R.IsDeleted = 0)": undefined };
    const conditions = {...data, ...rols};

    const join = {
        "R" : {
            $innerJoin: {
                $table: "UsersRole",
                $on: { 'U.IdUser': { $eq: '~~R.IdUser' } }
            }
        }
    };

    const query = json2sql.createSelectQuery("Users", join, columns, conditions, undefined, undefined, undefined);
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


//return { status: 200 , success: true, message: "message", data: [] };