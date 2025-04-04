// src/components/charts/PlatformBarChart.jsx
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

export default function PlatformBarChart() {
  const { videos } = useCrawlStore();

  const platformCount = videos.reduce((acc, v) => {
    acc[v.platform] = (acc[v.platform] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(platformCount);
  const data = Object.values(platformCount);

  const chartData = {
    labels,
    datasets: [
      {
        label: "플랫폼별 영상 수",
        data,
        backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56"],
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
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 border border-black rounded shadow mt-4">
      <h3 className="font-semibold mb-2">📊 플랫폼별 영상 수</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
}
