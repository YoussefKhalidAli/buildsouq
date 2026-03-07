export const uid = (): string => Math.random().toString(36).slice(2, 9);

export const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString('en-AE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
