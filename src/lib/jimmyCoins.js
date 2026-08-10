export const jimmyCoinOptions = [
  { id: "j5", amount: "5", labelEn: "Nice Start", labelZh: "开场不错", receipt: "吉米币 +5，吧台进入状态。" },
  { id: "j20", amount: "20", labelEn: "Good Pour", labelZh: "这杯不错", receipt: "吉米币 +20，Jimmy 今晚手感 +20。" },
  { id: "j88", amount: "88", labelEn: "Great Night", labelZh: "今晚尽兴", receipt: "吉米币 +88，今晚的下一杯更有灵感。" },
  { id: "infinite", amount: "∞", labelEn: "House Legend", labelZh: "吧台传说", receipt: "吉米币余额：∞。Jimmy 已认真记下。" }
];

export function findJimmyCoin(optionId) {
  return jimmyCoinOptions.find((option) => option.id === optionId) || null;
}

export function isJimmyCoinItem(item) {
  return item?.type === "jimmy-coin" || item?.type === "bar-cash";
}

export function serializeJimmyCoin(optionId) {
  const option = findJimmyCoin(optionId);
  if (!option) return null;
  return {
    line_id: `jimmy-coin-${option.id}`,
    type: "jimmy-coin",
    drink_id: "jimmys-coin",
    name_zh: "吉米币",
    name_en: "Jimmy Coins",
    quantity: 1,
    funny_money: {
      id: option.id,
      amount: option.amount,
      labelEn: option.labelEn,
      labelZh: option.labelZh,
      receipt: option.receipt
    }
  };
}
