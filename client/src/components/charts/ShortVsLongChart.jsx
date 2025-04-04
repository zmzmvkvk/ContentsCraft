// src/components/charts/ShortVsLongChart.jsx
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useCrawlStore } from "../../stores/useCrawlStore";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ShortVsLongChart() {
  const { videos } = useCrawlStore();

  const short = videos.filter((v) => v.duration && v.duration <= 60);
  const long = videos.filter((v) => v.duration && v.duration > 60);

  const avgShort =
    short.length > 0
      ? Math.round(
          short.reduce((sum, v) => sum + (v.views || 0), 0) / short.length
        )
      : 0;

  const avgLong =
    long.length > 0
      ? Math.round(
          long.reduce((sum, v) => sum + (v.views || 0), 0) / long.length
        )
      : 0;

  const chartData = {
    labels: ["1분 이하", "1분 초과"],
    datasets: [
      {
        label: "평균 조회수",
        data: [avgShort, avgLong],
        backgroundColor: ["#36a2eb", "#ff6384"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
    },
  };

  return (
    <div className="bg-white p-4 border border-black rounded shadow">
      <h3 className="font-semibold mb-2">🕐 영상 길이에 따른 평균 조회수</h3>
      <Pie data={chartData} options={options} />
    </div>
  );
}
