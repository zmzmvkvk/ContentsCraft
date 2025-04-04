// src/components/charts/KeywordFrequencyChart.jsx
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

export default function KeywordFrequencyChart() {
  const { videos } = useCrawlStore();

  const wordCount = {};

  videos.forEach((v) => {
    const words = v.title
      ?.toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2); // 불용어 제거용
    words?.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
  });

  const sorted = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const labels = sorted.map(([word]) => word);
  const data = sorted.map(([_, count]) => count);

  const chartData = {
    labels,
    datasets: [
      {
        label: "제목 내 등장 횟수",
        data,
        backgroundColor: "#36a2eb",
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
        stepSize: 1,
      },
    },
  };

  return (
    <div className="bg-white p-4 border border-black rounded shadow">
      <h3 className="font-semibold mb-2">🔍 자주 등장한 키워드 (제목 기준)</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
}
