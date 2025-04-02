const puppeteer = require("puppeteer");

module.exports = async function crawlYouTube(keyword) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  console.log(`🔍 YouTube에서 키워드 "${keyword}" 검색 중...`);

  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    keyword
  )}`;
  await page.goto(url, { waitUntil: "domcontentloaded" });

  const videos = await page.evaluate(() => {
    const items = Array.from(
      document.querySelectorAll("ytd-video-renderer")
    ).slice(0, 10);
    return items.map((el) => {
      const title = el.querySelector("#video-title")?.textContent?.trim();
      const url =
        "https://www.youtube.com" +
        el.querySelector("#video-title")?.getAttribute("href");
      const thumbnail = el.querySelector("img")?.src;
      const viewsText =
        el.querySelector("#metadata-line span")?.textContent || "";
      const uploadedAt =
        el.querySelector("#metadata-line span:nth-child(2)")?.textContent || "";

      const viewsMatch = viewsText.replaceAll(",", "").match(/([\d.]+)([MK]?)/);
      let views = 0;
      if (viewsMatch) {
        const num = parseFloat(viewsMatch[1]);
        const unit = viewsMatch[2];
        views =
          unit === "M" ? num * 1_000_000 : unit === "K" ? num * 1_000 : num;
      }

      return {
        id: url.split("v=")[1] || url,
        title,
        thumbnail,
        url,
        views: Math.round(views),
        uploadedAt,
        platform: "youtube",
      };
    });
  });

  await browser.close();
  return videos.filter((v) => v.title && v.thumbnail);
};
