import axiosInstance from "./axiosInstance";

export const fetchPixabayImages = async (query) => {
  const res = await axiosInstance.get(`/resource/pixabay?q=${query}`);
  return res.data;
};
