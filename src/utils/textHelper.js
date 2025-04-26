export const getPlainText = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

export const formatDate = (timestamp) => {
  const dateOption = { year: "numeric", month: "short", day: "numeric" };
  const timeOption = { hour: "numeric", minute: "numeric" };
  const timestampDate = timestamp.toDate();
  const todaysDate = new Date();
  if (
    timestampDate.toLocaleString("en-US", dateOption) ===
    todaysDate.toLocaleString("en-US", dateOption)
  ) {
    return timestampDate.toLocaleString("en-US", timeOption);
  } else {
    return timestampDate.toLocaleString("en-US", dateOption);
  }
};
