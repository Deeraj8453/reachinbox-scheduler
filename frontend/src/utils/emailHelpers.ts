export const getLocalPart = (recipient?: string) => {
  if (!recipient) return '';
  const i = recipient.indexOf('@');
  return i === -1 ? recipient : recipient.slice(0, i);
};
