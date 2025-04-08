// server/services/youtube.js
const puppeteer = require("puppeteer");

module.exports = async function crawlYouTube(channelName) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--lang=en-US,en"],
    defaultViewport: null,
  });

  const page = await browser.newPage();
  const channelUrl = `https://www.youtube.com/@${channelName}/shorts`;
  console.log(`🎯 YouTube Shorts 크롤링 시작: ${channelUrl}`);

  try {
    await page.goto(channelUrl, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await page.waitForSelector("#contents ytd-rich-item-renderer", {
      timeout: 10000,
    });
    console.log("✅ Shorts 렌더링 감지 완료");

    const videos = await page.evaluate(() => {
      const items = Array.from(
        document.querySelectorAll("#contents ytd-rich-item-renderer")
      ).slice(0, 5);

      return items.map((el) => {
        const href =
          el.querySelector("a.shortsLockupViewModelHostEndpoint")?.href ?? "";
        const id = href.split("/shorts/")[1] ?? "";
        const title = el.querySelector("h3 span")?.innerText ?? "제목 없음";
        const viewsText =
          el.querySelector(".shortsLockupViewModelHostMetadataSubhead span")
            ?.innerText ?? "0회";

        const viewMatch = viewsText
          .replace(/,/g, "")
          .match(/([\d.]+)([가만]?)/);
        let views = 0;
        if (viewMatch) {
          const num = parseFloat(viewMatch[1]);
          const unit = viewMatch[2];
          views =
            unit === "만" ? num * 10000 : unit === "가" ? num * 100000 : num;
        }

        return {
          id,
          title,
          url: href,
          thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          views: Math.round(views),
          uploadedAt: "",
          platform: "youtube",
        };
      });
    });

    await browser.close();
    return videos.filter((v) => v.views >= 100000);
  } catch (err) {
    console.warn("⚠️ 채널 실패, 검색 기반으로 fallback");

    const searchPage = await browser.newPage();
    const searchUrl = `https://www.youtube.com/results?search_query=${channelName}&sp=CAMSBAgDEAE%253D`;
    console.log("🔍 유튜브 검색 기반 fallback:", searchUrl);

    try {
      await searchPage.goto(searchUrl, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });
      await searchPage.waitForSelector("ytd-video-renderer", {
        timeout: 10000,
      });

      const videos = await searchPage.evaluate(() => {
        const items = Array.from(
          document.querySelectorAll("ytd-video-renderer")
        )
          .filter((el) => el.innerHTML.includes("shorts"))
          .slice(0, 5);

        return items.map((el) => {
          const href = el.querySelector("a#thumbnail")?.href ?? "";
          const id = href.split("/shorts/")[1] ?? "";
          const title =
            el.querySelector("#video-title")?.textContent?.trim() ??
            "제목 없음";

          const viewsText =
            el.innerText.match(/([\d,.]+)([가만]?)회/)?.[0] ?? "0회";
          const viewMatch = viewsText
            .replace(/,/g, "")
            .match(/([\d.]+)([가만]?)/);
          let views = 0;
          if (viewMatch) {
            const num = parseFloat(viewMatch[1]);
            const unit = viewMatch[2];
            views =
              unit === "만" ? num * 10000 : unit === "가" ? num * 100000 : num;
          }

          return {
            id,
            url: href,
            title,
            thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
            views: Math.round(views),
            uploadedAt: "",
            platform: "youtube",
          };
        });
      });

      await browser.close();
      return videos.filter((v) => v.views >= 100000);
    } catch (searchError) {
      console.error("❌ YouTube 검색 크롤링 실패:", searchError.message);
      await browser.close();
      return [];
    }
  }
};
