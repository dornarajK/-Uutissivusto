
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'musikot76',
  database: 'uutissivusto'
});

const promisePool = pool.promise();

module.exports = promisePool;
