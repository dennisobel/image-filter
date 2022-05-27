import express from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';
import { fsyncSync } from 'fs';
import fs from "fs";
import path from "path"

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get(`/filteredimage/`, async (req: express.Request, res: express.Response) => {
    const { image_url } = req.query;
    function urlCheck(str: string) {
      var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
      return !!pattern.test(str);
    }

    if (urlCheck(image_url) == true) {
      const response: string = await filterImageFromURL(image_url);
      res.status(200).sendFile(response, {}, function (error) {
        if (error) {
          res.status(500).send({ message: "file request failed" });
        }
        else {
          deleteLocalFiles([response]);
        }
      })
    } else {
      res.status(400).send("Invalid URL")
    }
  })

  app.get("/", async (req, res) => {
    res.status(200).send("try GET /filteredimage?image_url={{}}")
  });


  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();