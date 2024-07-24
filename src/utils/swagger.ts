import { Express, Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc" 
import swaggerUi from "swagger-ui-express" 
import log from "./logger";

const options:swaggerJsdoc.Options = {
    definition:{
        openapi: "3.0.0",
        info: {
            title: "TEMPLATE CREATION REST API DOCS",
            version: "1.0.0"
        },
        components: {
            
        },
        security: []
    },
    apis: ['./src/routes/*.ts'],
}

const swaggerSpec = swaggerJsdoc(options)

const swaggerDocs = (app:Express, port:number)=>{
    //Swagger Page
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

    //Docs in JSON Format
    app.get("docs.json", (req:Request, res:Response) => {
        res.setHeader("Content-Type", "application/json")
        res.send(swaggerSpec)
    })

    log.info(`Docs available at http://localhost:${port}/docs`)
}

export default swaggerDocs
