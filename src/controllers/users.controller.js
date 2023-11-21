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

// list users
exports.getUsers = async (filters = {}) => {
    const userApp = await getUserBd(filters);

    return {
        status: 200 ,
        success: true,
        message: "users listed",
        data: userApp
    };
};

// list rols
exports.getRols = async (filters = {}) => {
    const roleApp = await getRolsBd(filters);

    return {
        status: 200 ,
        success: true,
        message: "rols listed",
        data: roleApp
    };
};

// list rols items
exports.getRolItems = async (idRole = 0) => {
    const roleApp = await getRolsItemsBd(idRole);

    return {
        status: 200 ,
        success: true,
        message: "rols items listed",
        data: roleApp
    };
};

exports.getMenus = async () => {
    const menuApp = await getMenusBd();

    return {
        status: 200 ,
        success: true,
        message: "menus items listed",
        data: menuApp
    };
};

// create rols
exports.addRols = async (rol) => {
    const roleApp = await addRoleApp({
        role: rol,
        isActive: 1,
        isDeleted: 0
    });

    return {
        status: 200,
        success: true,
        message: "Role create successfully.",
        data: roleApp
    };
};

exports.addRolItems = async (data) => {
    const roleApp = await addRoleItemApp({
        idRole: data.idRole,
        idMenu: data.idMenu,
        isActive: 1,
        isDeleted: 0
    });

    return {
        status: 200,
        success: true,
        message: "Role item create successfully.",
        data: roleApp
    };
};

exports.delRolItems = async (id = 0) => {
    const roleApp = await delRoleItemApp(id);

    return {
        status: 200,
        success: true,
        message: "Role item create successfully.",
        data: roleApp
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


// get rols filters
async function getRolsBd(data){
    const columns = { "*": true };
    const status = { isActive: 1, isDeleted: 0 };
    const conditions = {...data, ...status};
    const query = json2sql.createSelectQuery("SysRole", undefined, columns, conditions, undefined, undefined, undefined);

    try {
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;
    } catch (error) {
        console.log("Error al selecionar el registro.");
        console.error(error);
    }
};

async function getRolsItemsBd(idRole){
    const columns = {
        "M.*": true,
        "R.IdItem": true,
        "R.IdRole": true,
        "R.IsActive": "rolActive"
    };

    const conditions = {
        "R.IdRole": idRole,
        "(R.IsActive = 1 AND R.IsDeleted = 0)": undefined,
        "(M.IsActive = 1 AND M.IsDeleted = 0)": undefined
    };

    const join = {
        "M" : {
            $innerJoin: {
                $table: "SysMenu",
                $on: { 'R.IdMenu': { $eq: '~~M.IdMenu' } }
            }
        }
    };

    const query = json2sql.createSelectQuery("SysRoleItems", join, columns, conditions, undefined, undefined, undefined);
    query.sql = query.sql.replace("`SysRoleItems`", "`SysRoleItems` AS `R`");
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

async function getMenusBd(){
    const columns = { "*": true };
    const conditions = { isActive: 1, isDeleted: 0 };
    const query = json2sql.createSelectQuery("SysMenu", undefined, columns, conditions, undefined, undefined, undefined);

    try {
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;
    } catch (error) {
        console.log("Error al selecionar el registro.");
        console.error(error);
    }
};


// insert new role
async function addRoleApp(data){
    try {
        const query = json2sql.createInsertQuery("SysRole", data);
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;

    } catch (error) {
        throw error;
    }
};

async function addRoleItemApp(data){
    try {
        const query = json2sql.createInsertQuery("SysRoleItems", data);
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;

    } catch (error) {
        throw error;
    }
};

async function delRoleItemApp(idItem){
    const conditions = { idItem };
    try {
        const query = json2sql.createDeleteQuery("SysRoleItems", conditions);
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;

    } catch (error) {
        throw error;
    }
};

//return { status: 200 , success: true, message: "message", data: [] };