// ===== State =====
const STORAGE_KEY = "incidentTrackerData";

const state = {
  incidents: [],
  editingId: null,
  searchText: "",
  statusFilter: "All",
  sortOrder: "desc"
};

// ===== Elements =====
const form = document.getElementById("incidentForm");
const incidentsBody = document.getElementById("incidentsBody");
const saveButton = document.getElementById("saveButton");
const cancelEditButton = document.getElementById("cancelEditButton");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const sortOrder = document.getElementById("sortOrder");

const fieldInputs = {
  itemCode: document.getElementById("itemCode"),
  userName: document.getElementById("userName"),
  dateFrom: document.getElementById("dateFrom"),
  dateTo: document.getElementById("dateTo"),
  comment: document.getElementById("comment"),
  status: document.getElementById("status")
};

const errorFields = {
  itemCode: document.getElementById("itemCodeError"),
  userName: document.getElementById("userNameError"),
  dateFrom: document.getElementById("dateFromError"),
  dateTo: document.getElementById("dateToError"),
  comment: document.getElementById("commentError"),
  status: document.getElementById("statusError")
};

// ===== Render =====
function render() {
  const visibleIncidents = getVisibleIncidents();

  if (visibleIncidents.length === 0) {
    incidentsBody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-message">No incidents found.</td>
      </tr>
    `;
    return;
  }

  let rowsHtml = "";

  visibleIncidents.forEach(function (incident, index) {
    rowsHtml += `
      <tr>
        <td>${index + 1}</td>
        <td>${incident.itemCode}</td>
        <td>${incident.userName}</td>
        <td>${incident.dateFrom}</td>
        <td>${incident.dateTo}</td>
        <td>${incident.comment}</td>
        <td>${incident.status}</td>
        <td class="actions">
          <button type="button" data-action="edit" data-id="${incident.id}">Edit</button>
          <button type="button" data-action="delete" data-id="${incident.id}">Delete</button>
        </td>
      </tr>
    `;
  });

  incidentsBody.innerHTML = rowsHtml;
}

function getVisibleIncidents() {
  let result = [...state.incidents];

  if (state.searchText) {
    result = result.filter(function (incident) {
      const userNameMatch = incident.userName
        .toLowerCase()
        .includes(state.searchText);
      const itemCodeMatch = incident.itemCode
        .toLowerCase()
        .includes(state.searchText);
      return userNameMatch || itemCodeMatch;
    });
  }

  if (state.statusFilter !== "All") {
    result = result.filter(function (incident) {
      return incident.status === state.statusFilter;
    });
  }

  result.sort(function (a, b) {
    if (state.sortOrder === "asc") {
      return a.dateFrom.localeCompare(b.dateFrom);
    }
    return b.dateFrom.localeCompare(a.dateFrom);
  });

  return result;
}

// ===== Validation =====
function validate(formData) {
  clearValidation();
  let isValid = true;

  if (!formData.itemCode) {
    setFieldError("itemCode", "ItemCode is required.");
    isValid = false;
  }

  if (!formData.userName) {
    setFieldError("userName", "UserName is required.");
    isValid = false;
  }

  if (!formData.dateFrom) {
    setFieldError("dateFrom", "DateFrom is required.");
    isValid = false;
  }

  if (!formData.dateTo) {
    setFieldError("dateTo", "DateTo is required.");
    isValid = false;
  }

  if (!formData.comment) {
    setFieldError("comment", "Comment is required.");
    isValid = false;
  }

  if (!formData.status) {
    setFieldError("status", "Status is required.");
    isValid = false;
  }

  if (formData.dateFrom && formData.dateTo && formData.dateTo < formData.dateFrom) {
    setFieldError("dateTo", "DateTo cannot be earlier than DateFrom.");
    isValid = false;
  }

  return isValid;
}

function setFieldError(fieldName, message) {
  errorFields[fieldName].textContent = message;
  fieldInputs[fieldName].classList.add("invalid");
}

function clearValidation() {
  Object.keys(fieldInputs).forEach(function (key) {
    fieldInputs[key].classList.remove("invalid");
    errorFields[key].textContent = "";
  });
}

// ===== Form Data =====
function readForm() {
  return {
    itemCode: fieldInputs.itemCode.value.trim(),
    userName: fieldInputs.userName.value.trim(),
    dateFrom: fieldInputs.dateFrom.value,
    dateTo: fieldInputs.dateTo.value,
    comment: fieldInputs.comment.value.trim(),
    status: fieldInputs.status.value
  };
}

function fillForm(incident) {
  fieldInputs.itemCode.value = incident.itemCode;
  fieldInputs.userName.value = incident.userName;
  fieldInputs.dateFrom.value = incident.dateFrom;
  fieldInputs.dateTo.value = incident.dateTo;
  fieldInputs.comment.value = incident.comment;
  fieldInputs.status.value = incident.status;
}

function clearForm() {
  form.reset();
  fieldInputs.status.value = "New";
}

// ===== CRUD Handlers =====
function handleSubmit(event) {
  event.preventDefault();
  const formData = readForm();

  if (!validate(formData)) {
    return;
  }

  if (state.editingId === null) {
    addIncident(formData);
  } else {
    updateIncident(state.editingId, formData);
  }

  saveToStorage();
  render();
  resetEditMode();
  clearForm();
  clearValidation();
}

function addIncident(formData) {
  const incident = {
    id: String(Date.now()),
    itemCode: formData.itemCode,
    userName: formData.userName,
    dateFrom: formData.dateFrom,
    dateTo: formData.dateTo,
    comment: formData.comment,
    status: formData.status
  };

  state.incidents.push(incident);
}

function updateIncident(id, formData) {
  const index = state.incidents.findIndex(function (incident) {
    return incident.id === id;
  });

  if (index === -1) {
    return;
  }

  state.incidents[index] = {
    id: id,
    itemCode: formData.itemCode,
    userName: formData.userName,
    dateFrom: formData.dateFrom,
    dateTo: formData.dateTo,
    comment: formData.comment,
    status: formData.status
  };
}

function deleteIncident(id) {
  const userConfirmed = window.confirm("Delete this incident?");
  if (!userConfirmed) {
    return;
  }

  state.incidents = state.incidents.filter(function (incident) {
    return incident.id !== id;
  });

  saveToStorage();
  render();

  if (state.editingId === id) {
    resetEditMode();
    clearForm();
    clearValidation();
  }
}

function startEditMode(id) {
  const incident = state.incidents.find(function (item) {
    return item.id === id;
  });

  if (!incident) {
    return;
  }

  state.editingId = id;
  fillForm(incident);
  saveButton.textContent = "Update Incident";
  cancelEditButton.hidden = false;
  clearValidation();
}

function resetEditMode() {
  state.editingId = null;
  saveButton.textContent = "Add Incident";
  cancelEditButton.hidden = true;
}

// ===== Event Delegation =====
function handleTableClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const id = button.dataset.id;

  if (action === "edit") {
    startEditMode(id);
  } else if (action === "delete") {
    deleteIncident(id);
  }
}

// ===== Storage =====
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.incidents));
}

function loadFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return;
  }

  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      state.incidents = parsed;
    }
  } catch (error) {
    state.incidents = [];
  }
}

// ===== Init =====
form.addEventListener("submit", handleSubmit);
cancelEditButton.addEventListener("click", function () {
  resetEditMode();
  clearForm();
  clearValidation();
});

searchInput.addEventListener("input", function () {
  state.searchText = searchInput.value.trim().toLowerCase();
  render();
});

statusFilter.addEventListener("change", function () {
  state.statusFilter = statusFilter.value;
  render();
});

sortOrder.addEventListener("change", function () {
  state.sortOrder = sortOrder.value;
  render();
});

incidentsBody.addEventListener("click", handleTableClick);

loadFromStorage();
render();
