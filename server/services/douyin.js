const puppeteer = require("puppeteer");

module.exports = async function crawlDouyin(channelName) {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--lang=zh-CN,zh"],
    defaultViewport: null,
  });

  const page = await browser.newPage();
  const url = `https://www.douyin.com/search/${channelName}`;
  console.log(`\n🎯 Douyin 크롤링 시작: ${url}`);

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // ✅ 기본 콘텐츠 로딩 기다리기 (필터 없이)
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const videos = await page.evaluate(() => {
      const videoCards = Array.from(
        document.querySelectorAll(
          "#waterFallScrollContainer .search-result-card"
        )
      ).slice(0, 5);

      return videoCards.map((el, idx) => {
        const imgEl = el.querySelector("img");
        const titleEl =
          el.querySelector(".videoImage + div > div > div > font > font") ||
          null;
        const likesEl =
          el.querySelector(
            ".videoImage > div > div + div > div:nth-child(3) svg + span font font"
          ) || null;
        const videoLink = el.querySelector("a")?.href || window.location.href;

        return {
          id: `douyin-${videoLink.split("/").pop() || idx}-${idx}`, // 중복 방지 확실한 ID
          title: titleEl ? titleEl.innerText.trim() : `douyin-${idx + 1}`,
          thumbnail: imgEl ? imgEl.src : "",
          url: videoLink,
          likes: likesEl
            ? parseInt(likesEl.innerText.trim().replace(/[,\.]/g, ""), 10)
            : 0,
          uploadedAt: "",
          platform: "douyin",
        };
      });
    });

    console.log(`✅ 크롤링 완료: ${videos.length}개 영상 수집됨`);
    await browser.close();
    return videos;
  } catch (error) {
    console.error("❌ Douyin 크롤링 실패:", error.message);
    await browser.close();
    return [];
  }
};
