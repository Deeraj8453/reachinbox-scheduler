export const getLocalPart = (recipient?: string) => {
  if (!recipient) return '';
  const idx = recipient.indexOf('@');
  return idx === -1 ? recipient : recipient.slice(0, idx);
};

export const formatFigmaDateSafe = (dateString: string | null | undefined) => {
  if (!dateString) return 'No Date';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};
