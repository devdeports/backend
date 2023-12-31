const mysql = require("mysql");

const getConnection = async () => {
    const connection = mysql.createConnection({
        host     : process.env.DATABASE_SERVER,
        user     : process.env.DATABASE_USER,
        password : process.env.DATABASE_PASSWORD,
        database : process.env.DATABASE_NAME
    });

    connection.connect((err) => {
        if(err) { console.log("Error Connection: ", err); return; }
    });

    return connection;
};

exports.executeQuery = async (sql, values) => {
    try {
        const connection = await getConnection();

        const resultEntity = await new Promise((resolve, reject) => {
            connection.query(sql, values, (err, results) => {
                if(err) {
                    return reject(err);
                } else {
                    const data = {
                        results: results,
                        rowCount: results.length,
                        affectedRows: results.affectedRows,
                        changedRows: results.changedRows,
                        insertId: results.insertId
                    };
                    return resolve(data);
                }
            });
            connection.end();
        });

        return resultEntity;

    } catch (err) {
        console.error('SQL error', err);
        return false;
    }
};

exports.mySqlConnect = async () => {
    try {
        return connection = await getConnection();
    } catch (err) {
        console.error('SQL error', err);
        return false;
    }
};
