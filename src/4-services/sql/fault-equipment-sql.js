import sqlService from "../sql-service.js";

export const listFaultManufacturers = (...args) => sqlService.listFaultManufacturers(...args);
export const getFaultManufacturerById = (...args) => sqlService.getFaultManufacturerById(...args);
export const createFaultManufacturer = (...args) => sqlService.createFaultManufacturer(...args);
export const updateFaultManufacturer = (...args) => sqlService.updateFaultManufacturer(...args);
export const listFaultEquipmentCategories = (...args) => sqlService.listFaultEquipmentCategories(...args);
export const getFaultEquipmentCategoryById = (...args) => sqlService.getFaultEquipmentCategoryById(...args);
export const createFaultEquipmentCategory = (...args) => sqlService.createFaultEquipmentCategory(...args);
export const updateFaultEquipmentCategory = (...args) => sqlService.updateFaultEquipmentCategory(...args);
export const listFaultEquipmentSubcategories = (...args) => sqlService.listFaultEquipmentSubcategories(...args);
export const getFaultEquipmentSubcategoryById = (...args) => sqlService.getFaultEquipmentSubcategoryById(...args);
export const createFaultEquipmentSubcategory = (...args) => sqlService.createFaultEquipmentSubcategory(...args);
export const updateFaultEquipmentSubcategory = (...args) => sqlService.updateFaultEquipmentSubcategory(...args);

export default {
  listFaultManufacturers,
  getFaultManufacturerById,
  createFaultManufacturer,
  updateFaultManufacturer,
  listFaultEquipmentCategories,
  getFaultEquipmentCategoryById,
  createFaultEquipmentCategory,
  updateFaultEquipmentCategory,
  listFaultEquipmentSubcategories,
  getFaultEquipmentSubcategoryById,
  createFaultEquipmentSubcategory,
  updateFaultEquipmentSubcategory,
};
