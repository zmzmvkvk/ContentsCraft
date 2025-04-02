const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const crawlRouter = require("./routes/crawl");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());
app.use("/api/crawl", crawlRouter);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
