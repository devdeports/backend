const json2sql = require("../utils/Json2Sql");
const SqlConnection = require("../utils/SqlConnection");
//const validateToken = require("../utils/validateToken");

const Record = "SysConfig";

exports.getConfig = async () => {
   const conditions = {
      IsDeleted: false
   };

   const columns = {
      "*": true
   };

   const query = json2sql.createSelectQuery("SysConfig", undefined, columns, conditions, undefined, undefined, undefined);

   try {
      const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
      return queryResult.results;

   } catch (error) {
      console.log("Error al selecionar el registro.");
      console.error(error);
   }
};


exports.getData = async () => {
   const conditions = {
      IsDeleted: false
   };

   const columns = {
      "*": true
   };

   const query = json2sql.createSelectQuery(Record, undefined, columns, conditions, undefined, undefined, undefined);

   try {
      const queryResult = await SqlConnection.executeQuery(query.sql, query.values);
      return queryResult.results;

   } catch (error) {
      console.log("Error al selecionar el registro.");
      console.error(error);
   }
};


// ejecuta consulta callback (return bool)
exports.getDosdata = async () => {
   // llamar conexion mysql
   const mySqlConnect = await SqlConnection.mySqlConnect();

   // construir consulta
   const conditions = {IsDeleted: false };
   const columns = { "*": true };
   const query = json2sql.createSelectQuery(Record, undefined, columns, conditions, undefined, undefined, undefined);

   // ejecutar consulta
   mySqlConnect.query(query.sql, query.values, (error, results) => {
      if (error) throw error;

      results.forEach((element) => {
         //console.log(element);

         if(element.Id == 2){
            variable = element.Option;
         } else {
            variable = element.Option;
            bool = true;
         }
      });

      console.log("variable", variable);
   });

   // finaliza conexion
   mySqlConnect.end();
   return true;
};

