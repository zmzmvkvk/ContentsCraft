const puppeteer = require("puppeteer");

module.exports = async function crawlYouTube(channelName) {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--lang=en-US,en"],
    defaultViewport: null,
  });

  const page = await browser.newPage();
  const url = `https://www.youtube.com/@${channelName}/shorts`;
  console.log(`🎯 YouTube Shorts 크롤링 시작: ${url}`);

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // #contents 로딩될 때까지 기다리기
    await page.waitForSelector("#contents ytd-rich-item-renderer", {
      timeout: 10000,
    });
    console.log("✅ Shorts 렌더링 감지 완료");

    // 데이터 추출
    const videos = await page.evaluate(() => {
      const cards = Array.from(
        document.querySelectorAll("#contents ytd-rich-item-renderer")
      ).slice(0, 5);

      return cards.map((card) => {
        const title = card.querySelector("h3 span")?.innerText ?? "제목 없음";
        const viewsText =
          card.querySelector(".shortsLockupViewModelHostMetadataSubhead span")
            ?.innerText ?? "0회";

        const viewMatch = viewsText
          .replaceAll(",", "")
          .match(/([\d.]+)([가만]?)/);
        let views = 0;
        if (viewMatch) {
          const num = parseFloat(viewMatch[1]);
          const unit = viewMatch[2];
          if (unit === "만") views = num * 10000;
          else if (unit === "가") views = num * 100000;
          else views = num;
        }

        const href =
          card.querySelector("a.shortsLockupViewModelHostEndpoint")?.href ?? "";
        const id = href.split("/shorts/")[1] || href;
        const thumbnail =
          card.querySelector("img")?.src ??
          `https://via.placeholder.com/320x180.png?text=YouTube`;

        return {
          id,
          title,
          url: href,
          thumbnail,
          views: Math.round(views),
          uploadedAt: "", // YouTube Shorts에는 명확한 업로드일 안 보임
          platform: "youtube",
        };
      });
    });

    await browser.close();

    // 10만 이상만 필터링
    const filtered = videos.filter((v) => v.views >= 100000);
    return filtered;
  } catch (err) {
    console.error("❌ YouTube 크롤링 실패:", err.message);
    await browser.close();
    return [];
  }
};
