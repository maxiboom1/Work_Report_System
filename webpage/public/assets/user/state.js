export let currentUser = null;
export let managerEmployees = [];
export let currentCarList = [];
const selectedManagerWorkerIds = new Set();

export function setCurrentUser(user) {
  currentUser = user;
}

export function setManagerEmployees(employees) {
  managerEmployees = employees || [];
  const knownIds = new Set(managerEmployees.map((worker) => Number(worker.id)));
  for (const id of Array.from(selectedManagerWorkerIds)) {
    if (!knownIds.has(id)) selectedManagerWorkerIds.delete(id);
  }
}

export function setCurrentCarList(workers) {
  currentCarList = workers || [];
}

export function toggleManagerWorkerSelection(workerId) {
  const id = Number(workerId);
  if (!Number.isFinite(id)) return false;
  if (selectedManagerWorkerIds.has(id)) {
    selectedManagerWorkerIds.delete(id);
    return false;
  }
  selectedManagerWorkerIds.add(id);
  return true;
}

export function isManagerWorkerSelected(workerId) {
  return selectedManagerWorkerIds.has(Number(workerId));
}

export function selectedManagerWorkers() {
  return managerEmployees.filter((worker) => selectedManagerWorkerIds.has(Number(worker.id)));
}
