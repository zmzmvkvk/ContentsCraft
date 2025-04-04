// src/components/charts/PlatformAverageViewsChart.jsx
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { useCrawlStore } from "../../stores/useCrawlStore";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function PlatformAverageViewsChart() {
  const { videos } = useCrawlStore();

  const platforms = ["youtube", "tiktok", "douyin"];
  const labels = ["YouTube", "TikTok", "Douyin"];

  const avgViews = platforms.map((platform) => {
    const filtered = videos.filter((v) => v.platform === platform);
    const total = filtered.reduce((sum, v) => sum + (v.views || 0), 0);
    return filtered.length ? Math.round(total / filtered.length) : 0;
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: "평균 조회수",
        data: avgViews,
        backgroundColor: ["#ff6384", "#4bc0c0", "#a58cf8"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value >= 1000000
              ? value / 1000000 + "M"
              : value >= 1000
              ? value / 1000 + "K"
              : value;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 border border-black rounded shadow">
      <h3 className="font-semibold mb-2">📺 플랫폼별 평균 조회수</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
}
