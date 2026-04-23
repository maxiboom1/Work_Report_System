/* =========================================================
   Employee Work Report System — Admin UI
   ========================================================= */

async function api(path, options) {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  let body = null;
  try { body = await res.json(); } catch {}
  if (!res.ok) {
    const message = body?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body;
}

function $id(id) { return document.getElementById(id); }

function todayMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const DEFAULT_ADMIN_SETTINGS = {
  admin_language: "en",
  workday_hours: 9,
};

let ADMIN_SETTINGS = { ...DEFAULT_ADMIN_SETTINGS };

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
    save: "Save",
    delete: "Delete",
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
    editClient: "Edit client",
    editSite: "Edit site",
    editContact: "Edit contact manager",
    cancel: "Cancel",
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
    addEmployee: "עובד חדש",
    editSelected: "עריכת עובד",
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
    save: "שמירה",
    delete: "מחיקה",
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
    editClient: "\u05e2\u05e8\u05d9\u05db\u05ea \u05dc\u05e7\u05d5\u05d7",
    editSite: "\u05e2\u05e8\u05d9\u05db\u05ea \u05d0\u05ea\u05e8",
    editContact: "\u05e2\u05e8\u05d9\u05db\u05ea \u05d0\u05d9\u05e9 \u05e7\u05e9\u05e8",
    cancel: "\u05d1\u05d9\u05d8\u05d5\u05dc",
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
  },
};

function currentLang() {
  return ADMIN_SETTINGS.admin_language === "he" ? "he" : "en";
}

function t(key) {
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

function updateStaticText() {
  document.documentElement.lang = currentLang();
  document.documentElement.dir = currentLang() === "he" ? "rtl" : "ltr";

  setText(".brand-title", "appTitle");
  setText(".brand-sub", "adminPanel");
  setText('.nav-tab[data-tab="employees"]', "employees");
  setText('.nav-tab[data-tab="projects"]', "projects");
  setText('.nav-tab[data-tab="clients"]', "clients");
  setText('.nav-tab[data-tab="manufacturers"]', "manufacturers");
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
  setLabel("client-add-name", "addClient");
  setLabel("client-site-add-name", "addClientSite");
  setLabel("client-contact-add-name", "clientContactName");
  setLabel("client-contact-add-email", "clientContactEmail");
  setLabel("client-contact-add-phone", "clientContactPhone");
  setText("#btn-client-create", "add");
  setText("#btn-client-reload", "refresh");
  setText("#btn-client-site-create", "add");
  setText("#btn-client-site-reload", "refresh");
  setText("#btn-client-contact-create", "add");
  setText("#btn-client-contact-reload", "refresh");
  setText('.tab-panel[data-panel="clients"] [data-i18n-key="addClientSite"]', "addClientSite");
  setText('.tab-panel[data-panel="clients"] [data-i18n-key="addContactManager"]', "addContactManager");
  setLabel("client-edit-modal-name", "clientName");
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
  setLabel("fault-mfr-add-name", "addManufacturer");
  setLabel("fault-mfr-edit-name", "manufacturerName");
  setLabel("fault-mfr-edit-active", "status");
  setLabel("fault-cat-add-name", "addEquipmentCategory");
  setLabel("fault-cat-edit-name", "equipmentCategoryName");
  setLabel("fault-cat-edit-active", "status");
  setLabel("fault-sub-add-name", "addEquipmentSubcategory");
  setLabel("fault-sub-edit-name", "equipmentSubcategoryName");
  setLabel("fault-sub-edit-active", "status");
  setText("#btn-fault-mfr-create", "add");
  setText("#btn-fault-mfr-save", "save");
  setText("#btn-fault-mfr-reload", "refresh");
  setText("#btn-fault-cat-create", "add");
  setText("#btn-fault-cat-save", "save");
  setText("#btn-fault-cat-reload", "refresh");
  setText("#btn-fault-sub-create", "add");
  setText("#btn-fault-sub-save", "save");
  setText("#btn-fault-sub-reload", "refresh");

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
  setPlaceholder("client-contact-add-phone", "optional");
  setPlaceholder("client-contact-edit-phone", "optional");
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
    "fault-mfr-edit-active",
    "fault-cat-edit-active",
    "fault-sub-edit-active",
  ].forEach((id) => {
    const select = $id(id);
    if (!select) return;
    select.querySelector('option[value="1"]').textContent = t("activeValue");
    select.querySelector('option[value="0"]').textContent = t("disabledValue");
  });

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
  if ($id("emp-list")) renderEmployeeList($id("emp-search")?.value || "");
  if ($id("prj-list")) renderProjectList($id("prj-search")?.value || "");
  if ($id("client-list")) renderClientList($id("client-search")?.value || "");
  if ($id("client-site-list")) renderClientSiteList($id("client-site-search")?.value || "");
  if ($id("client-contact-list")) renderClientContactList($id("client-contact-search")?.value || "");
  if ($id("fault-mfr-list")) renderFaultManufacturerList($id("fault-mfr-search")?.value || "");
  if ($id("fault-cat-list")) renderFaultCategoryList($id("fault-cat-search")?.value || "");
  if ($id("fault-sub-list")) renderFaultSubcategoryList($id("fault-sub-search")?.value || "");
}

async function refreshStatsIfRendered() {
  if (!$id("stats-table")?.querySelector("table")) return;
  try {
    await runStats();
  } catch (e) {
    $id("stats-summary").textContent = e.message;
  }
}

// =========================
// Tabs
// =========================

function initTabs() {
  const tabs = Array.from(document.querySelectorAll(".nav-tab"));
  const panels = Array.from(document.querySelectorAll(".tab-panel"));

  // Accordion behavior for <details> sections:
  // - only one open at a time per visible panel
  // - start with all closed
  function closeAllDetails(scope = document) {
    scope.querySelectorAll("details").forEach((d) => { d.open = false; });
  }

  function wireAccordion(scope = document) {
    const all = Array.from(scope.querySelectorAll("details"));
    for (const d of all) {
      if (d.dataset.accWired === "1") continue;
      d.dataset.accWired = "1";
      d.addEventListener("toggle", () => {
        if (!d.open) return;
        // Close other details in the same tab-panel (preferred), otherwise in provided scope.
        const panel = d.closest(".tab-panel") || scope;
        panel.querySelectorAll("details").forEach((other) => {
          if (other !== d) other.open = false;
        });
      });
    }
  }

  function show(key) {
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === key));
    panels.forEach((p) => p.classList.toggle("is-active", p.dataset.panel === key));

    // When switching tabs, ensure all <details> are closed.
    closeAllDetails(document);
  }

  tabs.forEach((t) => t.addEventListener("click", () => show(t.dataset.tab)));
  // Wire accordion behavior once, then start from a fully collapsed state.
  wireAccordion(document);
  closeAllDetails(document);
  show("employees");
}

// =========================
// Employees
// =========================

let EMPLOYEES = [];
let selectedEmployee = null;

function renderEmployeeList(filter = "") {
  const list = $id("emp-list");
  list.innerHTML = "";
  const f = filter.toLowerCase();
  const rows = EMPLOYEES.filter((e) => {
    // Admin user is not returned from the API, but keep this filter defensive.
    if (String(e.role || "").toLowerCase() === "admin") return false;
    const s = `${e.first_name} ${e.last_name} ${e.login}`.toLowerCase();
    return !f || s.includes(f);
  });

  for (const e of rows) {
    const item = document.createElement("button");
    item.className = "vitem";
    item.type = "button";
    const name = document.createElement("span");
    name.textContent = `${e.last_name}, ${e.first_name}`;
    item.appendChild(name);
    if (e.is_manager) {
      const badge = document.createElement("span");
      badge.className = "muted";
      badge.textContent = ` ${t("manager")}`;
      item.appendChild(badge);
    }
    item.dataset.id = e.id;
    if (selectedEmployee?.id === e.id) item.classList.add("active");
    item.addEventListener("click", () => selectEmployee(e.id));
    list.appendChild(item);
  }
}

function fillEmployeeEdit(e) {
  $id("emp-selected").textContent = e ? `${e.last_name}, ${e.first_name}` : t("none");
  $id("emp-edit-first").value = e?.first_name || "";
  $id("emp-edit-last").value = e?.last_name || "";
  // Optional IDs
  const passportEl = document.getElementById("emp-edit-passport");
  const carEl = document.getElementById("emp-edit-car");
  const cardEl = document.getElementById("emp-edit-card");
  const phoneEl = document.getElementById("emp-edit-phone");
  const emailEl = document.getElementById("emp-edit-email");
  const managerEl = document.getElementById("emp-edit-manager");
  if (passportEl) passportEl.value = e?.passport_id || "";
  if (carEl) carEl.value = e?.car_id || "";
  if (cardEl) cardEl.value = e?.card_id || "";
  if (phoneEl) phoneEl.value = e?.phone || "";
  if (emailEl) emailEl.value = e?.email || "";
  if (managerEl) managerEl.checked = Boolean(e?.is_manager);
  $id("emp-edit-rate").value = (e?.daily_rate ?? "");
  $id("emp-edit-login").value = e?.login || "";
  $id("emp-edit-pass").value = "";
}

function selectEmployee(id) {
  selectedEmployee = EMPLOYEES.find((x) => String(x.id) === String(id)) || null;
  fillEmployeeEdit(selectedEmployee);
  renderEmployeeList($id("emp-search").value);
}

async function loadEmployees() {
  const r = await api("/admin/employees");
  EMPLOYEES = r.employees || [];
  if (selectedEmployee) {
    const still = EMPLOYEES.find((x) => x.id === selectedEmployee.id);
    selectedEmployee = still || null;
  }
  renderEmployeeList($id("emp-search").value);
  fillEmployeeEdit(selectedEmployee);
}

async function createEmployee() {
  const payload = {
    first_name: $id("emp-add-first").value,
    last_name: $id("emp-add-last").value,
    passport_id: ($id("emp-add-passport")?.value || ""),
    car_id: ($id("emp-add-car")?.value || ""),
    card_id: ($id("emp-add-card")?.value || ""),
    phone: ($id("emp-add-phone")?.value || ""),
    email: ($id("emp-add-email")?.value || ""),
    daily_rate: Number($id("emp-add-rate").value),
    login: $id("emp-add-login").value,
    password: $id("emp-add-pass").value,
    is_manager: $id("emp-add-manager")?.checked || false,
  };
  const r = await api("/admin/employees", { method: "POST", body: JSON.stringify(payload) });
  $id("emp-add-note").textContent = r.message ? t("employeeCreated") : t("employeeCreated");
  $id("emp-add-pass").value = "";
  await loadEmployees();
}

async function saveEmployee() {
  if (!selectedEmployee) return;
  const payload = {
    first_name: $id("emp-edit-first").value,
    last_name: $id("emp-edit-last").value,
    passport_id: ($id("emp-edit-passport")?.value || ""),
    car_id: ($id("emp-edit-car")?.value || ""),
    card_id: ($id("emp-edit-card")?.value || ""),
    phone: ($id("emp-edit-phone")?.value || ""),
    email: ($id("emp-edit-email")?.value || ""),
    daily_rate: Number($id("emp-edit-rate").value),
    login: $id("emp-edit-login").value,
    password: $id("emp-edit-pass").value,
    is_manager: $id("emp-edit-manager")?.checked || false,
  };
  const r = await api(`/admin/employees/${selectedEmployee.id}`, { method: "PUT", body: JSON.stringify(payload) });
  $id("emp-edit-note").textContent = r.message ? t("employeeSaved") : t("employeeSaved");
  await loadEmployees();
}

async function deleteEmployee() {
  if (!selectedEmployee) return;
  if (!confirm(`${t("deleteEmployeeConfirm")} ${selectedEmployee.first_name} ${selectedEmployee.last_name}?`)) return;
  const r = await api(`/admin/employees/${selectedEmployee.id}`, { method: "DELETE" });
  $id("emp-edit-note").textContent = r.message ? t("employeeDeleted") : t("employeeDeleted");
  selectedEmployee = null;
  await loadEmployees();
}

// =========================
// Projects
// =========================

let PROJECTS = [];
let selectedProject = null;

function renderProjectList(filter = "") {
  const list = $id("prj-list");
  list.innerHTML = "";
  const f = filter.toLowerCase();
  const rows = PROJECTS.filter((p) => !f || String(p.name || "").toLowerCase().includes(f));

  for (const p of rows) {
    const item = document.createElement("button");
    item.className = "vitem";
    item.type = "button";
    const suffix = p.is_active ? "" : ` (${t("disabledValue")})`;
    item.textContent = `${p.name}${suffix}`;
    if (selectedProject?.id === p.id) item.classList.add("active");
    item.addEventListener("click", () => selectProject(p.id));
    list.appendChild(item);
  }
}

function fillProjectEdit(p) {
  $id("prj-selected").textContent = p ? p.name : t("none");
  $id("prj-edit-name").value = p?.name || "";
  $id("prj-edit-active").value = p?.is_active ? "1" : "0";
}

function selectProject(id) {
  selectedProject = PROJECTS.find((x) => String(x.id) === String(id)) || null;
  fillProjectEdit(selectedProject);
  renderProjectList($id("prj-search").value);
}

async function loadProjects() {
  const r = await api("/admin/projects");
  PROJECTS = r.projects || [];
  if (selectedProject) {
    const still = PROJECTS.find((x) => x.id === selectedProject.id);
    selectedProject = still || null;
  }
  renderProjectList($id("prj-search").value);
  fillProjectEdit(selectedProject);
  fillStatsPickers();
}

async function createProject() {
  const name = $id("prj-add-name").value;
  const r = await api("/admin/projects", { method: "POST", body: JSON.stringify({ name }) });
  $id("prj-add-note").textContent = r.message ? t("projectCreated") : t("projectCreated");
  $id("prj-add-name").value = "";
  await loadProjects();
}

async function saveProject() {
  if (!selectedProject) return;
  const payload = {
    name: $id("prj-edit-name").value,
    is_active: $id("prj-edit-active").value === "1",
  };
  const r = await api(`/admin/projects/${selectedProject.id}`, { method: "PUT", body: JSON.stringify(payload) });
  $id("prj-edit-note").textContent = r.message ? t("projectSaved") : t("projectSaved");
  await loadProjects();
}

async function deleteProject() {
  if (!selectedProject) return;
  if (!confirm(`${t("deleteProjectConfirm")} ${selectedProject.name}?`)) return;
  const r = await api(`/admin/projects/${selectedProject.id}`, { method: "DELETE" });
  $id("prj-edit-note").textContent = r.message ? t("projectDeleted") : t("projectDeleted");
  selectedProject = null;
  await loadProjects();
}

// =========================
// Clients hierarchy
// =========================

let CLIENTS = [];
let CLIENT_SITES = [];
let CLIENT_CONTACTS = [];
let selectedClient = null;
let selectedClientSite = null;
let selectedClientContact = null;
let clientEditModalState = null;

function setClientControlsDisabled(ids, disabled) {
  ids.forEach((id) => {
    const el = $id(id);
    if (el) el.disabled = disabled;
  });
}

function contactLabel(contact) {
  if (!contact) return "";
  const base = `${contact.name || ""} (${contact.email || "-"})`;
  return contact.is_active ? base : `${base} (${t("disabledValue")})`;
}

function renderEmptyList(list, message) {
  const empty = document.createElement("div");
  empty.className = "vitem-empty";
  empty.textContent = message;
  list.appendChild(empty);
}

function currentClientEditItem() {
  if (!clientEditModalState) return null;
  if (clientEditModalState.kind === "client") return selectedClient;
  if (clientEditModalState.kind === "site") return selectedClientSite;
  if (clientEditModalState.kind === "contact") return selectedClientContact;
  return null;
}

function openClientEditModal(kind, id) {
  if (kind === "client") {
    selectedClient = CLIENTS.find((item) => String(item.id) === String(id)) || null;
    if (!selectedClient) return;
    clientEditModalState = { kind };
  } else if (kind === "site") {
    selectedClientSite = CLIENT_SITES.find((item) => String(item.id) === String(id)) || null;
    if (!selectedClientSite) return;
    clientEditModalState = { kind };
  } else if (kind === "contact") {
    selectedClientContact = CLIENT_CONTACTS.find((item) => String(item.id) === String(id)) || null;
    if (!selectedClientContact) return;
    clientEditModalState = { kind };
  } else {
    return;
  }

  fillClientEditModal();
  $id("client-edit-modal")?.classList.remove("is-hidden");
  $id("client-edit-modal")?.setAttribute("aria-hidden", "false");
  $id("client-edit-modal-name")?.focus();
}

function closeClientEditModal() {
  clientEditModalState = null;
  $id("client-edit-modal-note").textContent = "";
  $id("client-edit-modal")?.classList.add("is-hidden");
  $id("client-edit-modal")?.setAttribute("aria-hidden", "true");
}

function fillClientEditModal() {
  const item = currentClientEditItem();
  const kind = clientEditModalState?.kind;
  const isContact = kind === "contact";
  const context = kind === "client"
    ? item?.name || ""
    : `${selectedClient?.name || ""}${item?.name ? ` • ${item.name}` : ""}`;

  setText("#client-edit-modal-title", kind === "client" ? "editClient" : kind === "site" ? "editSite" : kind === "contact" ? "editContact" : "editSelectedItem");
  setContext("client-edit-modal-context", context);

  if ($id("client-edit-modal-name-label")) {
    $id("client-edit-modal-name-label").textContent = t(
      kind === "client" ? "clientName" : kind === "site" ? "clientSiteName" : "clientContactName"
    );
  }

  if ($id("client-edit-modal-name")) $id("client-edit-modal-name").value = item?.name || "";
  if ($id("client-edit-modal-email")) $id("client-edit-modal-email").value = isContact ? item?.email || "" : "";
  if ($id("client-edit-modal-phone")) $id("client-edit-modal-phone").value = isContact ? item?.phone || "" : "";
  if ($id("client-edit-modal-active")) $id("client-edit-modal-active").value = item?.is_active ? "1" : "0";
  $id("btn-client-edit-toggle").textContent = item?.is_active ? t("disable") : t("enable");
  $id("client-edit-modal-email-row")?.classList.toggle("is-hidden", !isContact);
  $id("client-edit-modal-phone-row")?.classList.toggle("is-hidden", !isContact);
}

function renderClientList(filter = "") {
  const list = $id("client-list");
  if (!list) return;
  list.innerHTML = "";
  const f = filter.toLowerCase();
  const rows = CLIENTS.filter((item) => !f || String(item.name || "").toLowerCase().includes(f));

  if (rows.length === 0) {
    renderEmptyList(list, t("noClients"));
    return;
  }

  for (const item of rows) {
    const btn = document.createElement("button");
    btn.className = "vitem";
    btn.type = "button";
    btn.textContent = itemLabel(item);
    if (selectedClient?.id === item.id) btn.classList.add("active");
    btn.addEventListener("click", () => selectClient(item.id));
    btn.addEventListener("dblclick", () => openClientEditModal("client", item.id));
    list.appendChild(btn);
  }
}

function fillClientEdit(item) {
  setContext("client-site-context", item ? `${t("clientSitesContext")} ${item.name}` : t("clientSitesContextEmpty"));
  setContext("client-contact-context", item ? `${t("clientContactsContext")} ${item.name}` : t("clientContactsContextEmpty"));
}

async function selectClient(id) {
  selectedClient = CLIENTS.find((item) => String(item.id) === String(id)) || null;
  selectedClientSite = null;
  selectedClientContact = null;
  fillClientEdit(selectedClient);
  renderClientList($id("client-search").value);
  await loadClientSites();
  await loadClientContacts();
}

async function loadClients() {
  const r = await api("/admin/clients");
  CLIENTS = r.clients || [];
  if (selectedClient) {
    selectedClient = CLIENTS.find((item) => item.id === selectedClient.id) || null;
  }
  renderClientList($id("client-search")?.value || "");
  fillClientEdit(selectedClient);
  await loadClientSites();
  await loadClientContacts();
}

async function createClient() {
  const r = await api("/admin/clients", {
    method: "POST",
    body: JSON.stringify({ name: $id("client-add-name").value }),
  });
  $id("client-add-name").value = "";
  $id("client-note").textContent = r.message ? t("clientCreated") : t("clientCreated");
  await loadClients();
}

async function saveClient() {
  if (!selectedClient) return;
  const r = await api(`/admin/clients/${selectedClient.id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: $id("client-edit-name").value,
      is_active: $id("client-edit-active").value === "1",
    }),
  });
  $id("client-note").textContent = r.message ? t("clientSaved") : t("clientSaved");
  await loadClients();
}

async function toggleClient() {
  if (!selectedClient) return;
  const nextActive = !selectedClient.is_active;
  const r = await api(`/admin/clients/${selectedClient.id}`, {
    method: "PUT",
    body: JSON.stringify({ is_active: nextActive }),
  });
  $id("client-note").textContent = r.message ? (nextActive ? t("clientEnabled") : t("clientDisabled")) : "";
  await loadClients();
}

function renderClientSiteList(filter = "") {
  const list = $id("client-site-list");
  if (!list) return;
  list.innerHTML = "";
  const f = filter.toLowerCase();
  const rows = CLIENT_SITES.filter((item) => !f || String(item.name || "").toLowerCase().includes(f));

  if (rows.length === 0) {
    renderEmptyList(list, selectedClient ? t("noSites") : t("clientSitesContextEmpty"));
    return;
  }

  for (const item of rows) {
    const btn = document.createElement("button");
    btn.className = "vitem";
    btn.type = "button";
    btn.textContent = itemLabel(item);
    if (selectedClientSite?.id === item.id) btn.classList.add("active");
    btn.addEventListener("click", () => selectClientSite(item.id));
    btn.addEventListener("dblclick", () => openClientEditModal("site", item.id));
    list.appendChild(btn);
  }
}

function fillClientSiteEdit(item) {
  $id("btn-client-site-create").disabled = !selectedClient;
}

function selectClientSite(id) {
  selectedClientSite = CLIENT_SITES.find((item) => String(item.id) === String(id)) || null;
  fillClientSiteEdit(selectedClientSite);
  renderClientSiteList($id("client-site-search").value);
}

async function loadClientSites() {
  if (!selectedClient) {
    CLIENT_SITES = [];
    selectedClientSite = null;
    renderClientSiteList("");
    fillClientSiteEdit(null);
    return;
  }

  const r = await api(`/admin/client-sites?client_id=${encodeURIComponent(selectedClient.id)}`);
  CLIENT_SITES = r.sites || [];
  if (selectedClientSite) {
    selectedClientSite = CLIENT_SITES.find((item) => item.id === selectedClientSite.id) || null;
  }
  renderClientSiteList($id("client-site-search")?.value || "");
  fillClientSiteEdit(selectedClientSite);
}

async function createClientSite() {
  if (!selectedClient) {
    $id("client-site-note").textContent = t("selectClientFirst");
    return;
  }
  const r = await api("/admin/client-sites", {
    method: "POST",
    body: JSON.stringify({
      client_id: selectedClient.id,
      name: $id("client-site-add-name").value,
    }),
  });
  $id("client-site-add-name").value = "";
  $id("client-site-note").textContent = r.message ? t("clientSiteCreated") : t("clientSiteCreated");
  await loadClientSites();
}

async function saveClientSite() {
  if (!selectedClientSite) return;
  const r = await api(`/admin/client-sites/${selectedClientSite.id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: $id("client-site-edit-name").value,
      is_active: $id("client-site-edit-active").value === "1",
    }),
  });
  $id("client-site-note").textContent = r.message ? t("clientSiteSaved") : t("clientSiteSaved");
  await loadClientSites();
}

async function toggleClientSite() {
  if (!selectedClientSite) return;
  const nextActive = !selectedClientSite.is_active;
  const r = await api(`/admin/client-sites/${selectedClientSite.id}`, {
    method: "PUT",
    body: JSON.stringify({ is_active: nextActive }),
  });
  $id("client-site-note").textContent = r.message ? (nextActive ? t("clientSiteEnabled") : t("clientSiteDisabled")) : "";
  await loadClientSites();
}

function renderClientContactList(filter = "") {
  const list = $id("client-contact-list");
  if (!list) return;
  list.innerHTML = "";
  const f = filter.toLowerCase();
  const rows = CLIENT_CONTACTS.filter((item) => {
    const haystack = `${item.name || ""} ${item.email || ""} ${item.phone || ""}`.toLowerCase();
    return !f || haystack.includes(f);
  });

  if (rows.length === 0) {
    renderEmptyList(list, selectedClient ? t("noContacts") : t("clientContactsContextEmpty"));
    return;
  }

  for (const item of rows) {
    const btn = document.createElement("button");
    btn.className = "vitem";
    btn.type = "button";
    btn.textContent = contactLabel(item);
    if (selectedClientContact?.id === item.id) btn.classList.add("active");
    btn.addEventListener("click", () => selectClientContact(item.id));
    btn.addEventListener("dblclick", () => openClientEditModal("contact", item.id));
    list.appendChild(btn);
  }
}

function fillClientContactEdit(item) {
  $id("btn-client-contact-create").disabled = !selectedClient;
}

function selectClientContact(id) {
  selectedClientContact = CLIENT_CONTACTS.find((item) => String(item.id) === String(id)) || null;
  fillClientContactEdit(selectedClientContact);
  renderClientContactList($id("client-contact-search").value);
}

async function loadClientContacts() {
  if (!selectedClient) {
    CLIENT_CONTACTS = [];
    selectedClientContact = null;
    renderClientContactList("");
    fillClientContactEdit(null);
    return;
  }

  const r = await api(`/admin/client-contacts?client_id=${encodeURIComponent(selectedClient.id)}`);
  CLIENT_CONTACTS = r.contacts || [];
  if (selectedClientContact) {
    selectedClientContact = CLIENT_CONTACTS.find((item) => item.id === selectedClientContact.id) || null;
  }
  renderClientContactList($id("client-contact-search")?.value || "");
  fillClientContactEdit(selectedClientContact);
}

async function createClientContact() {
  if (!selectedClient) {
    $id("client-contact-note").textContent = t("selectClientFirst");
    return;
  }
  const r = await api("/admin/client-contacts", {
    method: "POST",
    body: JSON.stringify({
      client_id: selectedClient.id,
      name: $id("client-contact-add-name").value,
      email: $id("client-contact-add-email").value,
      phone: $id("client-contact-add-phone").value,
    }),
  });
  $id("client-contact-add-name").value = "";
  $id("client-contact-add-email").value = "";
  $id("client-contact-add-phone").value = "";
  $id("client-contact-note").textContent = r.message ? t("clientContactCreated") : t("clientContactCreated");
  await loadClientContacts();
}

async function saveClientContact() {
  if (!selectedClientContact) return;
  const r = await api(`/admin/client-contacts/${selectedClientContact.id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: $id("client-contact-edit-name").value,
      email: $id("client-contact-edit-email").value,
      phone: $id("client-contact-edit-phone").value,
      is_active: $id("client-contact-edit-active").value === "1",
    }),
  });
  $id("client-contact-note").textContent = r.message ? t("clientContactSaved") : t("clientContactSaved");
  await loadClientContacts();
}

async function toggleClientContact() {
  if (!selectedClientContact) return;
  const nextActive = !selectedClientContact.is_active;
  const r = await api(`/admin/client-contacts/${selectedClientContact.id}`, {
    method: "PUT",
    body: JSON.stringify({ is_active: nextActive }),
  });
  $id("client-contact-note").textContent = r.message ? (nextActive ? t("clientContactEnabled") : t("clientContactDisabled")) : "";
  await loadClientContacts();
}

async function saveClientEditModal() {
  const item = currentClientEditItem();
  const kind = clientEditModalState?.kind;
  if (!item || !kind) return;

  if (kind === "client") {
    const r = await api(`/admin/clients/${item.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: $id("client-edit-modal-name").value,
        is_active: $id("client-edit-modal-active").value === "1",
      }),
    });
    $id("client-note").textContent = r.message ? t("clientSaved") : t("clientSaved");
    await loadClients();
  } else if (kind === "site") {
    const r = await api(`/admin/client-sites/${item.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: $id("client-edit-modal-name").value,
        is_active: $id("client-edit-modal-active").value === "1",
      }),
    });
    $id("client-site-note").textContent = r.message ? t("clientSiteSaved") : t("clientSiteSaved");
    await loadClientSites();
  } else if (kind === "contact") {
    const r = await api(`/admin/client-contacts/${item.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: $id("client-edit-modal-name").value,
        email: $id("client-edit-modal-email").value,
        phone: $id("client-edit-modal-phone").value,
        is_active: $id("client-edit-modal-active").value === "1",
      }),
    });
    $id("client-contact-note").textContent = r.message ? t("clientContactSaved") : t("clientContactSaved");
    await loadClientContacts();
  }

  closeClientEditModal();
}

async function toggleClientEditModal() {
  const item = currentClientEditItem();
  const kind = clientEditModalState?.kind;
  if (!item || !kind) return;
  const nextActive = !item.is_active;

  if (kind === "client") {
    const r = await api(`/admin/clients/${item.id}`, {
      method: "PUT",
      body: JSON.stringify({ is_active: nextActive }),
    });
    $id("client-note").textContent = r.message ? (nextActive ? t("clientEnabled") : t("clientDisabled")) : "";
    await loadClients();
  } else if (kind === "site") {
    const r = await api(`/admin/client-sites/${item.id}`, {
      method: "PUT",
      body: JSON.stringify({ is_active: nextActive }),
    });
    $id("client-site-note").textContent = r.message ? (nextActive ? t("clientSiteEnabled") : t("clientSiteDisabled")) : "";
    await loadClientSites();
  } else if (kind === "contact") {
    const r = await api(`/admin/client-contacts/${item.id}`, {
      method: "PUT",
      body: JSON.stringify({ is_active: nextActive }),
    });
    $id("client-contact-note").textContent = r.message ? (nextActive ? t("clientContactEnabled") : t("clientContactDisabled")) : "";
    await loadClientContacts();
  }

  closeClientEditModal();
}

// =========================
// Fault equipment hierarchy
// =========================

let FAULT_MANUFACTURERS = [];
let FAULT_CATEGORIES = [];
let FAULT_SUBCATEGORIES = [];
let selectedFaultManufacturer = null;
let selectedFaultCategory = null;
let selectedFaultSubcategory = null;

function itemLabel(item) {
  if (!item) return "";
  return item.is_active ? item.name : `${item.name} (${t("disabledValue")})`;
}

function setFaultControlsDisabled(prefix, disabled) {
  [`fault-${prefix}-edit-name`, `fault-${prefix}-edit-active`, `btn-fault-${prefix}-save`, `btn-fault-${prefix}-toggle`].forEach((id) => {
    const el = $id(id);
    if (el) el.disabled = disabled;
  });
}

function renderFaultManufacturerList(filter = "") {
  const list = $id("fault-mfr-list");
  if (!list) return;
  list.innerHTML = "";
  const f = filter.toLowerCase();
  const rows = FAULT_MANUFACTURERS.filter((item) => !f || String(item.name || "").toLowerCase().includes(f));

  for (const item of rows) {
    const btn = document.createElement("button");
    btn.className = "vitem";
    btn.type = "button";
    btn.textContent = itemLabel(item);
    if (selectedFaultManufacturer?.id === item.id) btn.classList.add("active");
    btn.addEventListener("click", () => selectFaultManufacturer(item.id));
    list.appendChild(btn);
  }
}

function fillFaultManufacturerEdit(item) {
  if (!$id("fault-mfr-selected")) return;
  $id("fault-mfr-selected").textContent = item ? itemLabel(item) : t("none");
  $id("fault-mfr-edit-name").value = item?.name || "";
  $id("fault-mfr-edit-active").value = item?.is_active ? "1" : "0";
  $id("btn-fault-mfr-toggle").textContent = item?.is_active ? t("disable") : t("enable");
  setFaultControlsDisabled("mfr", !item);
}

async function selectFaultManufacturer(id) {
  selectedFaultManufacturer = FAULT_MANUFACTURERS.find((item) => String(item.id) === String(id)) || null;
  selectedFaultCategory = null;
  selectedFaultSubcategory = null;
  fillFaultManufacturerEdit(selectedFaultManufacturer);
  renderFaultManufacturerList($id("fault-mfr-search").value);
  await loadFaultCategories();
}

async function loadFaultManufacturers() {
  const r = await api("/admin/fault/manufacturers");
  FAULT_MANUFACTURERS = r.manufacturers || [];
  if (selectedFaultManufacturer) {
    selectedFaultManufacturer = FAULT_MANUFACTURERS.find((item) => item.id === selectedFaultManufacturer.id) || null;
  }
  renderFaultManufacturerList($id("fault-mfr-search")?.value || "");
  fillFaultManufacturerEdit(selectedFaultManufacturer);
  await loadFaultCategories();
}

async function createFaultManufacturer() {
  const name = $id("fault-mfr-add-name").value;
  const r = await api("/admin/fault/manufacturers", { method: "POST", body: JSON.stringify({ name }) });
  $id("fault-mfr-add-name").value = "";
  $id("fault-mfr-note").textContent = r.message ? t("manufacturerCreated") : t("manufacturerCreated");
  await loadFaultManufacturers();
}

async function saveFaultManufacturer() {
  if (!selectedFaultManufacturer) return;
  const r = await api(`/admin/fault/manufacturers/${selectedFaultManufacturer.id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: $id("fault-mfr-edit-name").value,
      is_active: $id("fault-mfr-edit-active").value === "1",
    }),
  });
  $id("fault-mfr-note").textContent = r.message ? t("manufacturerSaved") : t("manufacturerSaved");
  await loadFaultManufacturers();
}

async function toggleFaultManufacturer() {
  if (!selectedFaultManufacturer) return;
  const nextActive = !selectedFaultManufacturer.is_active;
  const r = await api(`/admin/fault/manufacturers/${selectedFaultManufacturer.id}`, {
    method: "PUT",
    body: JSON.stringify({ is_active: nextActive }),
  });
  $id("fault-mfr-note").textContent = r.message ? (nextActive ? t("manufacturerEnabled") : t("manufacturerDisabled")) : "";
  await loadFaultManufacturers();
}

function renderFaultCategoryList(filter = "") {
  const list = $id("fault-cat-list");
  if (!list) return;
  list.innerHTML = "";
  const f = filter.toLowerCase();
  const rows = FAULT_CATEGORIES.filter((item) => !f || String(item.name || "").toLowerCase().includes(f));

  for (const item of rows) {
    const btn = document.createElement("button");
    btn.className = "vitem";
    btn.type = "button";
    btn.textContent = itemLabel(item);
    if (selectedFaultCategory?.id === item.id) btn.classList.add("active");
    btn.addEventListener("click", () => selectFaultCategory(item.id));
    list.appendChild(btn);
  }
}

function fillFaultCategoryEdit(item) {
  if (!$id("fault-cat-selected")) return;
  $id("fault-cat-selected").textContent = item ? itemLabel(item) : t("none");
  $id("fault-cat-edit-name").value = item?.name || "";
  $id("fault-cat-edit-active").value = item?.is_active ? "1" : "0";
  $id("btn-fault-cat-toggle").textContent = item?.is_active ? t("disable") : t("enable");
  setFaultControlsDisabled("cat", !item);
  $id("btn-fault-cat-create").disabled = !selectedFaultManufacturer;
}

async function selectFaultCategory(id) {
  selectedFaultCategory = FAULT_CATEGORIES.find((item) => String(item.id) === String(id)) || null;
  selectedFaultSubcategory = null;
  fillFaultCategoryEdit(selectedFaultCategory);
  renderFaultCategoryList($id("fault-cat-search").value);
  await loadFaultSubcategories();
}

async function loadFaultCategories() {
  if (!selectedFaultManufacturer) {
    FAULT_CATEGORIES = [];
    selectedFaultCategory = null;
    renderFaultCategoryList("");
    fillFaultCategoryEdit(null);
    await loadFaultSubcategories();
    return;
  }

  const r = await api(`/admin/fault/categories?manufacturer_id=${encodeURIComponent(selectedFaultManufacturer.id)}`);
  FAULT_CATEGORIES = r.categories || [];
  if (selectedFaultCategory) {
    selectedFaultCategory = FAULT_CATEGORIES.find((item) => item.id === selectedFaultCategory.id) || null;
  }
  renderFaultCategoryList($id("fault-cat-search")?.value || "");
  fillFaultCategoryEdit(selectedFaultCategory);
  await loadFaultSubcategories();
}

async function createFaultCategory() {
  if (!selectedFaultManufacturer) {
    $id("fault-cat-note").textContent = t("selectManufacturerFirst");
    return;
  }
  const r = await api("/admin/fault/categories", {
    method: "POST",
    body: JSON.stringify({
      manufacturer_id: selectedFaultManufacturer.id,
      name: $id("fault-cat-add-name").value,
    }),
  });
  $id("fault-cat-add-name").value = "";
  $id("fault-cat-note").textContent = r.message ? t("categoryCreated") : t("categoryCreated");
  await loadFaultCategories();
}

async function saveFaultCategory() {
  if (!selectedFaultCategory) return;
  const r = await api(`/admin/fault/categories/${selectedFaultCategory.id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: $id("fault-cat-edit-name").value,
      is_active: $id("fault-cat-edit-active").value === "1",
    }),
  });
  $id("fault-cat-note").textContent = r.message ? t("categorySaved") : t("categorySaved");
  await loadFaultCategories();
}

async function toggleFaultCategory() {
  if (!selectedFaultCategory) return;
  const nextActive = !selectedFaultCategory.is_active;
  const r = await api(`/admin/fault/categories/${selectedFaultCategory.id}`, {
    method: "PUT",
    body: JSON.stringify({ is_active: nextActive }),
  });
  $id("fault-cat-note").textContent = r.message ? (nextActive ? t("categoryEnabled") : t("categoryDisabled")) : "";
  await loadFaultCategories();
}

function renderFaultSubcategoryList(filter = "") {
  const list = $id("fault-sub-list");
  if (!list) return;
  list.innerHTML = "";
  const f = filter.toLowerCase();
  const rows = FAULT_SUBCATEGORIES.filter((item) => !f || String(item.name || "").toLowerCase().includes(f));

  for (const item of rows) {
    const btn = document.createElement("button");
    btn.className = "vitem";
    btn.type = "button";
    btn.textContent = itemLabel(item);
    if (selectedFaultSubcategory?.id === item.id) btn.classList.add("active");
    btn.addEventListener("click", () => selectFaultSubcategory(item.id));
    list.appendChild(btn);
  }
}

function fillFaultSubcategoryEdit(item) {
  if (!$id("fault-sub-selected")) return;
  $id("fault-sub-selected").textContent = item ? itemLabel(item) : t("none");
  $id("fault-sub-edit-name").value = item?.name || "";
  $id("fault-sub-edit-active").value = item?.is_active ? "1" : "0";
  $id("btn-fault-sub-toggle").textContent = item?.is_active ? t("disable") : t("enable");
  setFaultControlsDisabled("sub", !item);
  $id("btn-fault-sub-create").disabled = !selectedFaultCategory;
}

function selectFaultSubcategory(id) {
  selectedFaultSubcategory = FAULT_SUBCATEGORIES.find((item) => String(item.id) === String(id)) || null;
  fillFaultSubcategoryEdit(selectedFaultSubcategory);
  renderFaultSubcategoryList($id("fault-sub-search").value);
}

async function loadFaultSubcategories() {
  if (!selectedFaultCategory) {
    FAULT_SUBCATEGORIES = [];
    selectedFaultSubcategory = null;
    renderFaultSubcategoryList("");
    fillFaultSubcategoryEdit(null);
    return;
  }

  const r = await api(`/admin/fault/subcategories?equipment_category_id=${encodeURIComponent(selectedFaultCategory.id)}`);
  FAULT_SUBCATEGORIES = r.subcategories || [];
  if (selectedFaultSubcategory) {
    selectedFaultSubcategory = FAULT_SUBCATEGORIES.find((item) => item.id === selectedFaultSubcategory.id) || null;
  }
  renderFaultSubcategoryList($id("fault-sub-search")?.value || "");
  fillFaultSubcategoryEdit(selectedFaultSubcategory);
}

async function createFaultSubcategory() {
  if (!selectedFaultCategory) {
    $id("fault-sub-note").textContent = t("selectCategoryFirst");
    return;
  }
  const r = await api("/admin/fault/subcategories", {
    method: "POST",
    body: JSON.stringify({
      equipment_category_id: selectedFaultCategory.id,
      name: $id("fault-sub-add-name").value,
    }),
  });
  $id("fault-sub-add-name").value = "";
  $id("fault-sub-note").textContent = r.message ? t("subcategoryCreated") : t("subcategoryCreated");
  await loadFaultSubcategories();
}

async function saveFaultSubcategory() {
  if (!selectedFaultSubcategory) return;
  const r = await api(`/admin/fault/subcategories/${selectedFaultSubcategory.id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: $id("fault-sub-edit-name").value,
      is_active: $id("fault-sub-edit-active").value === "1",
    }),
  });
  $id("fault-sub-note").textContent = r.message ? t("subcategorySaved") : t("subcategorySaved");
  await loadFaultSubcategories();
}

async function toggleFaultSubcategory() {
  if (!selectedFaultSubcategory) return;
  const nextActive = !selectedFaultSubcategory.is_active;
  const r = await api(`/admin/fault/subcategories/${selectedFaultSubcategory.id}`, {
    method: "PUT",
    body: JSON.stringify({ is_active: nextActive }),
  });
  $id("fault-sub-note").textContent = r.message ? (nextActive ? t("subcategoryEnabled") : t("subcategoryDisabled")) : "";
  await loadFaultSubcategories();
}

// =========================
// Statistics
// =========================

function fillStatsPickers() {
  const empSel = $id("stats-emp");
  const prjSel = $id("stats-prj");
  if (!empSel || !prjSel) return;
  const selectedEmp = empSel.value;
  const selectedPrj = prjSel.value;

  empSel.innerHTML = "";
  const empPrompt = document.createElement("option");
  empPrompt.value = "";
  empPrompt.textContent = t("selectPrompt");
  empSel.appendChild(empPrompt);
  for (const e of EMPLOYEES) {
    const opt = document.createElement("option");
    opt.value = e.id;
    opt.textContent = `${e.last_name}, ${e.first_name}`;
    empSel.appendChild(opt);
  }
  if (selectedEmp) empSel.value = selectedEmp;

  prjSel.innerHTML = "";
  const prjPrompt = document.createElement("option");
  prjPrompt.value = "";
  prjPrompt.textContent = t("selectPrompt");
  prjSel.appendChild(prjPrompt);
  for (const p of PROJECTS) {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.name;
    prjSel.appendChild(opt);
  }
  if (selectedPrj) prjSel.value = selectedPrj;
}

function setStatsMode(mode) {
  const isEmp = mode === "employee";
  const isProject = mode === "project";
  $id("stats-emp-row").classList.toggle("is-hidden", !isEmp);
  $id("stats-prj-row").classList.toggle("is-hidden", !isProject);
  $id("stats-table").innerHTML = "";
  $id("stats-summary").textContent = "";
}

function initMonthPickers() {
  document.querySelectorAll("[data-month-picker]").forEach((button) => {
    const input = $id(button.dataset.monthPicker);
    if (!input) return;

    button.addEventListener("click", () => {
      input.focus({ preventScroll: true });
      try {
        if (typeof input.showPicker === "function") {
          input.showPicker();
          return;
        }
      } catch {}
      input.click();
    });
  });
}

function formatHours(value) {
  return Number(value || 0).toFixed(2).replace(/\.00$/, "");
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") return "-";
  return Number(value || 0).toFixed(2).replace(/\.00$/, "");
}

const DAY_NAMES = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  he: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
};

function dayNameFromDate(value) {
  const dateText = String(value || "").slice(0, 10);
  const date = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  if (document.documentElement.lang === "he") {
    return [
      "\u05e8\u05d0\u05e9\u05d5\u05df",
      "\u05e9\u05e0\u05d9",
      "\u05e9\u05dc\u05d9\u05e9\u05d9",
      "\u05e8\u05d1\u05d9\u05e2\u05d9",
      "\u05d7\u05de\u05d9\u05e9\u05d9",
      "\u05e9\u05d9\u05e9\u05d9",
      "\u05e9\u05d1\u05ea",
    ][date.getDay()];
  }
  return DAY_NAMES.en[date.getDay()];
}

function createDateCell(dateText, options = {}) {
  const { isContinuation = false, isExtraHours = false } = options;
  const wrap = document.createElement("div");
  wrap.className = `date-stack${isContinuation ? " is-continuation" : ""}`;

  const date = document.createElement("span");
  date.className = "date-text";
  date.textContent = dateText;

  const day = document.createElement("span");
  day.className = "day-badge";
  day.textContent = dayNameFromDate(dateText);

  wrap.append(date, day);
  if (isExtraHours) {
    const extra = document.createElement("span");
    extra.className = "extra-badge";
    extra.textContent = "extra";
    wrap.appendChild(extra);
  }
  return wrap;
}

function createMetric(label, value) {
  const metric = document.createElement("span");
  metric.className = "summary-metric";

  const labelEl = document.createElement("span");
  labelEl.className = "summary-metric-label";
  labelEl.textContent = label;

  const valueEl = document.createElement("span");
  valueEl.className = "summary-metric-value";
  valueEl.textContent = value;

  metric.append(labelEl, valueEl);
  return metric;
}

function createSummaryMetrics(metrics) {
  const wrap = document.createElement("div");
  wrap.className = "summary-metrics";
  metrics.forEach(({ label, value }) => wrap.appendChild(createMetric(label, value)));
  return wrap;
}

function appendCellContent(td, content) {
  if (content instanceof Node) {
    td.appendChild(content);
    return;
  }
  td.textContent = content ?? "";
}

function renderTable(headers, rows, options = {}) {
  const { summaryRow = null, rowClassName = null } = options;
  const table = document.createElement("table");
  table.className = "table";

  const thead = document.createElement("thead");
  const trh = document.createElement("tr");
  headers.forEach((h) => {
    const th = document.createElement("th");
    th.textContent = h;
    trh.appendChild(th);
  });
  thead.appendChild(trh);

  const tbody = document.createElement("tbody");

  rows.forEach((r) => {
    const tr = document.createElement("tr");
    if (typeof rowClassName === "function") {
      const className = rowClassName(r);
      if (className) tr.className = className;
    }
    r.cells.forEach((c) => {
      const td = document.createElement("td");
      appendCellContent(td, c);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  let tfoot = null;
  if (summaryRow) {
    tfoot = document.createElement("tfoot");
    const tr = document.createElement("tr");
    tr.className = "summary-row";
    summaryRow.forEach((c) => {
      const td = document.createElement("td");
      if (c && typeof c === "object" && !(c instanceof Node)) {
        if (c.colSpan) td.colSpan = c.colSpan;
        if (c.className) td.className = c.className;
        appendCellContent(td, c.content);
      } else {
        appendCellContent(td, c);
      }
      tr.appendChild(td);
    });
    tfoot.appendChild(tr);
  }

  table.appendChild(thead);
  table.appendChild(tbody);
  if (tfoot) table.appendChild(tfoot);
  return table;
}

function createContractorCostCell(row) {
  const wrap = document.createElement("div");
  wrap.className = "cost-cell";

  const value = document.createElement("span");
  value.className = "cost-value";
  value.textContent = formatMoney(row.service_cost);

  const btn = document.createElement("button");
  btn.className = "btn btn-small";
  btn.type = "button";
  btn.textContent = t("editCost");
  btn.addEventListener("click", async () => {
    const currentValue = row.service_cost === null || row.service_cost === undefined ? "" : String(row.service_cost);
    const nextValue = prompt(`${t("costUpdateConfirm")}\n${t("serviceCost")}:`, currentValue);
    if (nextValue === null) return;

    try {
      await api(`/admin/contractors/${row.id}/cost`, {
        method: "PUT",
        body: JSON.stringify({ service_cost: nextValue }),
      });
      $id("stats-summary").textContent = t("costUpdated");
      await runStats();
    } catch (e) {
      $id("stats-summary").textContent = e.message;
    }
  });

  wrap.append(value, btn);
  return wrap;
}

async function runStats() {
  const mode = $id("stats-mode").value;
  const month = $id("stats-month").value;

  if (!month) throw new Error(t("missingMonth"));

  if (mode === "employee") {
    const empId = $id("stats-emp").value;
    if (!empId) throw new Error(t("missingEmployee"));

    const r = await api(`/admin/reports/employee/${empId}?month=${encodeURIComponent(month)}`);

    const sourceRows = r.rows || [];
    const rows = sourceRows.map((x, index) => {
      const dateText = String(x.work_date).slice(0, 10);
      const previousDate = index > 0 ? String(sourceRows[index - 1].work_date).slice(0, 10) : "";
      const isSameDayContinuation = dateText === previousDate;
      return {
        isExtraHours: Boolean(x.is_extra_hours),
        isSameDayContinuation,
        cells: [
        createDateCell(dateText, {
          isContinuation: isSameDayContinuation,
          isExtraHours: Boolean(x.is_extra_hours),
        }),
        String(x.start_time).slice(0, 5),
        String(x.end_time).slice(0, 5),
        x.project_name,
        x.notes || "",
      ],
      };
    });

    const totalDays = r.totals?.days ?? 0;
    const totalHours = r.totals?.hours ?? 0;
    const totalExtraHours = r.totals?.extra_hours ?? 0;

    const summaryRow = [
      { content: t("summary"), className: "summary-title" },
      {
        colSpan: 4,
        content: createSummaryMetrics([
          { label: t("totalDays"), value: String(totalDays) },
          { label: t("totalHours"), value: formatHours(totalHours) },
          { label: t("extraHours"), value: formatHours(totalExtraHours) },
        ]),
      },
    ];

    const table = renderTable([t("date"), t("start"), t("end"), t("project"), t("notes")], rows, {
      summaryRow,
      rowClassName: (row) => [
        row.isSameDayContinuation ? "same-day-continuation" : "",
      ].filter(Boolean).join(" "),
    });
    $id("stats-table").innerHTML = "";
    $id("stats-table").appendChild(table);
    $id("stats-summary").textContent = `${t("totalDays")}: ${totalDays} | ${t("totalHours")}: ${formatHours(totalHours)} | ${t("extraHours")}: ${formatHours(totalExtraHours)}`;
  } else if (mode === "project") {
    const prjId = $id("stats-prj").value;
    if (!prjId) throw new Error(t("missingProject"));

    const r = await api(`/admin/reports/project/${prjId}?month=${encodeURIComponent(month)}`);

    const rows = (r.employees || []).map((e) => ({
      cells: [
        `${e.last_name}, ${e.first_name}`,
        String(e.daily_rate),
        String(e.days),
        formatHours(e.hours),
        formatHours(e.cost),
      ],
    }));

    const totals = r.totals || {};
    const summaryRow = [
      { content: t("summary"), className: "summary-title" },
      "",
      String(totals.days ?? 0),
      formatHours(totals.hours),
      formatHours(totals.cost),
    ];

    const table = renderTable([t("employee"), t("dailyRateHeader"), t("days"), t("hours"), t("cost")], rows, { summaryRow });
    $id("stats-table").innerHTML = "";
    $id("stats-table").appendChild(table);

    // Required top line
    $id("stats-summary").textContent = `${t("employeeCount")}: ${totals.employeeCount ?? 0} | ${t("totalHours")}: ${formatHours(totals.hours)} | ${t("cost")}: ${formatHours(totals.cost)}`;
  } else {
    const r = await api(`/admin/reports/contractors?month=${encodeURIComponent(month)}`);
    const rows = (r.rows || []).map((entry) => ({
      cells: [
        createDateCell(String(entry.service_date).slice(0, 10)),
        String(entry.start_time || "").slice(0, 5) || "-",
        String(entry.end_time || "").slice(0, 5) || "-",
        entry.project_name || "",
        entry.contractor_name || "",
        entry.service_description || "",
        `${entry.manager_last_name || ""}, ${entry.manager_first_name || ""}`.replace(/^, /, "").trim() || "-",
        createContractorCostCell(entry),
      ],
    }));

    const totals = r.totals || {};
    const summaryRow = [
      { content: t("summary"), className: "summary-title" },
      {
        colSpan: 7,
        content: createSummaryMetrics([
          { label: t("entries"), value: String(totals.entries ?? 0) },
          { label: t("cost"), value: formatMoney(totals.cost) },
        ]),
      },
    ];

    const table = renderTable([
      t("date"),
      t("start"),
      t("end"),
      t("project"),
      t("contractorName"),
      t("serviceDescription"),
      t("managerAddedBy"),
      t("serviceCost"),
    ], rows, { summaryRow });

    $id("stats-table").innerHTML = "";
    $id("stats-table").appendChild(table);
    $id("stats-summary").textContent = `${t("entries")}: ${totals.entries ?? 0} | ${t("cost")}: ${formatMoney(totals.cost)}`;
  }
}

// =========================
// Settings
// =========================

async function loadSettings() {
  const r = await api("/admin/settings");
  ADMIN_SETTINGS = { ...DEFAULT_ADMIN_SETTINGS, ...(r.settings || {}) };
  fillSettingsForm();
  updateStaticText();
}

function fillSettingsForm() {
  if ($id("setting-language")) $id("setting-language").value = ADMIN_SETTINGS.admin_language || "en";
  if ($id("setting-workday-hours")) $id("setting-workday-hours").value = ADMIN_SETTINGS.workday_hours ?? 9;
}

async function saveSettings() {
  const payload = {
    admin_language: $id("setting-language").value,
    workday_hours: Number($id("setting-workday-hours").value),
  };
  const r = await api("/admin/settings", { method: "PUT", body: JSON.stringify(payload) });
  ADMIN_SETTINGS = { ...DEFAULT_ADMIN_SETTINGS, ...(r.settings || {}) };
  fillSettingsForm();
  updateStaticText();
  $id("settings-note").textContent = t("settingsSaved");
  $id("stats-table").innerHTML = "";
  $id("stats-summary").textContent = "";
}

// =========================
// Logout
// =========================

async function logout() {
  try { await api("/auth/logout", { method: "POST" }); } catch {}
  window.location.href = "/login.html";
}

// =========================
// Init
// =========================

async function init() {
  await loadSettings();
  initTabs();
  updateStaticText();

  $id("btn-logout").addEventListener("click", logout);

  // Employees
  $id("btn-emp-reload").addEventListener("click", loadEmployees);
  $id("emp-search").addEventListener("input", () => renderEmployeeList($id("emp-search").value));
  $id("btn-emp-create").addEventListener("click", async () => {
    try { await createEmployee(); } catch (e) { $id("emp-add-note").textContent = e.message; }
  });
  $id("btn-emp-save").addEventListener("click", async () => {
    try { await saveEmployee(); } catch (e) { $id("emp-edit-note").textContent = e.message; }
  });
  $id("btn-emp-delete").addEventListener("click", async () => {
    try { await deleteEmployee(); } catch (e) { $id("emp-edit-note").textContent = e.message; }
  });

  // Projects
  $id("btn-prj-reload").addEventListener("click", loadProjects);
  $id("prj-search").addEventListener("input", () => renderProjectList($id("prj-search").value));
  $id("btn-prj-create").addEventListener("click", async () => {
    try { await createProject(); } catch (e) { $id("prj-add-note").textContent = e.message; }
  });
  $id("btn-prj-save").addEventListener("click", async () => {
    try { await saveProject(); } catch (e) { $id("prj-edit-note").textContent = e.message; }
  });
  $id("btn-prj-delete").addEventListener("click", async () => {
    try { await deleteProject(); } catch (e) { $id("prj-edit-note").textContent = e.message; }
  });

  // Clients hierarchy
  $id("btn-client-reload").addEventListener("click", loadClients);
  $id("client-search").addEventListener("input", () => renderClientList($id("client-search").value));
  $id("btn-client-create").addEventListener("click", async () => {
    try { await createClient(); } catch (e) { $id("client-note").textContent = e.message; }
  });

  $id("btn-client-site-reload").addEventListener("click", loadClientSites);
  $id("client-site-search").addEventListener("input", () => renderClientSiteList($id("client-site-search").value));
  $id("btn-client-site-create").addEventListener("click", async () => {
    try { await createClientSite(); } catch (e) { $id("client-site-note").textContent = e.message; }
  });

  $id("btn-client-contact-reload").addEventListener("click", loadClientContacts);
  $id("client-contact-search").addEventListener("input", () => renderClientContactList($id("client-contact-search").value));
  $id("btn-client-contact-create").addEventListener("click", async () => {
    try { await createClientContact(); } catch (e) { $id("client-contact-note").textContent = e.message; }
  });
  $id("btn-client-edit-close").addEventListener("click", closeClientEditModal);
  $id("btn-client-edit-cancel").addEventListener("click", closeClientEditModal);
  $id("btn-client-edit-save").addEventListener("click", async () => {
    try { await saveClientEditModal(); } catch (e) { $id("client-edit-modal-note").textContent = e.message; }
  });
  $id("btn-client-edit-toggle").addEventListener("click", async () => {
    try { await toggleClientEditModal(); } catch (e) { $id("client-edit-modal-note").textContent = e.message; }
  });
  $id("client-edit-modal").addEventListener("click", (event) => {
    if (event.target === $id("client-edit-modal")) closeClientEditModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$id("client-edit-modal")?.classList.contains("is-hidden")) {
      closeClientEditModal();
    }
  });

  // Fault equipment hierarchy
  $id("btn-fault-mfr-reload").addEventListener("click", loadFaultManufacturers);
  $id("fault-mfr-search").addEventListener("input", () => renderFaultManufacturerList($id("fault-mfr-search").value));
  $id("btn-fault-mfr-create").addEventListener("click", async () => {
    try { await createFaultManufacturer(); } catch (e) { $id("fault-mfr-note").textContent = e.message; }
  });
  $id("btn-fault-mfr-save").addEventListener("click", async () => {
    try { await saveFaultManufacturer(); } catch (e) { $id("fault-mfr-note").textContent = e.message; }
  });
  $id("btn-fault-mfr-toggle").addEventListener("click", async () => {
    try { await toggleFaultManufacturer(); } catch (e) { $id("fault-mfr-note").textContent = e.message; }
  });

  $id("btn-fault-cat-reload").addEventListener("click", loadFaultCategories);
  $id("fault-cat-search").addEventListener("input", () => renderFaultCategoryList($id("fault-cat-search").value));
  $id("btn-fault-cat-create").addEventListener("click", async () => {
    try { await createFaultCategory(); } catch (e) { $id("fault-cat-note").textContent = e.message; }
  });
  $id("btn-fault-cat-save").addEventListener("click", async () => {
    try { await saveFaultCategory(); } catch (e) { $id("fault-cat-note").textContent = e.message; }
  });
  $id("btn-fault-cat-toggle").addEventListener("click", async () => {
    try { await toggleFaultCategory(); } catch (e) { $id("fault-cat-note").textContent = e.message; }
  });

  $id("btn-fault-sub-reload").addEventListener("click", loadFaultSubcategories);
  $id("fault-sub-search").addEventListener("input", () => renderFaultSubcategoryList($id("fault-sub-search").value));
  $id("btn-fault-sub-create").addEventListener("click", async () => {
    try { await createFaultSubcategory(); } catch (e) { $id("fault-sub-note").textContent = e.message; }
  });
  $id("btn-fault-sub-save").addEventListener("click", async () => {
    try { await saveFaultSubcategory(); } catch (e) { $id("fault-sub-note").textContent = e.message; }
  });
  $id("btn-fault-sub-toggle").addEventListener("click", async () => {
    try { await toggleFaultSubcategory(); } catch (e) { $id("fault-sub-note").textContent = e.message; }
  });

  // Settings
  $id("setting-language").addEventListener("change", () => {
    ADMIN_SETTINGS.admin_language = $id("setting-language").value;
    updateStaticText();
    refreshStatsIfRendered();
  });
  $id("btn-settings-save").addEventListener("click", async () => {
    try { await saveSettings(); } catch (e) { $id("settings-note").textContent = e.message; }
  });

  // Stats
  $id("stats-month").value = todayMonth();
  initMonthPickers();
  $id("stats-mode").addEventListener("change", () => setStatsMode($id("stats-mode").value));
  $id("btn-stats-run").addEventListener("click", async () => {
    try { await runStats(); } catch (e) { $id("stats-summary").textContent = e.message; }
  });
  setStatsMode("employee");

  // Load data
  await loadEmployees();
  await loadProjects();
  await loadClients();
  await loadFaultManufacturers();
}

init().catch((e) => {
  console.error(e);
  alert(e?.message || "Failed to load admin page");
});
