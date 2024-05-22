const json2sql = require("../utils/Json2Sql");
const SqlConnection = require("../utils/SqlConnection");


// models
const model = require("../models/services");

// list srv
exports.getServices = async (filters = {}) => {
    const srvApp = await getSrvBd(filters);

    if(srvApp.length > 0) {
        for(let i = 0; i < srvApp.length; i++){
            const srvTagApp = await getTagServiceBd(srvApp[i].IdService);
            srvApp[i].Category = srvTagApp;
        }
    }

    return {
        status: 200 ,
        success: true,
        message: "services listed",
        data: srvApp
    };
};

// srv details
exports.getServiceDetail = async (idService = 0) => {
    const srvApp = await getFullServiceDetail(idService);
    let field = {};

    if(srvApp.length > 0){
        srvApp.forEach((element, index) => {

            if(index < 1) {
                field.name = element.Name;
                field.description = element.Description;
                field.idRegion = element.IdRegion;
                field.userId = element.UserId;
                field.isActive = element.IsActive;
                field.isDeleted = element.IsDeleted;
                field.timestamp = element.Timestamp;
                field.tags = [{
                    idSrvCat: element.IdSrvCat,
                    idTag: element.IdTag,
                    tag: element.Tag,
                    observation: element.Observation
                }];
                field.contents = [{
                    idSegment: element.IdSegment,
                    description: element.Description,
                    order: element.Order,
                    idCourse: element.IdCourse,
                    idProduct: element.IdProduct,
                    content: element.Content,
                    isActive: element.CIsActive,
                    isDeleted: element.CIsDeleted
                }];

            } else {
                const rtag = field.tags.find(row => row.idSrvCat === element.IdSrvCat);
                if(rtag == undefined){
                    field.tags.push({
                        idSrvCat: element.IdSrvCat,
                        idTag: element.IdTag,
                        tag: element.Tag,
                        observation: element.Observation
                    });
                }

                const rcont = field.contents.find(row => row.idSegment === element.IdSegment);
                if(rcont == undefined){
                    field.contents.push({
                        idSegment: element.IdSegment,
                        description: element.Description,
                        order: element.Order,
                        idCourse: element.IdCourse,
                        idProduct: element.IdProduct,
                        idContent: element.IdContent,
                        isActive: element.CIsActive,
                        isDeleted: element.CIsDeleted
                    });
                }
            }
        });
    }
    return {
        status: 200 ,
        success: true,
        message: "services listed",
        data: field
    };
};

exports.add = async (data = {}) => {
    let newReg = model.service;
    newReg.name = (data.name) ? data.name : "";
    newReg.description = (data.description) ? data.description : "";
    newReg.idRegion = (data.idRegion) ? data.idRegion : 11001;
    newReg.userId = data.userId;

    const srvApp = await addBd(newReg);

    return {
        status: 200 ,
        success: true,
        message: "service saved",
        data: srvApp
    };
};

exports.del = async (id = 0) => {
    const srvApp = await deleteBd({idService: id});

    return {
        status: 200 ,
        success: true,
        message: "service deleted",
        data: srvApp
    };
};


// get services filters
async function getSrvBd(data){
    const columns = { "*": true };

    let conditions = {
        isActive: true,
        isDeleted: false,
        idRegion: {
            $in: data.IdRegion
        }
    };

    if(data.IdService != undefined){
        conditions.idService = data.IdService;
        delete conditions.isActive;
        delete conditions.isDeleted;
    }

    const sort = {"idService": true};
    const query = json2sql.createSelectQuery("SrvServices", undefined, columns, conditions, sort, undefined, undefined);

    try {
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;
    } catch (error) {
        console.log("Error al selecionar el registro.");
        console.error(error);
    }
};

async function getTagServiceBd(idService){
    const columns = {
        "S.*": true,
        "C.Tag": true,
        "C.Observation": true
    };

    const conditions = {
        "S.IdService": idService,
        "S.IsActive": 1,
        "(C.IsActive = 1 AND C.IsDeleted = 0)": undefined
    };

    const join = {
        "C" : {
            $innerJoin: {
                $table: "SrvCategories",
                $on: { 'S.IdTag': { $eq: '~~C.IdTag' } }
            }
        }
    };

    const query = json2sql.createSelectQuery("SrvServicesCategory", join, columns, conditions, undefined, undefined, undefined);
    query.sql = query.sql.replace("`SrvServicesCategory`", "`SrvServicesCategory` AS `S`");
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

async function getFullServiceDetail(idService){
    const columns = {
        "S.*": true,
        "SC.Id": "IdSrvCat",
        "T.IdTag": true,
        "T.Tag": true,
        "T.Observation": true,
        "C.Id": "IdSegment",
        "C.Description": true,
        "C.Order": true,
        "C.IdCourse": true,
        "C.IdProduct": true,
        "C.Content": true,
        "C.IsActive": "CIsActive",
        "C.IsDeleted": "CIsDeleted"
    };

    const conditions = {
        "S.IdService": idService,
        "S.IsActive": 1,
        "C.IsDeleted": 0,
        "SC.IsActive": 1,
        "(T.IsActive = 1 AND T.IsDeleted = 0)": undefined,
    };

    const join = {
        "SC" : {
            $innerJoin: {
                $table: "SrvServicesCategory",
                $on: { 'S.IdService': { $eq: '~~SC.IdService' } }
            }
        },
        "T" : {
            $innerJoin: {
                $table: "SrvCategories",
                $on: { 'SC.IdTag': { $eq: '~~T.IdTag' } }
            }
        },
        "C" : {
            $innerJoin: {
                $table: "SrvServicesContent",
                $on: { 'S.IdService': { $eq: '~~C.IdService' } }
            }
        },
    };

    const sort = {"C.Order": true };

    const query = json2sql.createSelectQuery("SrvServices", join, columns, conditions, sort, undefined, undefined);
    query.sql = query.sql.replace("`SrvServices`", "`SrvServices` AS `S`");
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

async function addBd(data){
    try {
        const query = json2sql.createInsertQuery("SrvServices", data);
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;

    } catch (error) {
        throw error;
    }
};

async function deleteBd(data){
    try {
        const inactive = { isActive: 0, isDeleted: 1 };

        const query = json2sql.createUpdateQuery("SrvServices", inactive, data);
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;

    } catch (error) {
        throw error;
    }
};

// ====================

exports.getServiceContent = async (idService = 0) => {
    const srvApp = await getContent(idService);

    return {
        status: 200 ,
        success: true,
        message: "service content listed",
        data: srvApp
    };
};

exports.addServiceContent = async (data = {}) => {
    data.isActive = 1;
    data.isDeleted = 0;
    delete data.userId;

    const srvApp = await addContent(data);

    return {
        status: 200 ,
        success: true,
        message: "service content saved",
        data: srvApp
    };
};

exports.deleteServiceContent = async (id = 0) => {
    const srvApp = await deleteContentBd({id: id});

    return {
        status: 200 ,
        success: true,
        message: "service content deleted",
        data: srvApp
    };
};

async function getContent(idService){
    const query = `SELECT S.*, C.Name AS CName, C.Description AS CDescription, C.Objectives AS CObjectives,
        C.Banner AS CBanner, C.Level AS CLevel, P.Name AS PName, P.Description AS PDescription,
        P.Link AS PLink
        FROM SrvServicesContent S
        LEFT JOIN 
            CrsCourses C
        ON 
            S.IdCourse > 0 AND S.IdCourse = C.IdCourse AND C.IsActive = 1
        LEFT JOIN 
            PrdProducts P 
        ON 
            S.IdProduct > 0 AND S.IdProduct = P.IdProduct AND P.IsActive = 1
        WHERE S.IdService = ?
        AND S.IsActive = 1
        AND S.IsDeleted = 0
        ORDER BY S.Order ASC`;

    const values = [idService];

    try {
        const queryResult = await SqlConnection.executeQuery(query, values);
        return queryResult.results;
    } catch (error) {
        console.log("Error al selecionar el registro.");
        console.error(error);
    }
};

async function addContent(data){
    try {
        const query = json2sql.createInsertQuery("SrvServicesContent", data);
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;

    } catch (error) {
        throw error;
    }
};

async function deleteContentBd(data){
    try {
        const inactive = { isActive: 0, isDeleted: 1 };

        const query = json2sql.createUpdateQuery("SrvServicesContent", inactive, data);
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;

    } catch (error) {
        throw error;
    }
};

// ====================

// list tags
exports.getTags = async (filters = {}) => {
    const tagApp = await getTagBd(filters);

    return {
        status: 200 ,
        success: true,
        message: "tags listed",
        data: tagApp
    };
};

// add tag
exports.addTag = async (data) => {
    delete data.userId;
    const newTag = { ...model.categories, ...data };
    const tagApp = await addTagBd(newTag);

    return {
        status: 200 ,
        success: true,
        message: "tag created",
        data: tagApp
    };
};

// del tag
exports.delTag = async (id = 0) => {
    const tagApp = await delTagBd(id);

    return {
        status: 200,
        success: true,
        message: "delete tag successfully.",
        data: tagApp
    };
};


// get tag filters
async function getTagBd(data){
    const columns = {
        "IdTag": true,
        "Tag": true,
        "Observation": true
    };

    let conditions = { isActive: true };

    if(data["idTag"] != undefined){
        conditions.idTag = data["idTag"];
    }

    const sort = {"Tag": true};

    const query = json2sql.createSelectQuery("SrvCategories", undefined, columns, conditions, sort, undefined, undefined);

    try {
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;
    } catch (error) {
        console.log("Error al selecionar el registro.");
        console.error(error);
    }
};

// insert new tag
async function addTagBd(data){
    try {
        const query = json2sql.createInsertQuery("SrvCategories", data);
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;

    } catch (error) {
        throw error;
    }
};

// delete tag
async function delTagBd(id = 0){
    const conditions = { idTag: id };
    try {
        const query = json2sql.createDeleteQuery("SrvCategories", conditions);
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;

    } catch (error) {
        throw error;
    }
};


//return { status: 200 , success: true, message: "message", data: [] };