export const formatarMoeda = (valor: number): string => {
  return valor?.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

export const formatCurrency = (value: number) => {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (e) {
    return `R$ ${value.toFixed(2)}`;
  }
};

export const parseCurrency = (value?: string): number => {
  if (!value) return 0;

  let v = value.trim();

  v = v.replace(/[^\d.,-]/g, "");

  if (v.indexOf(".") > -1 && v.indexOf(",") > -1) {
    v = v.replace(/\./g, "").replace(",", ".");
  } else if (v.indexOf(",") > -1 && v.indexOf(".") === -1) {
    v = v.replace(",", ".");
  } else {
    const parts = v.split(".");
    if (parts.length > 2) {
      const dec = parts.pop();
      v = parts.join("") + "." + dec;
    }
  }

  const num = parseFloat(v);
  return isNaN(num) ? 0 : num;
};
