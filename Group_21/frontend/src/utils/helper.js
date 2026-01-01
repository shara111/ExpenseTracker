export const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/;
  if (!email) return { isValid: false, message: "Email is required" };
  if (!regex.test(email))
    return { isValid: false, message: "Invalid email format" };
  return { isValid: true, message: "" };
};

export const validatePassword = (password) => {
  if (!password) return { isValid: false, message: "Password is required" };
  if (password.length < 8)
    return { isValid: false, message: "Minimum 8 characters" };
  if (!/[A-Z]/.test(password))
    return { isValid: false, message: "At least one uppercase letter" };
  if (!/[a-z]/.test(password))
    return { isValid: false, message: "At least one lowercase letter" };
  if (!/[0-9]/.test(password))
    return { isValid: false, message: "At least one number" };
  if (!/[^A-Za-z0-9]/.test(password))
    return { isValid: false, message: "At least one special character" };
  return { isValid: true, message: "" };
};

export const applyFilter = (documents, setter, selectedTag, memberFilter) => {
  // Extract all unique tags
  const tagsSet = new Set();
  documents.forEach((item) => {
    if (item.tags && Array.isArray(item.tags)) {
      item.tags.forEach((tag) => tagsSet.add(tag));
    }
  });
  setter(Array.from(tagsSet).sort());
  const withMemberFilter =
    memberFilter === "all"
      ? documents
      : documents.filter((i) => i.createdBy?._id === memberFilter);
  // Apply tag filter
  let withTagAndMemberFilter = withMemberFilter;
  if (selectedTag) {
    withTagAndMemberFilter = withMemberFilter.filter(
      (item) => item.tags && item.tags.includes(selectedTag),
    );
  }
  return withTagAndMemberFilter;
};
