export function parseDateSafe(dateString) {
  if (!dateString) return 0;
  
  // Convert to ISO format
  const iso = dateString.replace(" ", "T");
  
  return new Date(iso).getTime();
}
