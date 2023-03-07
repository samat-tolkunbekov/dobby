const mysql = require('mysql');

const A_PRODUCT_ID = 1;
const B_PRODUCT_ID = 2;
const C_PRODUCT_ID = 3;
const D_PRODUCT_ID = 4;
const E_PRODUCT_ID = 5;
const NAMES_LIST = ['nameA', 'nameB', 'nameC', 'nameD', 'nameE'];
const QUERIES = [];
const DATABASE = {
    HOST: '127.0.0.1',
    USER: 'user',
    PASSWORD: 'password',
    PORT: 3306,
    NAME: `database`,
};

function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

function prepareQueries(name, dbData) {
    let disabledProducts = {};
    let updatedProducts = [];
    let enabledProducts = {
        ...dbData.productsC,
        ...dbData.productsB,
        ...dbData.productsA,
    };

    if (dbData.isCBackedUp) {
        dbData.name.isCBackedUp = 'C BACKED-UP';
    }

    let areSettingsDisabled = [];

    for (const service in dbData.productsC) {
        dbData.productsC[service] && areSettingsDisabled.push(service);
    }

    if (areSettingsDisabled.length === 0) {
        console.log('----- ALL C PRODUCTS DISABLED ------');

        dbData.name.status = 'ALL C PRODUCTS DISABLED'; 
    }

    console.log('\n')
    console.log('----- ALL PRODUCTS -----');
    console.log(enabledProducts);

    for (const service in enabledProducts) {
        if (!enabledProducts[service]) {
            disabledProducts[service] = enabledProducts[service];

            delete enabledProducts[service];
        }
    }

    console.log('----- DISABLED PRODUCTS -----');
    console.log(disabledProducts);
    console.log(Object.keys(disabledProducts));

    dbData.name.stored = dbData.productsD;

    let productsD = dbData.productsD.filter(service => {
        return !(service in disabledProducts);
    });

    console.log('----- UPDATED PRODUCTS -----');
    console.log(updatedProducts);

    if (dbData.isDBackedUp) {
        dbData.name.hitChecker = true;

        enabledProducts['57'] = true;
    }

    enabledProducts = Object.keys(enabledProducts)
        .filter(service => {
            return !productsD.includes(Number(service)) && !productsD.includes(service);
        })
        .map(item => {
            return Number(item);
        });

    console.log('----- ENABLED FILTERED PRODUCTS -----');
    console.log(enabledProducts);
    console.log('----- STORED PRODUCTS -----');
    console.log(productsD);

    dbData.name.storedFiltered = productsD;
    dbData.name.enabledProducts = enabledProducts;

    updatedProducts.push(...productsD);
    updatedProducts.push(...enabledProducts);

    console.log('----- UPDATED PRODUCTS -----');
    console.log(updatedProducts);

    let filter = [];

    updatedProducts = updatedProducts.filter(item => {
        if (!filter.includes(item)) {
            filter.push(item);

            return true;
        }
    });

    console.log('----- UPDATED FILTERED SERVICES -----');
    console.log(updatedProducts);

    QUERIES.push(
        `UPDATE
            other_${name}.columnA,
            other.columnA
        SET 
            other_${name}.columnA.services = '${JSON.stringify(updatedProducts)}',
            other.columnA.services = '${JSON.stringify(updatedProducts)}'
        WHERE
            other_${name}.columnA.id = other.columnA.id`
    );
    QUERIES.push(dbData.name);

    console.log('\n')
    console.log('----- QUERIES PRODUCTS -----');
    console.log(QUERIES);
}

async function getFProducts(name, dbData) {
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
                condition = '${name}'
        `)
        .on('result', async ({ columnA, columnB }) => {
            const data = JSON.parse(columnA || '{}');

            dbData.productsD = data;
            dbData.name.productsD = columnB;

            prepareQueries(name, dbData);
        })
        .on('end', async () => {
            connectionPool.end();

            sleep(50);
        })
        .on('error', (error) => console.log(error));
}

async function getEProducts(name, dbData) {
    console.log('------- NO E PRODUCTS FOUND -------');

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
                tableName = 'tableName'
                AND columnB LIKE '%server-data-a%' 
                AND columnB LIKE '%server-data-b%'
                AND columnA LIKE '%"name":"${name}"%'
                AND columnA LIKE '%"server-data-c"%'
            ORDER BY
                id DESC
            LIMIT
                1
        `)
        .on('result', async ({ columnA, columnB }) => {
            const data = JSON.parse(columnA || '{}');
            const logs = JSON.parse(columnB || '{}');

            let services = data.services;
            let products = data.products;

            services[D_PRODUCT_ID] = products[E_PRODUCT_ID];

            dbData.productsC = services;
            dbData.name.productsC = logs.name;
            dbData.isCBackedUp = true;

            console.log('----- E SERVICES BACK-UP -----');
            console.log(logs.name);
            console.log(dbData.productsC);
            console.log('----- E PROUDCTS BACK-UP -----');
            console.log(products);
        })
        .on('end', async () => {
            connectionPool.end();

            sleep(50);

            getFProducts(name, dbData);
        })
        .on('error', (error) => console.log(error));
}

async function getDProducts(name, dbData) {
    const connectionPool = mysql.createPool({
        host: DATABASE.HOST,
        port: DATABASE.PORT,
        user: DATABASE.USER,
        password: DATABASE.PASSWORD,
        database: `other_` + DATABASE.NAME,
    });

    connectionPool
        .query(`
            SELECT 
                columnA, columnB, columnC
            FROM 
                table
            WHERE
                name = 'checkName'
        `)
        .on('result', async ({ columnA, columnB, columnC }) => {
            const data = JSON.parse(columnA || '{}');

            dbData.isDBackedUp = Boolean(data) ?? false;

            console.log('----- D PRODUCTS STATUS -----');
            console.log(`${columnA} is ${columnB} detail: ${columnC}`);
        })
        .on('end', async () => {
            connectionPool.end();

            sleep(50);

            Object.keys(dbData.productsC).length === 0
                ? getEProducts(name, dbData)
                : getFProducts(name, dbData);
        })
        .on('error', (error) => console.log(error));
}

async function getCProducts(name, dbData) {
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
                userActivityLogs
            WHERE
                tableName = 'tableName'
                AND columnA LIKE '%server-data-a%' 
                AND columnA LIKE '%server-data-b%'
                AND columnB LIKE '%"name":"${name}"%'
            ORDER BY
                id DESC
            LIMIT
                1
        `)
        .on('result', async ({ columnA, columnB }) => {
            const data = JSON.parse(columnA || '{}');
            const logs = JSON.parse(columnB || '{}');
            const products = data.products;

            let services = data.services;

            services[D_PRODUCT_ID] = products[E_PRODUCT_ID];

            dbData.productsC = services;
            dbData.name.productsC = logs.name;

            console.log('----- C SERVICES -----');
            console.log(logs.name);
            console.log(dbData.productsC);
            console.log('----- C PRODUCTS -----');
            console.log(products);
        })
        .on('end', async () => {
            connectionPool.end();

            sleep(50);

            getDProducts(name, dbData);
        })
        .on('error', (error) => console.log(error));
}

async function getBProducts(name, dbData) {
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
                tableName = 'tableName'
                AND columnA LIKE '%server-data-a%' 
                AND columnA LIKE '%server-data-b%'
                AND columnB LIKE '%"name":"${name}"%'
            ORDER BY
                id DESC
            LIMIT
                1
        `)
        .on('result', async ({ columnA, columnB }) => {
            const data = JSON.parse(columnA || '{}');
            const logs = JSON.parse(columnB || '{}');
            const productsB = data.productsB ?? {};

            productsB[B_PRODUCT_ID] = data.productsB?.productsBProducts ?? false;
            productsB[C_PRODUCT_ID] = data.productsBDashboard ?? false;

            dbData.productsB = productsB;
            dbData.name.productsB = logs.name;

            console.log('----- B PRODUCTS -----');
            console.log(logs.name);
            console.log(dbData.productsB);
        })
        .on('end', async () => {
            connectionPool.end();

            sleep(50);

            getCProducts(name, dbData);
        })
        .on('error', (error) => console.log(error)); 
}

async function getAProducts(name, dbData) {
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
                tableName = 'tableName'
                AND columnA LIKE '%server-data-a%'
                AND columnB LIKE '%"name":"${name}"%'
            ORDER BY
                id DESC
            LIMIT
                1
        `)
        .on('result', async ({ columnA, columnB }) => {
            const data = JSON.parse(columnA || '{}');
            const logs = JSON.parse(columnB || '{}');

            if (data.productAStatus !== undefined) {
                dbData.productsA[A_PRODUCT_ID] = data.productAStatus;
            }

            dbData.name.account = logs.name;

            console.log('----- A PRODUCTS -----');
            console.log(logs.name);
            console.log(dbData.productsA);
        })
        .on('end', async () => {
            connectionPool.end();

            sleep(50);

            getBProducts(name, dbData);
        })
        .on('error', (error) => console.log(error));
}

async function extractData(names) {
    console.log('\n\n')
    console.log('EXTRACTIONS STARTED');
    
    for (const name of names) {
        const dbData = {
            productsA: {},
            productsB: {},
            productsC: {},
            productsD: {},
            name: {},
            isCBackedUp: false,
            isDBackedUp: false,
        };

        getAProducts(name, dbData);
    }
}

extractData(NAMES_LIST);