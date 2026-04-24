import { $id } from "../shared/dom.js";
import { fillEmployeeEdit, renderEmployeeList, selectedEmployee } from "./employees.js";
import { fillProjectEdit, renderProjectList, selectedProject } from "./projects.js";
import {
  fillClientContactEdit,
  fillClientEdit,
  fillClientEditModal,
  fillClientSiteEdit,
  renderClientContactList,
  renderClientList,
  renderClientSiteList,
  selectedClient,
  selectedClientContact,
  selectedClientSite,
} from "./clients.js";
import {
  fillFaultCategoryEdit,
  fillFaultEditModal,
  fillFaultManufacturerEdit,
  fillFaultSubcategoryEdit,
  renderFaultCategoryList,
  renderFaultManufacturerList,
  renderFaultSubcategoryList,
  selectedFaultCategory,
  selectedFaultManufacturer,
  selectedFaultSubcategory,
} from "./manufacturers.js";
import { fillStatsPickers } from "./statistics.js";

export const DEFAULT_ADMIN_SETTINGS = {
  admin_language: "en",
  workday_hours: 9,
};

export let ADMIN_SETTINGS = { ...DEFAULT_ADMIN_SETTINGS };

const I18N = {
  en: {
    appTitle: "Work Reports",
    adminPanel: "Admin panel",
    employees: "Employees",
    projects: "Projects",
    clients: "Clients",
    manufacturers: "Manufacturers",
    stats: "Reports",
    settings: "System settings",
    logout: "Logout",
    employeeTitle: "Employees",
    employeeHint: "Create, edit, and delete employee accounts.",
    employeeList: "Employee list",
    search: "Search...",
    refresh: "Refresh",
    clear: "Clear",
    addEmployee: "Add employee",
    editSelected: "Edit selected",
    editSelectedItem: "Edit selected",
    firstName: "First name",
    lastName: "Last name",
    passport: "Passport ID",
    car: "Car ID",
    card: "Card ID",
    phone: "Phone",
    email: "Email",
    manager: "Manager",
    dailyRate: "Daily rate",
    login: "Login",
    password: "Password",
    newPassword: "New password (optional)",
    selected: "Selected",
    none: "None",
    add: "Add",
    createAction: "Create",
    editAction: "Edit",
    save: "Save",
    delete: "Delete",
    cancel: "Cancel",
    optional: "optional",
    keepEmpty: "leave empty to keep",
    projectTitle: "Projects",
    projectHint: "Create, edit, and delete projects.",
    projectList: "Project list",
    addProject: "Add project",
    projectName: "Project name",
    active: "Active",
    activeValue: "active",
    disabledValue: "disabled",
    statsTitle: "Reports",
    statsHint: "Monthly employee, project, or external contractor report.",
    report: "Report",
    type: "Report type",
    month: "Month",
    employee: "Employee",
    project: "Project",
    run: "Show report",
    employeeMonthly: "Employee report",
    projectMonthly: "Project report",
    contractorsMonthly: "External contractors",
    selectPrompt: "Select...",
    date: "Date",
    start: "Start",
    end: "End",
    notes: "Notes",
    summary: "Summary",
    days: "Days",
    totalDays: "Total days",
    totalHours: "Total hours",
    extraHours: "Extra hours",
    dailyRateHeader: "Daily rate",
    hours: "Hours",
    cost: "Cost",
    employeeCount: "Employees",
    contractorName: "Contractor",
    serviceDescription: "Service description",
    serviceCost: "Service cost",
    managerAddedBy: "Registered by",
    entries: "Entries",
    editCost: "Edit cost",
    costUpdateConfirm: "Update contractor service cost?",
    costUpdated: "Cost updated",
    settingsTitle: "System settings",
    settingsHint: "Choose the admin language and workday length.",
    language: "Language",
    workdayHours: "Workday length (hours)",
    saveSettings: "Save settings",
    settingsSaved: "Settings saved",
    ready: "Ready.",
    missingMonth: "Please select month",
    missingEmployee: "Please select employee",
    missingProject: "Please select project",
    deleteEmployeeConfirm: "Delete employee",
    deleteProjectConfirm: "Delete project",
    employeeCreated: "Employee created",
    employeeSaved: "Employee updated",
    employeeDeleted: "Employee deleted",
    projectCreated: "Project created",
    projectSaved: "Project updated",
    projectDeleted: "Project deleted",
    clientsTitle: "Clients",
    clientsHint: "Manage clients, sites, and contact managers for fault forms.",
    clientList: "Clients",
    clientSiteList: "Sites",
    clientContactList: "Contact managers",
    addClient: "Add client",
    addClientSite: "Add site",
    addContactManager: "Add contact manager",
    clientName: "Client name",
    clientSiteName: "Site name",
    clientContactName: "Contact name",
    clientContactEmail: "Email",
    clientContactPhone: "Phone",
    clientSitesContextEmpty: "Select a client to view its sites.",
    clientContactsContextEmpty: "Related to client only. Site selection does not change this list.",
    clientSitesContext: "Sites for",
    clientContactsContext: "Contacts for",
    noClients: "No clients yet",
    noSites: "No sites for this client yet",
    noContacts: "No contact managers for this client yet",
    newClient: "New client",
    newSite: "New site",
    newContact: "New contact manager",
    editClient: "Edit client",
    editSite: "Edit site",
    editContact: "Edit contact manager",
    clientCreated: "Client created",
    clientSaved: "Client updated",
    clientDisabled: "Client disabled",
    clientEnabled: "Client enabled",
    clientSiteCreated: "Site created",
    clientSiteSaved: "Site updated",
    clientSiteDisabled: "Site disabled",
    clientSiteEnabled: "Site enabled",
    clientContactCreated: "Contact created",
    clientContactSaved: "Contact updated",
    clientContactDisabled: "Contact disabled",
    clientContactEnabled: "Contact enabled",
    selectClientFirst: "Select client first",
    manufacturersTitle: "Manufacturers",
    manufacturersHint: "Manage fault equipment hierarchy for field forms.",
    manufacturerList: "Manufacturers",
    equipmentCategoryTitle: "Equipment/model",
    equipmentSubcategoryTitle: "Component/area",
    addManufacturer: "Add manufacturer",
    addEquipmentCategory: "Add equipment/model",
    addEquipmentSubcategory: "Add component/area",
    manufacturerName: "Manufacturer name",
    equipmentCategoryName: "Equipment/model name",
    equipmentSubcategoryName: "Component/area name",
    status: "Status",
    enable: "Enable",
    disable: "Disable",
    manufacturerCreated: "Manufacturer created",
    manufacturerSaved: "Manufacturer updated",
    manufacturerDisabled: "Manufacturer disabled",
    manufacturerEnabled: "Manufacturer enabled",
    categoryCreated: "Equipment/model created",
    categorySaved: "Equipment/model updated",
    categoryDisabled: "Equipment/model disabled",
    categoryEnabled: "Equipment/model enabled",
    subcategoryCreated: "Component/area created",
    subcategorySaved: "Component/area updated",
    subcategoryDisabled: "Component/area disabled",
    subcategoryEnabled: "Component/area enabled",
    selectManufacturerFirst: "Select manufacturer first",
    selectCategoryFirst: "Select equipment/model first",
    categoriesContextEmpty: "Select manufacturer first.",
    subcategoriesContextEmpty: "Select equipment/model first.",
    categoriesContext: "Equipment/model for",
    subcategoriesContext: "Component/area for",
    noManufacturers: "No manufacturers yet",
    noCategories: "No equipment/model items yet",
    noSubcategories: "No component/area items yet",
    newManufacturer: "New manufacturer",
    newCategory: "New equipment/model",
    newSubcategory: "New component/area",
    editManufacturer: "Edit manufacturer",
    editCategory: "Edit equipment/model",
    editSubcategory: "Edit component/area",
    all: "All",
    faults: "Faults",
    faultsTitle: "Faults",
    faultsHint: "Track manager-submitted fault cases and continue the handling timeline.",
    faultList: "Fault list",
    faultsTableHint: "The table stays flat. Double-click a fault row to open its detail view.",
    faultFilterStatus: "Status",
    faultFilterClient: "Client",
    faultFilterManufacturer: "Manufacturer",
    faultFilterSupport: "Support level",
    faultFilterFrom: "From",
    faultFilterTo: "To",
    faultRunAction: "Run",
    faultColCreated: "Created",
    faultColClient: "Client",
    faultColSite: "Site",
    faultColManufacturer: "Manufacturer",
    faultColCategory: "Category / subcategory",
    faultColSupport: "Support",
    faultColLastEvent: "Last event",
    faultColStatus: "Status",
    faultColDescription: "Description",
    faultStatusOpen: "Open",
    faultStatusClosed: "Closed",
    faultSupportLayer2: "Under Layer-2 Support",
    faultSupportUnder: "Under Support",
    faultSupportNone: "Not Under Support",
    faultSummaryOne: "fault",
    faultSummaryMany: "faults",
    faultNoResults: "No faults found for the current filters.",
    faultDetailTitle: "Fault detail",
    faultDetailOpenedBy: "Opened by",
    faultDetailHardware: "Hardware",
    faultDetailContactsInline: "Contacts:",
    faultDetailSupport: "Support level",
    faultDetailSerial: "Serial / unit ID",
    faultDetailTicket: "Manufacturer ticket ID",
    faultDetailDescription: "Fault description",
    faultDetailTimeline: "Treatment process",
    faultProcessColStatus: "Status",
    faultProcessColCreated: "Date creation",
    faultProcessColName: "Name",
    faultProcessColCreatedBy: "Created by",
    faultProcessColDescription: "Description",
    faultProcessColOrder: "Order ID / tracking",
    faultProcessActive: "Active",
    faultProcessDone: "Done",
    faultEventTitle: "Event title",
    faultEventOrder: "Order ID / tracking",
    faultEventDetails: "Event details",
    faultEventModalTitle: "Add event",
    faultEventSaveAction: "Save event",
    faultSaveAction: "Save fault",
    faultAddEventAction: "Add event",
    faultCloseAction: "Close fault",
    faultReopenAction: "Reopen fault",
    faultCloseModalAction: "Close",
    faultNoEvents: "No events yet.",
    faultSaved: "Fault saved.",
    faultMarkedClosed: "Fault marked as closed.",
    faultMarkedOpen: "Fault marked as open.",
    faultEventAdded: "Event added.",
  },
  he: {
    appTitle: "דיווחי עבודה",
    adminPanel: "ניהול",
    employees: "עובדים",
    projects: "פרויקטים",
    clients: "\u05dc\u05e7\u05d5\u05d7\u05d5\u05ea",
    manufacturers: "יצרנים",
    stats: "דוחות",
    settings: "הגדרות מערכת",
    logout: "יציאה",
    employeeTitle: "עובדים",
    employeeHint: "ניהול עובדים ופרטי התחברות.",
    employeeList: "רשימת עובדים",
    search: "חיפוש...",
    refresh: "רענון",
    clear: "ניקוי",
    addEmployee: "עובד חדש",
    editSelected: "עריכה",
    editSelectedItem: "עריכת נבחר",
    firstName: "שם פרטי",
    lastName: "שם משפחה",
    passport: "מספר דרכון",
    car: "מספר רכב",
    card: "מספר כרטיס",
    phone: "טלפון",
    email: "אימייל",
    manager: "מנהל",
    dailyRate: "תעריף יומי",
    login: "שם משתמש",
    password: "סיסמה",
    newPassword: "סיסמה חדשה (לא חובה)",
    selected: "נבחר",
    none: "לא נבחר",
    add: "הוספה",
    createAction: "יצירה",
    editAction: "עריכה",
    save: "שמירה",
    delete: "מחיקה",
    cancel: "ביטול",
    optional: "לא חובה",
    keepEmpty: "להשאיר ריק אם אין שינוי",
    projectTitle: "פרויקטים",
    projectHint: "ניהול רשימת הפרויקטים.",
    projectList: "רשימת פרויקטים",
    addProject: "פרויקט חדש",
    projectName: "שם פרויקט",
    active: "פעיל",
    activeValue: "פעיל",
    disabledValue: "לא פעיל",
    statsTitle: "דוחות",
    statsHint: "דוח חודשי לעובד, לפרויקט או לקבלנים חיצוניים.",
    report: "דוח",
    type: "סוג דוח",
    month: "חודש",
    employee: "עובד",
    project: "פרויקט",
    run: "הצג דוח",
    employeeMonthly: "דוח עובד",
    projectMonthly: "דוח פרויקט",
    contractorsMonthly: "קבלנים חיצוניים",
    selectPrompt: "בחירה...",
    date: "תאריך",
    start: "התחלה",
    end: "סיום",
    notes: "הערות",
    summary: "סה״כ",
    days: "ימים",
    totalDays: "סה״כ ימים",
    totalHours: "סה״כ שעות",
    extraHours: "שעות נוספות",
    dailyRateHeader: "תעריף יומי",
    hours: "שעות",
    cost: "עלות",
    employeeCount: "עובדים",
    contractorName: "שם קבלן",
    serviceDescription: "תיאור שירות",
    serviceCost: "עלות שירות",
    managerAddedBy: "נרשם על ידי",
    entries: "רשומות",
    editCost: "עריכת עלות",
    costUpdateConfirm: "לעדכן את עלות השירות של הקבלן?",
    costUpdated: "העלות עודכנה",
    settingsTitle: "הגדרות מערכת",
    settingsHint: "בחירת שפה ואורך משמרת לחישוב שעות נוספות.",
    language: "שפה",
    workdayHours: "אורך משמרת (בשעות)",
    saveSettings: "שמירת הגדרות",
    settingsSaved: "ההגדרות נשמרו",
    ready: "מוכן.",
    missingMonth: "יש לבחור חודש",
    missingEmployee: "יש לבחור עובד",
    missingProject: "יש לבחור פרויקט",
    deleteEmployeeConfirm: "למחוק עובד",
    deleteProjectConfirm: "למחוק פרויקט",
    employeeCreated: "העובד נוסף",
    employeeSaved: "העובד נשמר",
    employeeDeleted: "העובד נמחק",
    projectCreated: "הפרויקט נוסף",
    projectSaved: "הפרויקט נשמר",
    projectDeleted: "הפרויקט נמחק",
    clientsTitle: "\u05dc\u05e7\u05d5\u05d7\u05d5\u05ea",
    clientsHint: "\u05e0\u05d9\u05d4\u05d5\u05dc \u05dc\u05e7\u05d5\u05d7\u05d5\u05ea, \u05d0\u05ea\u05e8\u05d9\u05dd \u05d5\u05d0\u05e0\u05e9\u05d9 \u05e7\u05e9\u05e8 \u05dc\u05d8\u05d5\u05e4\u05e1\u05d9 \u05ea\u05e7\u05dc\u05d5\u05ea.",
    clientList: "\u05dc\u05e7\u05d5\u05d7\u05d5\u05ea",
    clientSiteList: "\u05d0\u05ea\u05e8\u05d9\u05dd",
    clientContactList: "\u05d0\u05e0\u05e9\u05d9 \u05e7\u05e9\u05e8",
    addClient: "\u05dc\u05e7\u05d5\u05d7 \u05d7\u05d3\u05e9",
    addClientSite: "\u05d0\u05ea\u05e8 \u05d7\u05d3\u05e9",
    addContactManager: "\u05d0\u05d9\u05e9 \u05e7\u05e9\u05e8 \u05d7\u05d3\u05e9",
    clientName: "\u05e9\u05dd \u05dc\u05e7\u05d5\u05d7",
    clientSiteName: "\u05e9\u05dd \u05d0\u05ea\u05e8",
    clientContactName: "\u05e9\u05dd \u05d0\u05d9\u05e9 \u05e7\u05e9\u05e8",
    clientContactEmail: "\u05d0\u05d9\u05de\u05d9\u05d9\u05dc",
    clientContactPhone: "\u05d8\u05dc\u05e4\u05d5\u05df",
    clientSitesContextEmpty: "\u05d9\u05e9 \u05dc\u05d1\u05d7\u05d5\u05e8 \u05dc\u05e7\u05d5\u05d7 \u05db\u05d3\u05d9 \u05dc\u05e8\u05d0\u05d5\u05ea \u05d0\u05ea \u05d4\u05d0\u05ea\u05e8\u05d9\u05dd \u05e9\u05dc\u05d5.",
    clientContactsContextEmpty: "\u05e8\u05e9\u05d9\u05de\u05ea \u05d0\u05e0\u05e9\u05d9 \u05d4\u05e7\u05e9\u05e8 \u05e9\u05d9\u05d9\u05db\u05ea \u05dc\u05dc\u05e7\u05d5\u05d7 \u05d1\u05dc\u05d1\u05d3. \u05d1\u05d7\u05d9\u05e8\u05ea \u05d0\u05ea\u05e8 \u05dc\u05d0 \u05de\u05e9\u05e0\u05d4 \u05d0\u05d5\u05ea\u05d4.",
    clientSitesContext: "\u05d0\u05ea\u05e8\u05d9\u05dd \u05e2\u05d1\u05d5\u05e8",
    clientContactsContext: "\u05d0\u05e0\u05e9\u05d9 \u05e7\u05e9\u05e8 \u05e2\u05d1\u05d5\u05e8",
    noClients: "\u05e2\u05d3\u05d9\u05d9\u05df \u05d0\u05d9\u05df \u05dc\u05e7\u05d5\u05d7\u05d5\u05ea",
    noSites: "\u05e2\u05d3\u05d9\u05d9\u05df \u05d0\u05d9\u05df \u05d0\u05ea\u05e8\u05d9\u05dd \u05dc\u05dc\u05e7\u05d5\u05d7 \u05d4\u05d6\u05d4",
    noContacts: "\u05e2\u05d3\u05d9\u05d9\u05df \u05d0\u05d9\u05df \u05d0\u05e0\u05e9\u05d9 \u05e7\u05e9\u05e8 \u05dc\u05dc\u05e7\u05d5\u05d7 \u05d4\u05d6\u05d4",
    newClient: "\u05dc\u05e7\u05d5\u05d7 \u05d7\u05d3\u05e9",
    newSite: "\u05d0\u05ea\u05e8 \u05d7\u05d3\u05e9",
    newContact: "\u05d0\u05d9\u05e9 \u05e7\u05e9\u05e8 \u05d7\u05d3\u05e9",
    editClient: "\u05e2\u05e8\u05d9\u05db\u05ea \u05dc\u05e7\u05d5\u05d7",
    editSite: "\u05e2\u05e8\u05d9\u05db\u05ea \u05d0\u05ea\u05e8",
    editContact: "\u05e2\u05e8\u05d9\u05db\u05ea \u05d0\u05d9\u05e9 \u05e7\u05e9\u05e8",
    clientCreated: "\u05d4\u05dc\u05e7\u05d5\u05d7 \u05e0\u05d5\u05e1\u05e3",
    clientSaved: "\u05d4\u05dc\u05e7\u05d5\u05d7 \u05e0\u05e9\u05de\u05e8",
    clientDisabled: "\u05d4\u05dc\u05e7\u05d5\u05d7 \u05d4\u05d5\u05e9\u05d1\u05ea",
    clientEnabled: "\u05d4\u05dc\u05e7\u05d5\u05d7 \u05d4\u05d5\u05e4\u05e2\u05dc",
    clientSiteCreated: "\u05d4\u05d0\u05ea\u05e8 \u05e0\u05d5\u05e1\u05e3",
    clientSiteSaved: "\u05d4\u05d0\u05ea\u05e8 \u05e0\u05e9\u05de\u05e8",
    clientSiteDisabled: "\u05d4\u05d0\u05ea\u05e8 \u05d4\u05d5\u05e9\u05d1\u05ea",
    clientSiteEnabled: "\u05d4\u05d0\u05ea\u05e8 \u05d4\u05d5\u05e4\u05e2\u05dc",
    clientContactCreated: "\u05d0\u05d9\u05e9 \u05d4\u05e7\u05e9\u05e8 \u05e0\u05d5\u05e1\u05e3",
    clientContactSaved: "\u05d0\u05d9\u05e9 \u05d4\u05e7\u05e9\u05e8 \u05e0\u05e9\u05de\u05e8",
    clientContactDisabled: "\u05d0\u05d9\u05e9 \u05d4\u05e7\u05e9\u05e8 \u05d4\u05d5\u05e9\u05d1\u05ea",
    clientContactEnabled: "\u05d0\u05d9\u05e9 \u05d4\u05e7\u05e9\u05e8 \u05d4\u05d5\u05e4\u05e2\u05dc",
    selectClientFirst: "\u05d9\u05e9 \u05dc\u05d1\u05d7\u05d5\u05e8 \u05dc\u05e7\u05d5\u05d7 \u05e7\u05d5\u05d3\u05dd",
    manufacturersTitle: "יצרנים",
    manufacturersHint: "ניהול היררכיית ציוד לטופסי תקלות בשטח.",
    manufacturerList: "יצרנים",
    equipmentCategoryTitle: "דגם/ציוד",
    equipmentSubcategoryTitle: "רכיב/אזור",
    addManufacturer: "יצרן חדש",
    addEquipmentCategory: "דגם/ציוד חדש",
    addEquipmentSubcategory: "רכיב/אזור חדש",
    manufacturerName: "שם יצרן",
    equipmentCategoryName: "שם דגם/ציוד",
    equipmentSubcategoryName: "שם רכיב/אזור",
    status: "סטטוס",
    enable: "הפעלה",
    disable: "השבתה",
    manufacturerCreated: "היצרן נוסף",
    manufacturerSaved: "היצרן נשמר",
    manufacturerDisabled: "היצרן הושבת",
    manufacturerEnabled: "היצרן הופעל",
    categoryCreated: "הדגם/ציוד נוסף",
    categorySaved: "הדגם/ציוד נשמר",
    categoryDisabled: "הדגם/ציוד הושבת",
    categoryEnabled: "הדגם/ציוד הופעל",
    subcategoryCreated: "הרכיב/אזור נוסף",
    subcategorySaved: "הרכיב/אזור נשמר",
    subcategoryDisabled: "הרכיב/אזור הושבת",
    subcategoryEnabled: "הרכיב/אזור הופעל",
    selectManufacturerFirst: "יש לבחור יצרן קודם",
    selectCategoryFirst: "יש לבחור דגם/ציוד קודם",
    categoriesContextEmpty: "יש לבחור יצרן קודם.",
    subcategoriesContextEmpty: "יש לבחור דגם/ציוד קודם.",
    categoriesContext: "דגם/ציוד עבור",
    subcategoriesContext: "רכיב/אזור עבור",
    noManufacturers: "עדיין אין יצרנים",
    noCategories: "עדיין אין פריטי דגם/ציוד",
    noSubcategories: "עדיין אין פריטי רכיב/אזור",
    newManufacturer: "יצרן חדש",
    newCategory: "דגם/ציוד חדש",
    newSubcategory: "רכיב/אזור חדש",
    editManufacturer: "עריכת יצרן",
    editCategory: "עריכת דגם/ציוד",
    editSubcategory: "עריכת רכיב/אזור",
    all: "\u05d4\u05db\u05dc",
    faults: "\u05ea\u05e7\u05dc\u05d5\u05ea",
    faultsTitle: "\u05ea\u05e7\u05dc\u05d5\u05ea",
    faultsHint: "\u05de\u05e2\u05e7\u05d1 \u05d0\u05d7\u05e8 \u05ea\u05e7\u05dc\u05d5\u05ea \u05e9\u05e0\u05e4\u05ea\u05d7\u05d5 \u05e2\u05dc \u05d9\u05d3\u05d9 \u05de\u05e0\u05d4\u05dc\u05d9\u05dd \u05d5\u05d4\u05de\u05e9\u05da \u05d4\u05d8\u05d9\u05e4\u05d5\u05dc \u05d1\u05e6\u05d9\u05e8 \u05d4\u05d6\u05de\u05df.",
    faultList: "\u05e8\u05e9\u05d9\u05de\u05ea \u05ea\u05e7\u05dc\u05d5\u05ea",
    faultsTableHint: "\u05d4\u05d8\u05d1\u05dc\u05d4 \u05e0\u05e9\u05d0\u05e8\u05ea \u05e9\u05d8\u05d5\u05d7\u05d4. \u05dc\u05d7\u05d9\u05e6\u05d4 \u05db\u05e4\u05d5\u05dc\u05d4 \u05e2\u05dc \u05e9\u05d5\u05e8\u05ea \u05ea\u05e7\u05dc\u05d4 \u05ea\u05e4\u05ea\u05d7 \u05d0\u05ea \u05ea\u05e6\u05d5\u05d2\u05ea \u05d4\u05e4\u05e8\u05d8\u05d9\u05dd.",
    faultFilterStatus: "\u05e1\u05d8\u05d8\u05d5\u05e1",
    faultFilterClient: "\u05dc\u05e7\u05d5\u05d7",
    faultFilterManufacturer: "\u05d9\u05e6\u05e8\u05df",
    faultFilterSupport: "\u05e8\u05de\u05ea \u05ea\u05de\u05d9\u05db\u05d4",
    faultFilterFrom: "\u05de\u05ea\u05d0\u05e8\u05d9\u05da",
    faultFilterTo: "\u05e2\u05d3 \u05ea\u05d0\u05e8\u05d9\u05da",
    faultRunAction: "\u05d4\u05e6\u05d2",
    faultColCreated: "\u05ea\u05d0\u05e8\u05d9\u05da \u05e4\u05ea\u05d9\u05d7\u05d4",
    faultColClient: "\u05dc\u05e7\u05d5\u05d7",
    faultColSite: "\u05d0\u05ea\u05e8",
    faultColManufacturer: "\u05d9\u05e6\u05e8\u05df",
    faultColCategory: "\u05e7\u05d8\u05d2\u05d5\u05e8\u05d9\u05d4 / \u05ea\u05ea-\u05e7\u05d8\u05d2\u05d5\u05e8\u05d9\u05d4",
    faultColSupport: "\u05ea\u05de\u05d9\u05db\u05d4",
    faultColLastEvent: "\u05d0\u05d9\u05e8\u05d5\u05e2 \u05d0\u05d7\u05e8\u05d5\u05df",
    faultColStatus: "\u05e1\u05d8\u05d8\u05d5\u05e1",
    faultColDescription: "\u05ea\u05d9\u05d0\u05d5\u05e8",
    faultStatusOpen: "\u05e4\u05ea\u05d5\u05d7\u05d4",
    faultStatusClosed: "\u05e1\u05d2\u05d5\u05e8\u05d4",
    faultSupportLayer2: "\u05d1\u05ea\u05de\u05d9\u05db\u05ea L2",
    faultSupportUnder: "\u05d1\u05ea\u05de\u05d9\u05db\u05d4",
    faultSupportNone: "\u05dc\u05dc\u05d0 \u05ea\u05de\u05d9\u05db\u05d4",
    faultSummaryOne: "\u05ea\u05e7\u05dc\u05d4",
    faultSummaryMany: "\u05ea\u05e7\u05dc\u05d5\u05ea",
    faultNoResults: "\u05dc\u05d0 \u05e0\u05de\u05e6\u05d0\u05d5 \u05ea\u05e7\u05dc\u05d5\u05ea \u05dc\u05e4\u05d9 \u05d4\u05e1\u05d9\u05e0\u05d5\u05df \u05d4\u05e0\u05d5\u05db\u05d7\u05d9.",
    faultDetailTitle: "\u05e4\u05e8\u05d8\u05d9 \u05ea\u05e7\u05dc\u05d4",
    faultDetailOpenedBy: "\u05e0\u05e4\u05ea\u05d7\u05d4 \u05e2\u05dc \u05d9\u05d3\u05d9",
    faultDetailHardware: "\u05d7\u05d5\u05de\u05e8\u05d4",
    faultDetailContactsInline: "\u05d0\u05e0\u05e9\u05d9 \u05e7\u05e9\u05e8:",
    faultDetailSupport: "\u05e8\u05de\u05ea \u05ea\u05de\u05d9\u05db\u05d4",
    faultDetailSerial: "\u05de\u05e1\u05e4\u05e8 \u05e1\u05d9\u05e8\u05d9\u05d0\u05dc\u05d9 / \u05d9\u05d7\u05d9\u05d3\u05d4",
    faultDetailTicket: "\u05de\u05e1\u05e4\u05e8 \u05e4\u05e0\u05d9\u05d9\u05d4 \u05d0\u05e6\u05dc \u05d4\u05d9\u05e6\u05e8\u05df",
    faultDetailDescription: "\u05ea\u05d9\u05d0\u05d5\u05e8 \u05d4\u05ea\u05e7\u05dc\u05d4",
    faultDetailTimeline: "\u05ea\u05d4\u05dc\u05d9\u05da \u05d4\u05d8\u05d9\u05e4\u05d5\u05dc",
    faultProcessColStatus: "\u05e1\u05d8\u05d8\u05d5\u05e1",
    faultProcessColCreated: "\u05ea\u05d0\u05e8\u05d9\u05da \u05d9\u05e6\u05d9\u05e8\u05d4",
    faultProcessColName: "\u05e9\u05dd",
    faultProcessColCreatedBy: "\u05e0\u05d5\u05e6\u05e8 \u05e2\u05dc \u05d9\u05d3\u05d9",
    faultProcessColDescription: "\u05ea\u05d9\u05d0\u05d5\u05e8",
    faultProcessColOrder: "\u05de\u05e1\u05e4\u05e8 \u05d4\u05d6\u05de\u05e0\u05d4 / \u05de\u05e2\u05e7\u05d1",
    faultProcessActive: "Active",
    faultProcessDone: "Done",
    faultEventTitle: "\u05db\u05d5\u05ea\u05e8\u05ea \u05d4\u05d0\u05d9\u05e8\u05d5\u05e2",
    faultEventOrder: "\u05de\u05e1\u05e4\u05e8 \u05d4\u05d6\u05de\u05e0\u05d4 / \u05de\u05e2\u05e7\u05d1",
    faultEventDetails: "\u05e4\u05e8\u05d8\u05d9 \u05d4\u05d0\u05d9\u05e8\u05d5\u05e2",
    faultEventModalTitle: "\u05d4\u05d5\u05e1\u05e4\u05ea \u05d0\u05d9\u05e8\u05d5\u05e2",
    faultEventSaveAction: "\u05e9\u05de\u05d9\u05e8\u05ea \u05d0\u05d9\u05e8\u05d5\u05e2",
    faultSaveAction: "\u05e9\u05de\u05d9\u05e8\u05ea \u05ea\u05e7\u05dc\u05d4",
    faultAddEventAction: "\u05d4\u05d5\u05e1\u05e4\u05ea \u05d0\u05d9\u05e8\u05d5\u05e2",
    faultCloseAction: "\u05e1\u05d2\u05d9\u05e8\u05ea \u05ea\u05e7\u05dc\u05d4",
    faultReopenAction: "\u05e4\u05ea\u05d9\u05d7\u05ea \u05ea\u05e7\u05dc\u05d4 \u05de\u05d7\u05d3\u05e9",
    faultCloseModalAction: "\u05e1\u05d2\u05d9\u05e8\u05d4",
    faultNoEvents: "\u05e2\u05d3\u05d9\u05d9\u05df \u05d0\u05d9\u05df \u05d0\u05d9\u05e8\u05d5\u05e2\u05d9\u05dd.",
    faultSaved: "\u05d4\u05ea\u05e7\u05dc\u05d4 \u05e0\u05e9\u05de\u05e8\u05d4.",
    faultMarkedClosed: "\u05d4\u05ea\u05e7\u05dc\u05d4 \u05e1\u05d5\u05de\u05e0\u05d4 \u05db\u05e1\u05d2\u05d5\u05e8\u05d4.",
    faultMarkedOpen: "\u05d4\u05ea\u05e7\u05dc\u05d4 \u05e1\u05d5\u05de\u05e0\u05d4 \u05db\u05e4\u05ea\u05d5\u05d7\u05d4.",
    faultEventAdded: "\u05d4\u05d0\u05d9\u05e8\u05d5\u05e2 \u05e0\u05d5\u05e1\u05e3.",
  },
};

export function currentLang() {
  return ADMIN_SETTINGS.admin_language === "he" ? "he" : "en";
}

export function t(key) {
  return I18N[currentLang()]?.[key] || I18N.en[key] || key;
}

function setText(selector, key) {
  const el = document.querySelector(selector);
  if (el) el.textContent = t(key);
}

function setLabel(forId, key) {
  setText(`label[for="${forId}"]`, key);
}

function setPlaceholder(id, key) {
  const el = $id(id);
  if (el) el.placeholder = t(key);
}

function setContext(id, text) {
  const el = $id(id);
  if (el) el.textContent = text;
}

export function updateStaticText() {
  document.documentElement.lang = currentLang();
  document.documentElement.dir = currentLang() === "he" ? "rtl" : "ltr";

  setText(".brand-title", "appTitle");
  setText(".brand-sub", "adminPanel");
  setText('.nav-tab[data-tab="employees"]', "employees");
  setText('.nav-tab[data-tab="projects"]', "projects");
  setText('.nav-tab[data-tab="clients"]', "clients");
  setText('.nav-tab[data-tab="manufacturers"]', "manufacturers");
  setText('.nav-tab[data-tab="faults"]', "faults");
  setText('.nav-tab[data-tab="stats"]', "stats");
  setText('.nav-tab[data-tab="settings"]', "settings");
  setText("#btn-logout", "logout");

  setText('.tab-panel[data-panel="employees"] .page-header h1', "employeeTitle");
  setText('.tab-panel[data-panel="employees"] .page-hint', "employeeHint");
  setText('.tab-panel[data-panel="employees"] .pane-title', "employeeList");
  setText("#btn-emp-reload", "refresh");
  setText('.tab-panel[data-panel="employees"] details:nth-of-type(1) summary', "addEmployee");
  setText('.tab-panel[data-panel="employees"] details:nth-of-type(2) summary', "editSelected");

  setLabel("emp-add-first", "firstName");
  setLabel("emp-add-last", "lastName");
  setLabel("emp-add-passport", "passport");
  setLabel("emp-add-car", "car");
  setLabel("emp-add-card", "card");
  setLabel("emp-add-phone", "phone");
  setLabel("emp-add-email", "email");
  setText('[data-i18n-key="manager"]', "manager");
  setLabel("emp-add-rate", "dailyRate");
  setLabel("emp-add-login", "login");
  setLabel("emp-add-pass", "password");
  setText("#btn-emp-create", "add");

  setLabel("emp-edit-first", "firstName");
  setLabel("emp-edit-last", "lastName");
  setLabel("emp-edit-passport", "passport");
  setLabel("emp-edit-car", "car");
  setLabel("emp-edit-card", "card");
  setLabel("emp-edit-phone", "phone");
  setLabel("emp-edit-email", "email");
  document.querySelectorAll('[data-i18n-key="manager"]').forEach((el) => {
    el.textContent = t("manager");
  });
  setLabel("emp-edit-rate", "dailyRate");
  setLabel("emp-edit-login", "login");
  setLabel("emp-edit-pass", "newPassword");
  setText("#btn-emp-save", "save");
  setText("#btn-emp-delete", "delete");
  setText('.tab-panel[data-panel="employees"] .form-row .label', "selected");

  setText('.tab-panel[data-panel="projects"] .page-header h1', "projectTitle");
  setText('.tab-panel[data-panel="projects"] .page-hint', "projectHint");
  setText('.tab-panel[data-panel="projects"] .pane-title', "projectList");
  setText("#btn-prj-reload", "refresh");
  setText('.tab-panel[data-panel="projects"] details:nth-of-type(1) summary', "addProject");
  setText('.tab-panel[data-panel="projects"] details:nth-of-type(2) summary', "editSelected");
  setText('.tab-panel[data-panel="projects"] details:nth-of-type(2) .form-row .label', "selected");
  setLabel("prj-add-name", "projectName");
  setLabel("prj-edit-name", "projectName");
  setLabel("prj-edit-active", "active");
  setText("#btn-prj-create", "add");
  setText("#btn-prj-save", "save");
  setText("#btn-prj-delete", "delete");

  setText('.tab-panel[data-panel="clients"] .page-header h1', "clientsTitle");
  setText('.tab-panel[data-panel="clients"] .page-hint', "clientsHint");
  setText('[data-i18n-key="clientList"]', "clientList");
  setText('[data-i18n-key="clientSiteList"]', "clientSiteList");
  setText('[data-i18n-key="clientContactList"]', "clientContactList");
  setText("#btn-client-edit-open", "editAction");
  setText("#btn-client-create-open", "createAction");
  setText("#btn-client-site-edit-open", "editAction");
  setText("#btn-client-site-create-open", "createAction");
  setText("#btn-client-contact-edit-open", "editAction");
  setText("#btn-client-contact-create-open", "createAction");
  setLabel("client-edit-modal-email", "clientContactEmail");
  setLabel("client-edit-modal-phone", "clientContactPhone");
  setLabel("client-edit-modal-active", "status");
  setText("#btn-client-edit-save", "save");
  setText("#btn-client-edit-cancel", "cancel");

  setText('.tab-panel[data-panel="manufacturers"] .page-header h1', "manufacturersTitle");
  setText('.tab-panel[data-panel="manufacturers"] .page-hint', "manufacturersHint");
  setText('[data-i18n-key="manufacturersTitle"]', "manufacturerList");
  setText('[data-i18n-key="equipmentCategoryTitle"]', "equipmentCategoryTitle");
  setText('[data-i18n-key="equipmentSubcategoryTitle"]', "equipmentSubcategoryTitle");
  setText("#btn-fault-mfr-edit-open", "editAction");
  setText("#btn-fault-mfr-create-open", "createAction");
  setText("#btn-fault-cat-edit-open", "editAction");
  setText("#btn-fault-cat-create-open", "createAction");
  setText("#btn-fault-sub-edit-open", "editAction");
  setText("#btn-fault-sub-create-open", "createAction");
  setLabel("fault-edit-modal-active", "status");
  setText("#btn-fault-edit-save", "save");
  setText("#btn-fault-edit-cancel", "cancel");

  setText('.tab-panel[data-panel="faults"] .page-header h1', "faultsTitle");
  setText('.tab-panel[data-panel="faults"] .page-hint', "faultsHint");
  setText('.tab-panel[data-panel="faults"] .pane-title', "faultList");
  setText('.tab-panel[data-panel="faults"] .pane-context', "faultsTableHint");
  setLabel("fault-filter-status", "faultFilterStatus");
  setLabel("fault-filter-client", "faultFilterClient");
  setLabel("fault-filter-manufacturer", "faultFilterManufacturer");
  setLabel("fault-filter-support", "faultFilterSupport");
  setLabel("fault-filter-date-from", "faultFilterFrom");
  setLabel("fault-filter-date-to", "faultFilterTo");
  setText("#btn-faults-run", "faultRunAction");
  setText("#btn-faults-clear", "clear");

  setText("#fault-detail-title", "faultDetailTitle");
  setText("#fault-detail-opened-by-label", "faultDetailOpenedBy");
  setText("#fault-detail-hardware-label", "faultDetailHardware");
  setText('label[for="fault-detail-support"]', "faultDetailSupport");
  setText('label[for="fault-detail-serial"]', "faultDetailSerial");
  setText('label[for="fault-detail-ticket"]', "faultDetailTicket");
  setText('label[for="fault-detail-description"]', "faultDetailDescription");
  setText('label[for="fault-event-title"]', "faultEventTitle");
  setText('label[for="fault-event-order-id"]', "faultEventOrder");
  setText('label[for="fault-event-details"]', "faultEventDetails");
  setText("#fault-detail-timeline-label", "faultDetailTimeline");
  setText("#fault-event-modal-title", "faultEventModalTitle");
  setText("#btn-fault-detail-save", "faultSaveAction");
  setText("#btn-fault-detail-add-event", "faultAddEventAction");
  setText("#btn-fault-detail-cancel", "faultCloseModalAction");
  setText("#btn-fault-event-save", "faultEventSaveAction");
  setText("#btn-fault-event-cancel", "cancel");

  setText('.tab-panel[data-panel="stats"] .page-header h1', "statsTitle");
  setText('.tab-panel[data-panel="stats"] .page-hint', "statsHint");
  setText('.tab-panel[data-panel="stats"] .pane-title', "report");
  setLabel("stats-mode", "type");
  setLabel("stats-month", "month");
  setLabel("stats-emp", "employee");
  setLabel("stats-prj", "project");
  setText("#btn-stats-run", "run");

  setText('.tab-panel[data-panel="settings"] .page-header h1', "settingsTitle");
  setText('.tab-panel[data-panel="settings"] .page-hint', "settingsHint");
  setLabel("setting-language", "language");
  setLabel("setting-workday-hours", "workdayHours");
  setText("#btn-settings-save", "saveSettings");

  setText("#admin-status", "ready");

  setPlaceholder("emp-search", "search");
  setPlaceholder("prj-search", "search");
  setPlaceholder("client-search", "search");
  setPlaceholder("client-site-search", "search");
  setPlaceholder("client-contact-search", "search");
  setPlaceholder("fault-mfr-search", "search");
  setPlaceholder("fault-cat-search", "search");
  setPlaceholder("fault-sub-search", "search");
  setPlaceholder("emp-add-passport", "optional");
  setPlaceholder("emp-add-car", "optional");
  setPlaceholder("emp-add-card", "optional");
  setPlaceholder("emp-add-phone", "optional");
  setPlaceholder("emp-add-email", "optional");
  setPlaceholder("emp-edit-passport", "optional");
  setPlaceholder("emp-edit-car", "optional");
  setPlaceholder("emp-edit-card", "optional");
  setPlaceholder("emp-edit-phone", "optional");
  setPlaceholder("emp-edit-email", "optional");
  setPlaceholder("emp-edit-pass", "keepEmpty");

  const statsMode = $id("stats-mode");
  if (statsMode) {
    statsMode.querySelector('option[value="employee"]').textContent = t("employeeMonthly");
    statsMode.querySelector('option[value="project"]').textContent = t("projectMonthly");
    statsMode.querySelector('option[value="contractors"]').textContent = t("contractorsMonthly");
  }

  const activeOpt = $id("prj-edit-active");
  if (activeOpt) {
    activeOpt.querySelector('option[value="1"]').textContent = t("activeValue");
    activeOpt.querySelector('option[value="0"]').textContent = t("disabledValue");
  }
  [
    "client-edit-modal-active",
    "fault-edit-modal-active",
  ].forEach((id) => {
    const select = $id(id);
    if (!select) return;
    select.querySelector('option[value="1"]').textContent = t("activeValue");
    select.querySelector('option[value="0"]').textContent = t("disabledValue");
  });

  const faultStatusFilter = $id("fault-filter-status");
  if (faultStatusFilter) {
    faultStatusFilter.querySelector('option[value=""]').textContent = t("all");
    faultStatusFilter.querySelector('option[value="open"]').textContent = t("faultStatusOpen");
    faultStatusFilter.querySelector('option[value="closed"]').textContent = t("faultStatusClosed");
  }

  const faultSupportFilter = $id("fault-filter-support");
  if (faultSupportFilter) {
    faultSupportFilter.querySelector('option[value=""]').textContent = t("all");
    faultSupportFilter.querySelector('option[value="layer2_support"]').textContent = t("faultSupportLayer2");
    faultSupportFilter.querySelector('option[value="under_support"]').textContent = t("faultSupportUnder");
    faultSupportFilter.querySelector('option[value="no_support"]').textContent = t("faultSupportNone");
  }

  const faultDetailSupport = $id("fault-detail-support");
  if (faultDetailSupport) {
    faultDetailSupport.querySelector('option[value="layer2_support"]').textContent = t("faultSupportLayer2");
    faultDetailSupport.querySelector('option[value="under_support"]').textContent = t("faultSupportUnder");
    faultDetailSupport.querySelector('option[value="no_support"]').textContent = t("faultSupportNone");
  }

  fillStatsPickers();
  fillEmployeeEdit(selectedEmployee);
  fillProjectEdit(selectedProject);
  fillClientEdit(selectedClient);
  fillClientSiteEdit(selectedClientSite);
  fillClientContactEdit(selectedClientContact);
  fillFaultManufacturerEdit(selectedFaultManufacturer);
  fillFaultCategoryEdit(selectedFaultCategory);
  fillFaultSubcategoryEdit(selectedFaultSubcategory);
  fillClientEditModal();
  fillFaultEditModal();
  if ($id("emp-list")) renderEmployeeList($id("emp-search")?.value || "");
  if ($id("prj-list")) renderProjectList($id("prj-search")?.value || "");
  if ($id("client-list")) renderClientList($id("client-search")?.value || "");
  if ($id("client-site-list")) renderClientSiteList($id("client-site-search")?.value || "");
  if ($id("client-contact-list")) renderClientContactList($id("client-contact-search")?.value || "");
  if ($id("fault-mfr-list")) renderFaultManufacturerList($id("fault-mfr-search")?.value || "");
  if ($id("fault-cat-list")) renderFaultCategoryList($id("fault-cat-search")?.value || "");
  if ($id("fault-sub-list")) renderFaultSubcategoryList($id("fault-sub-search")?.value || "");
}

export function setAdminSettings(settings) {
  ADMIN_SETTINGS = { ...DEFAULT_ADMIN_SETTINGS, ...(settings || {}) };
  return ADMIN_SETTINGS;
}

export function updateAdminLanguage(language) {
  ADMIN_SETTINGS = { ...ADMIN_SETTINGS, admin_language: language };
}
