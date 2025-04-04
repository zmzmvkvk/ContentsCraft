export default function SearchBar({ value, onChange, onSearch, loading }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mb-6">
      <input
        type="text"
        className="border-2 border-black p-3 w-full md:w-[400px] bg-white shadow-inner font-mono placeholder-gray-400"
        placeholder="채널명 또는 키워드 입력"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        onClick={onSearch}
        disabled={loading}
        className={`bg-black text-white px-6 py-3 rounded-full shadow-md tracking-wide transition 
    hover:bg-white hover:text-black hover:border hover:border-black ${
      loading && "opacity-50 cursor-not-allowed"
    }`}
      >
        {loading ? "수집 중..." : "수집"}
      </button>
    </div>
  );
}
