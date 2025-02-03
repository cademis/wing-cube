import express from "express";

const apiRouter = express.Router();

apiRouter.get("/", async (req, res) => { res.json({ hello: "world" }) });

apiRouter.post("/", (req, res) => {
    const { name, location } = req.body;
    res.status(200).send({
        message: `YOUR KEYS WERE ${name},${location}`
    })
})

apiRouter.get("/setup", () => {

})

export { apiRouter };
