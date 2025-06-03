export const shortAddress = (addr:string) =>  {
  if (!addr || addr.length < 10) return addr;
  return addr.slice(0, 8) + '......' + addr.slice(-4);
}
