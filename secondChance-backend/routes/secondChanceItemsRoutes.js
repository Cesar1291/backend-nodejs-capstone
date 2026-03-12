const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');

const directoryPath = 'public/images';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directoryPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Get all secondChanceItems
router.get('/', async (req, res, next) => {
    logger.info('/ called');
    try {
        // Tarea: Conectar a la base de datos
        const db = await connectToDatabase();

        const collection = db.collection("secondChanceItems");
        const secondChanceItems = await collection.find({}).toArray();
        res.json(secondChanceItems);
    } catch (e) {
        logger.error('oops something went wrong', e);
        next(e);
    }
});

// Add a new item
// Task 6: Se añade el middleware 'upload.single' para manejar la imagen
router.post('/', upload.single('file'), async(req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");
        
        // Creamos el objeto del item desde el cuerpo de la petición
        let secondChanceItem = req.body;

        // Task 4: Agregar la fecha actual y la ruta de la imagen
        secondChanceItem.date_added = Math.floor(new Date().getTime() / 1000);
        if (req.file) {
            secondChanceItem.image = `/images/${req.file.filename}`;
        }

        const result = await collection.insertOne(secondChanceItem);
        res.status(201).json(result.ops ? result.ops[0] : result);
    } catch (e) {
        next(e);
    }
});

// Get a single secondChanceItem by ID
router.get('/:id', async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");
        const id = req.params.id;

        const secondChanceItem = await collection.findOne({ id: id });

        if (!secondChanceItem) {
            return res.status(404).send("Item not found");
        }

        res.json(secondChanceItem);
    } catch (e) {
        next(e);
    }
});

// Update an existing item
router.put('/:id', async(req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");
        const id = req.params.id;

        const secondChanceItem = await collection.findOne({ id: id });
        if (!secondChanceItem) {
            return res.status(404).send("Item not found");
        }

        // Actualizamos los campos
        secondChanceItem.category = req.body.category;
        secondChanceItem.condition = req.body.condition;
        secondChanceItem.age_days = req.body.age_days;
        secondChanceItem.description = req.body.description;
        secondChanceItem.age_years = Number((secondChanceItem.age_days / 365).toFixed(2));
        secondChanceItem.updatedAt = new Date();

        const updateResult = await collection.findOneAndUpdate(
            { id: id },
            { $set: secondChanceItem },
            { returnDocument: 'after' }
        );

        res.json({ message: "Upload success" });
    } catch (e) {
        next(e);
    }
});

// Delete an existing item
router.delete('/:id', async(req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");
        const id = req.params.id;

        const result = await collection.deleteOne({ id: id });

        if (result.deletedCount === 0) {
            return res.status(404).send("Item not found");
        }

        res.json({ message: "deleted" });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
