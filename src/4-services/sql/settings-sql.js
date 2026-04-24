import sqlService from "../sql-service.js";

export const listSettings = (...args) => sqlService.listSettings(...args);
export const setSetting = (...args) => sqlService.setSetting(...args);

export default {
  listSettings,
  setSetting,
};
