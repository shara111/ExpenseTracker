import { MdAdd } from "react-icons/md";

export default function AddSourceButton({ func, text }) {
  return (
    <button
      onClick={func}
      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <MdAdd className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
      {text}
    </button>
  );
}
