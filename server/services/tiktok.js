// server/services/tiktok.js
const puppeteer = require("puppeteer");

module.exports = async function crawlTikTok(channelName) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--lang=en-US,en"],
    defaultViewport: null,
  });

  const page = await browser.newPage();
  const url = `https://www.tiktok.com/search?q=${channelName}`;

  console.log(`🔍 TikTok 크롤링 시작: ${url}`);

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // 콘텐츠 피드 전체 렌더링 대기
    await page.waitForSelector(".css-ubsdy8-DivVideoFeed.eegew6e0", {
      timeout: 15000,
    });
    console.log("✅ TikTok 콘텐츠 컨테이너 감지 완료");

    // 영상 데이터 수집
    const videos = await page.evaluate(() => {
      const container = document.querySelector(
        ".css-ubsdy8-DivVideoFeed.eegew6e0"
      );
      if (!container) return [];

      const cards = container.querySelectorAll(
        ".css-1soki6-DivItemContainerForSearch.e19c29qe9"
      );

      return Array.from(cards)
        .slice(0, 10) // 상위 10개 영상만
        .map((card, i) => {
          const linkTag = card.querySelector("a[href*='/video/']");
          const imgTag = card.querySelector("img");
          const viewsTag = card.querySelector("[data-e2e='video-views']");
          const titleTag = card.querySelector('span[data-e2e="new-desc-span"]');

          const href = linkTag?.getAttribute("href");
          const id = href?.includes("/video/")
            ? href.split("/video/")[1]
            : `tt${i}`;
          const url = href?.startsWith("http")
            ? href
            : `https://www.tiktok.com${href}`;
          const thumbnail = imgTag?.src || "";
          const viewsText = viewsTag?.textContent || "";
          const title = titleTag?.textContent?.trim() || "제목 없음";

          const parsedViews = (() => {
            const match = viewsText.match(/([\d.,]+)([A-Za-z]*)/);
            if (!match) return 0;
            const num = parseFloat(match[1].replace(/,/g, ""));
            const unit = match[2];
            if (unit === "K") return Math.round(num * 1000);
            if (unit === "M") return Math.round(num * 1000000);
            if (unit === "B") return Math.round(num * 1000000000);
            return Math.round(num);
          })();

          return {
            id,
            title,
            url,
            thumbnail,
            views: parsedViews,
            uploadedAt: "", // TikTok은 기본 페이지에서 날짜 정보 없음
            platform: "tiktok",
          };
        })
        .filter((v) => v.views >= 100000);
    });

    await browser.close();
    console.log(`✅ TikTok 크롤링 완료: ${videos.length}개 영상 수집됨`);
    return videos;
  } catch (err) {
    console.error("❌ TikTok 크롤링 실패:", err.message);
    await browser.close();
    return [];
  }
};
