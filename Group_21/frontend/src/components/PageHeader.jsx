import { motion } from "framer-motion";
import { MdAttachMoney } from "react-icons/md";
import AddSourceButton from "./AddSourceButton";

export default function PageHeader({
  title,
  subtitle,
  setOpen,
  setType,
  location,
  text,
}) {
  let type = "";
  if (location === "/income") {
    type = "addIncome";
  } else {
    type = "addExpense";
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <MdAttachMoney className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <AddSourceButton
        func={() => {
          setOpen(true);
          setType(type);
        }}
        text={text}
      />
    </motion.div>
  );
}
