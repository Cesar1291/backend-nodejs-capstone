// db.js
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;

// La URL se construye usando las variables de entorno para mayor seguridad
let url = `${process.env.MONGO_URL}`;

let dbInstance = null;
const dbName = `${process.env.MONGO_DB}`;

async function connectToDatabase() {
    if (dbInstance){
        return dbInstance;
    };

    const client = new MongoClient(url);      

    try {
        // Tarea 1: Conectar a MongoDB
        await client.connect();
        console.log("Conectado exitosamente al servidor de MongoDB");

        // Tarea 2: Conectar a la base de datos y guardarla en dbInstance
        // Usamos la constante dbName que ya definiste arriba
        dbInstance = client.db(dbName);

        // Tarea 3: Retornar la instancia de la base de datos
        return dbInstance;

    } catch (e) {
        console.error("Error al conectar a la base de datos:", e);
        throw e;
    }
}

module.exports = connectToDatabase;
