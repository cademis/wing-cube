import express from "express";
import { pool } from "src/db";

const apiRouter = express.Router();

apiRouter.get("/", async (_, res) => {
    try {
        const { rows } = await pool.query("select * from schools");
        res.status(200).send({ rows });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

apiRouter.post("/", async (req, res) => {
    const { name, location } = req.body;
    try {
        await pool.query(`insert into schools(name, address) values($1,$2);`, [name, location])
        res.status(200).send({ message: "successfull added child" })
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

apiRouter.get("/setup", async (req, res) => {
    try {
        await pool.query('create table schools(id serial primary key, name varchar(255), address varchar(255));')
        res.status(200).send({ message: "successfully added table" })
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

export { apiRouter };
