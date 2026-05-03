import mysql from 'mysql2/promise';

let connection;

export const connectMySQL = async () => {
  if (!connection) {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'movie_ticket',     // your MySQL username
      password: 'gagan@000777', // your MySQL password
      database: 'useApp'        // your database name
    });
    console.log('MySQL connected');
  }
  return connection;
};
