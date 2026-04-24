export let currentUser = null;
export let managerEmployees = [];
export let currentCarList = [];

export function setCurrentUser(user) {
  currentUser = user;
}

export function setManagerEmployees(employees) {
  managerEmployees = employees || [];
}

export function setCurrentCarList(workers) {
  currentCarList = workers || [];
}
