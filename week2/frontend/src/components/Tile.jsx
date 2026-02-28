export default function Tile({ value }) {
  return (
    <div className="
      w-20 h-20
      flex items-center justify-center
      text-2xl font-bold
      bg-blue-500 text-white
      rounded-xl shadow-md
    ">
      {value !== 0 ? value : ""}
    </div>
  );
}