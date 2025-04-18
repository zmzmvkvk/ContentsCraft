const dotenv = require("dotenv");
dotenv.config(); // ✅ 반드시 제일 먼저 호출되어야 함!

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const crawlRouter = require("./routes/crawl");
const analyzeRouter = require("./routes/analyze");
const topChannels = require("./routes/topChannels");
const downloadRouter = require("./routes/download");
const resourceRoute = require("./routes/resource");
const notionRouter = require("./routes/notion");
const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());
app.use("/api/crawl", crawlRouter);
app.use("/api/analyze", analyzeRouter);
app.use("/api/top-channels", topChannels);
app.use("/api/download", downloadRouter);
app.use("/api/resource", resourceRoute);
app.use("/api/notion", notionRouter);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
