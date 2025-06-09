/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseFormData(data: { [key: string]: string }) {
  const parsedData: { [key: string]: any } = {};

  for (const key in data) {
    const value = data[key];
    try {
      parsedData[key] = JSON.parse(value);
    } catch {
      const numberValue = Number(value);
      parsedData[key] = isNaN(numberValue) ? value : numberValue;
    }
  }

  return parsedData;
}
