export const parseDateToLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateToSend = (dateToFormat) => {
  if (!dateToFormat) {
    return "";
  }
  let formattedDate = "";
  const date = new Date(
    `${dateToFormat}`.replace(/-/g, "\/").replace(/T.+/, ""),
  );
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
};
