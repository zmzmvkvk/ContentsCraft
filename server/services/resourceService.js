const axios = require("axios");

async function searchPixabay(keyword) {
  const PIXABAY_KEY = process.env.PIXABAY_API_KEY;
  if (!PIXABAY_KEY) throw new Error("Pixabay API 키 없음");

  const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(
    keyword
  )}&image_type=photo&per_page=3`;

  const { data } = await axios.get(url);
  return data.hits.map((hit) => ({
    id: hit.id,
    url: hit.largeImageURL,
    tags: hit.tags,
  }));
}

module.exports = {
  searchPixabay,
};
