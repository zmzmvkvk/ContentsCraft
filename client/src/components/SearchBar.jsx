export default function SearchBar({ value, onChange, onSearch, loading }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  const handleAutoFillChannels = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/top-channels");
      const result = await res.json();

      if (result.success) {
        const joined = result.channels.join(", ");
        onChange(joined); // ✅ 부모 상태에 반영
      } else {
        alert("❌ 채널명 불러오기 실패");
      }
    } catch (err) {
      console.error("자동 채널 불러오기 실패:", err);
    }
  };

  return (
    <div className="flex flex-row items-center gap-2 md:gap-4 mb-6">
      <input
        type="text"
        className="border-2 border-gray-700 p-3 w-3/5 md:w-[400px] bg-[#2a2a2a] shadow-inner font-mono placeholder-white"
        placeholder="채널명 또는 키워드 입력"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        onClick={onSearch}
        disabled={loading}
        className={`bg-black h-13 box-border text-white text-sm px-5 md:px-6 w-auto py-0 rounded shadow-md tracking-wide transition 
          hover:bg-white hover:text-black hover:border hover:border-gray-700 ${
            loading && "opacity-50 cursor-not-allowed"
          }`}
      >
        {loading ? "수집 중..." : "수집"}
      </button>
      <button
        onClick={handleAutoFillChannels}
        className={`bg-black h-13 box-border text-white text-sm px-2 md:px-6 py-0 rounded shadow-md tracking-wide transition 
          hover:bg-white hover:text-black hover:border hover:border-gray-700 ${
            loading && "opacity-50 cursor-not-allowed"
          }`}
      >
        키워드 수집
      </button>
    </div>
  );
}
