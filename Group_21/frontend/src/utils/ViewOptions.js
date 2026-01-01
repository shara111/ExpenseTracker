export default function ViewOptions({ setRange }) {
  const config = [
    { label: "4 Weeks", value: "4w" },
    { label: "3 Months", value: "3m" },
    { label: "6 Months", value: "6m" },
    { label: "12 Months", value: "12m" },
  ];
  return config.map((c) => ({
    label: c.label,
    setter: () => setRange(c.value),
  }));
}

export function TransactionOptions({ setTransactionOption }) {
  const config = [
    { label: "All Transactions", value: false },
    { label: "Upcoming Transactions", value: true },
  ];
  return config.map((c) => ({
    label: c.label,
    setter: () => setTransactionOption(c.value),
  }));
}
