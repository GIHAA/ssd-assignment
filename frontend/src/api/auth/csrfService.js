export const getCSRFToken = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; XSRF-TOKEN=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

