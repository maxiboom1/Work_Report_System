import sqlService from "../sql-service.js";

export const getEmployeeById = (...args) => sqlService.getEmployeeById(...args);
export const getClientById = (...args) => sqlService.getClientById(...args);
export const getClientSiteById = (...args) => sqlService.getClientSiteById(...args);
export const getClientContactById = (...args) => sqlService.getClientContactById(...args);
export const getFaultManufacturerById = (...args) => sqlService.getFaultManufacturerById(...args);
export const getFaultEquipmentCategoryById = (...args) => sqlService.getFaultEquipmentCategoryById(...args);
export const getFaultEquipmentSubcategoryById = (...args) => sqlService.getFaultEquipmentSubcategoryById(...args);
export const findClientByName = (...args) => sqlService.findClientByName(...args);
export const createClient = (...args) => sqlService.createClient(...args);
export const findClientSiteByName = (...args) => sqlService.findClientSiteByName(...args);
export const createClientSite = (...args) => sqlService.createClientSite(...args);
export const findClientContactByName = (...args) => sqlService.findClientContactByName(...args);
export const createClientContact = (...args) => sqlService.createClientContact(...args);
export const findFaultManufacturerByName = (...args) => sqlService.findFaultManufacturerByName(...args);
export const createFaultManufacturer = (...args) => sqlService.createFaultManufacturer(...args);
export const findFaultEquipmentCategoryByName = (...args) => sqlService.findFaultEquipmentCategoryByName(...args);
export const createFaultEquipmentCategory = (...args) => sqlService.createFaultEquipmentCategory(...args);
export const findFaultEquipmentSubcategoryByName = (...args) => sqlService.findFaultEquipmentSubcategoryByName(...args);
export const createFaultEquipmentSubcategory = (...args) => sqlService.createFaultEquipmentSubcategory(...args);
export const countFaultsForYear = (...args) => sqlService.countFaultsForYear(...args);
export const createFault = (...args) => sqlService.createFault(...args);
export const createFaultContact = (...args) => sqlService.createFaultContact(...args);
export const createFaultEvent = (...args) => sqlService.createFaultEvent(...args);
export const listFaults = (...args) => sqlService.listFaults(...args);
export const getFaultById = (...args) => sqlService.getFaultById(...args);
export const listFaultContactsByFaultId = (...args) => sqlService.listFaultContactsByFaultId(...args);
export const listFaultEventsByFaultId = (...args) => sqlService.listFaultEventsByFaultId(...args);
export const updateFault = (...args) => sqlService.updateFault(...args);
export const updateFaultStatus = (...args) => sqlService.updateFaultStatus(...args);

export default {
  getEmployeeById,
  getClientById,
  getClientSiteById,
  getClientContactById,
  getFaultManufacturerById,
  getFaultEquipmentCategoryById,
  getFaultEquipmentSubcategoryById,
  findClientByName,
  createClient,
  findClientSiteByName,
  createClientSite,
  findClientContactByName,
  createClientContact,
  findFaultManufacturerByName,
  createFaultManufacturer,
  findFaultEquipmentCategoryByName,
  createFaultEquipmentCategory,
  findFaultEquipmentSubcategoryByName,
  createFaultEquipmentSubcategory,
  countFaultsForYear,
  createFault,
  createFaultContact,
  createFaultEvent,
  listFaults,
  getFaultById,
  listFaultContactsByFaultId,
  listFaultEventsByFaultId,
  updateFault,
  updateFaultStatus,
};
