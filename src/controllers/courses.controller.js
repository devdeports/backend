const json2sql = require("../utils/Json2Sql");
const SqlConnection = require("../utils/SqlConnection");

// models
//const model = require("../models/services");


// list
exports.getCourses = async (filters = {}) => {
    const crsApp = await getCrsBd(filters);

    return {
        status: 200 ,
        success: true,
        message: "courses listed",
        data: crsApp
    };
};

// details
exports.getCourseDetail = async (idCourse = 0) => {
    const crsApp = await getFullCourseDetail(idCourse);
    let field = {};

    if(crsApp.length > 0){
        console.log('crsApp :>> ', crsApp);
        // srvApp.forEach((element, index) => {

        //     if(index < 1) {
        //         field.name = element.Name;
        //         field.description = element.Description;
        //         field.idRegion = element.IdRegion;
        //         field.userId = element.UserId;
        //         field.isActive = element.IsActive;
        //         field.isDeleted = element.IsDeleted;
        //         field.timestamp = element.Timestamp;
        //         field.tags = [{
        //             idSrvCat: element.IdSrvCat,
        //             idTag: element.IdTag,
        //             tag: element.Tag,
        //             observation: element.Observation
        //         }];
        //         field.contents = [{
        //             idSegment: element.IdSegment,
        //             description: element.Description,
        //             order: element.Order,
        //             idCourse: element.IdCourse,
        //             idProduct: element.IdProduct,
        //             idContent: element.IdContent,
        //             isActive: element.CIsActive,
        //             isDeleted: element.CIsDeleted
        //         }];

        //     } else {
        //         const rtag = field.tags.find(row => row.idSrvCat === element.IdSrvCat);
        //         if(rtag == undefined){
        //             field.tags.push({
        //                 idSrvCat: element.IdSrvCat,
        //                 idTag: element.IdTag,
        //                 tag: element.Tag,
        //                 observation: element.Observation
        //             });
        //         }

        //         const rcont = field.contents.find(row => row.idSegment === element.IdSegment);
        //         if(rcont == undefined){
        //             field.contents.push({
        //                 idSegment: element.IdSegment,
        //                 description: element.Description,
        //                 order: element.Order,
        //                 idCourse: element.IdCourse,
        //                 idProduct: element.IdProduct,
        //                 idContent: element.IdContent,
        //                 isActive: element.CIsActive,
        //                 isDeleted: element.CIsDeleted
        //             });
        //         }
        //     }
        // });
    }
    return {
        status: 200 ,
        success: true,
        message: "course listed",
        data: field
    };
};


// get filters
async function getCrsBd(data){
    const columns = {
        "C.IdCourse": true,
        "C.Name": true,
        "C.Description": true,
        "C.IdRegion": true,
        "C.IsActive": true,
        "T.Tag": true,
    };

    const conditions = {
        "C.IdRegion": { $in: data.IdRegion },
        "C.IsDeleted": false,
        "CC.IsActive": 1,
        "(T.IsActive = 1 AND T.IsDeleted = 0)": undefined,
    };

    const join = {
        "CC" : {
            $innerJoin: {
                $table: "CrsCoursesCategory",
                $on: { 'C.IdCourse': { $eq: '~~CC.IdCourse' } }
            }
        },
        "T" : {
            $innerJoin: {
                $table: "SrvCategories",
                $on: { 'CC.IdTag': { $eq: '~~T.IdTag' } }
            }
        }
    };

    const sort = {"C.IdCourse": true };

    const query = json2sql.createSelectQuery("CrsCourses", join, columns, conditions, sort, undefined, undefined);
    query.sql = query.sql.replace("`CrsCourses`", "`CrsCourses` AS `C`");
    query.sql = query.sql.replace(/`/g, '');
    query.sql = query.sql.replace(/  /g, ' ');

    //console.log('query :>> ', query);
    try {
        const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
        return queryResult.results;
    } catch (error) {
        console.log("Error al selecionar el registro.");
        console.error(error);
    }
};


async function getFullCourseDetail(idCourse){
    const columns = {
        "C.*": true,
        "K.*": true,
        "CC.Id": "IdCrsCat",
        "T.IdTag": true,
        "T.Tag": true,
        "T.Observation": true
    };

    const conditions = {
        "C.IdCourse": idCourse,
        "C.IsDeleted": false,
        "CC.IsActive": 1,
        "(K.IsActive = 1 AND K.IsDeleted = 0)": undefined,
        "(T.IsActive = 1 AND T.IsDeleted = 0)": undefined,
    };

    const join = {
        "CC" : {
            $innerJoin: {
                $table: "CrsCoursesCategory",
                $on: { 'C.IdCourse': { $eq: '~~CC.IdCourse' } }
            }
        },
        "T" : {
            $innerJoin: {
                $table: "SrvCategories",
                $on: { 'CC.IdTag': { $eq: '~~T.IdTag' } }
            }
        },
        "K" : {
            $innerJoin: {
                $table: "CrsCoursesTasks",
                $on: { 'C.IdCourse': { $eq: '~~K.IdCourse' } }
            }
        },
    };

    const query = json2sql.createSelectQuery("CrsCourses", join, columns, conditions, undefined, undefined, undefined);
    query.sql = query.sql.replace("`CrsCourses`", "`CrsCourses` AS `C`");
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