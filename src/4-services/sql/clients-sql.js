import sqlService from "../sql-service.js";

export const listClients = (...args) => sqlService.listClients(...args);
export const getClientById = (...args) => sqlService.getClientById(...args);
export const createClient = (...args) => sqlService.createClient(...args);
export const updateClient = (...args) => sqlService.updateClient(...args);
export const listClientSites = (...args) => sqlService.listClientSites(...args);
export const getClientSiteById = (...args) => sqlService.getClientSiteById(...args);
export const createClientSite = (...args) => sqlService.createClientSite(...args);
export const updateClientSite = (...args) => sqlService.updateClientSite(...args);
export const listClientContacts = (...args) => sqlService.listClientContacts(...args);
export const getClientContactById = (...args) => sqlService.getClientContactById(...args);
export const createClientContact = (...args) => sqlService.createClientContact(...args);
export const updateClientContact = (...args) => sqlService.updateClientContact(...args);

export default {
  listClients,
  getClientById,
  createClient,
  updateClient,
  listClientSites,
  getClientSiteById,
  createClientSite,
  updateClientSite,
  listClientContacts,
  getClientContactById,
  createClientContact,
  updateClientContact,
};
