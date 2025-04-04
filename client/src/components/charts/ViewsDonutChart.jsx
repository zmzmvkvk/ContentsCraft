// src/components/charts/ViewsDonutChart.jsx
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useCrawlStore } from "../../stores/useCrawlStore";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ViewsDonutChart() {
  const { videos } = useCrawlStore();

  const under100k = videos.filter((v) => v.views < 100000).length;
  const btw100k_500k = videos.filter(
    (v) => v.views >= 100000 && v.views < 500000
  ).length;
  const btw500k_1m = videos.filter(
    (v) => v.views >= 500000 && v.views < 1000000
  ).length;
  const over1m = videos.filter((v) => v.views >= 1000000).length;

  const chartData = {
    labels: ["10만 미만", "10만~50만", "50만~100만", "100만 이상"],
    datasets: [
      {
        label: "조회수 분포",
        data: [under100k, btw100k_500k, btw500k_1m, over1m],
        backgroundColor: ["#ff9f40", "#ffcd56", "#4bc0c0", "#36a2eb"],
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
      <h3 className="font-semibold mb-2">📈 조회수 구간 분포</h3>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
