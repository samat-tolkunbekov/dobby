const mysql = require('mysql');

const A_PRODUCT_ID = 1;
const B_PRODUCT_ID = 2;
const C_PRODUCT_ID = 3;
const D_PRODUCT_ID = 4;
const DATABASE = {
    HOST: '127.0.0.1',
    USER: 'user',
    PASSWORD: 'password',
    PORT: 3306,
    NAME: `database`,
};
const COMPARISON_LIST = ['compareA', 'compareB', 'compareC', 'compareD'];
const DB_LIST = [];
const SERVICES_LIST = [];

function compareData() {
    const connectionPool = mysql.createPool({
        host: DATABASE.HOST,
        port: DATABASE.PORT,
        user: DATABASE.USER,
        password: DATABASE.PASSWORD,
        database: DATABASE.NAME,
    });

    connectionPool
        .query(`
            SELECT 
                columnA, columnB
            FROM 
                table 
            WHERE 
                columnA NOT LIKE '%,${A_PRODUCT_ID},%' 
                AND columnA NOT LIKE '%${A_PRODUCT_ID},%' 
                AND columnA NOT LIKE '%,${A_PRODUCT_ID}%' 
                AND columnA NOT LIKE '%,${B_PRODUCT_ID},%' 
                AND columnA NOT LIKE '%${B_PRODUCT_ID},%' 
                AND columnA NOT LIKE '%,${B_PRODUCT_ID}%' 
                AND columnA NOT LIKE '%,${C_PRODUCT_ID},%' 
                AND columnA NOT LIKE '%${C_PRODUCT_ID},%' 
                AND columnA NOT LIKE '%,${C_PRODUCT_ID}%' 
                AND columnA NOT LIKE '%,${D_PRODUCT_ID},%' 
                AND columnA NOT LIKE '%${D_PRODUCT_ID},%' 
                AND columnA NOT LIKE '%,${D_PRODUCT_ID}%'     
        `)
        .on('result', async ({ columnA, columnB }) => {
            if (COMPARISON_LIST.includes(columnA)) {
                DB_LIST.push(columnA);
                SERVICES_LIST.push([columnA, columnB]);
            }
        })
        .on('end', async () => {
            connectionPool.end();

            console.log('----- QUERY FINISHED -----');
            console.log(JSON.stringify(DB_LIST));
            console.log(DB_LIST.length);
            console.log(SERVICES_LIST);
        })
        .on('error', (error) => console.log(error))
}

compareData();