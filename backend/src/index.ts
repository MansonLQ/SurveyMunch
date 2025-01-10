import express, { Request, Response } from "express";
import main from "./routes/main.routes.js";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("views/home");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(main);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
