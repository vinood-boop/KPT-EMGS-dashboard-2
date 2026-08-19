const navLinks = document.querySelectorAll("[data-view-link]");
const viewPanels = document.querySelectorAll("[data-view]");
const pageTitle = document.querySelector(".top-title h1");
const resetDemo = document.querySelector(".reset-btn");
const searchForm = document.querySelector("#searchForm");
const topSearch = document.querySelector("#searchForm input");
const logoutButton = document.querySelector("#logoutButton");
const auditBody = document.querySelector("#auditTable tbody");
const confirmModal = document.querySelector("#confirmModal");
const confirmTitle = document.querySelector("#confirmTitle");
const confirmMessage = document.querySelector("#confirmMessage");
const closeConfirm = document.querySelector("#closeConfirm");
const cancelConfirm = document.querySelector("#cancelConfirm");
const applyConfirm = document.querySelector("#applyConfirm");
const detailModal = document.querySelector("#detailModal");
const detailTitle = document.querySelector("#detailTitle");
const detailBody = document.querySelector("#detailBody");
const closeDetail = document.querySelector("#closeDetail");
const closeDetailAction = document.querySelector("#closeDetailAction");
const clarificationModal = document.querySelector("#clarificationModal");
const closeClarification = document.querySelector("#closeClarification");
const cancelClarification = document.querySelector("#cancelClarification");
const sendClarification = document.querySelector("#sendClarification");
const clarificationMessage = document.querySelector("#clarificationMessage");
const userModal = document.querySelector("#userModal");
const userModalTitle = document.querySelector("#userModalTitle");
const closeUserModal = document.querySelector("#closeUserModal");
const cancelUserModal = document.querySelector("#cancelUserModal");
const saveUserModal = document.querySelector("#saveUserModal");
const userName = document.querySelector("#userName");
const userEmail = document.querySelector("#userEmail");
const userLogin = document.querySelector("#userLogin");
const userPassword = document.querySelector("#userPassword");
const userRole = document.querySelector("#userRole");
const userStatus = document.querySelector("#userStatus");
const notificationButton = document.querySelector("#notificationButton");
const notificationPanel = document.querySelector("#notificationPanel");
const notificationCount = document.querySelector("#notificationCount");
const notificationSummary = document.querySelector("#notificationSummary");
const markNotificationsRead = document.querySelector("#markNotificationsRead");
const universityDetailName = document.querySelector("#universityDetailName");
const universityDetailMeta = document.querySelector("#universityDetailMeta");
const universityDetailStatus = document.querySelector("#universityDetailStatus");
const universityOverview = document.querySelector("#universityOverview");
const universityCredentials = document.querySelector("#universityCredentials");
const universityProgrammeBody = document.querySelector("#universityProgrammeTable tbody");
const universitiesSplitLayout = document.querySelector("#universitiesSplitLayout");
const universitySidePanel = document.querySelector("#universitySidePanel");
const programmesSplitLayout = document.querySelector("#programmesSplitLayout");
const programmeSidePanel = document.querySelector("#programmeSidePanel");
const applicationsSplitLayout = document.querySelector("#applicationsSplitLayout");
const applicationSidePanel = document.querySelector("#applicationSidePanel");

const initialTables = new Map([...document.querySelectorAll(".recent-table tbody")].map((body) => [body, body.innerHTML]));
const initialAuditHtml = auditBody?.innerHTML || "";
const initialNotificationHtml = notificationPanel?.querySelector(".notification-list")?.innerHTML || "";
let pendingAction = null;
let editingUserRow = null;
let activeUniversityRow = null;
let activeProgrammeRow = null;
let activeApplicationRow = null;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setActiveView(viewName) {
  if (viewName === "universities/detail") viewName = "universities";
  const labels = {
    dashboard: "Dashboard",
    universities: "Universities",
    "university-detail": "Universities",
    programmes: "Programme Approvals",
    applications: "Applications",
    reports: "Reports",
    administration: "Administration",
    audit: "Audit Log",
    help: "Help & Support",
    settings: "Settings"
  };
  const navView = viewName === "university-detail" ? "universities" : viewName;
  navLinks.forEach((link) => link.classList.toggle("active", link.dataset.viewLink === navView));
  viewPanels.forEach((panel) => panel.classList.toggle("active", panel.dataset.view === viewName));
  if (pageTitle) pageTitle.textContent = labels[viewName] || "Dashboard";
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function currentTimestamp() {
  const now = new Date();
  const date = now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${date}, ${time}`;
}

function addAudit(action, entity, user = "Farah Kamil") {
  if (!auditBody) return;
  const row = document.createElement("tr");
  row.innerHTML = `<td>${currentTimestamp()}</td><td>${user}</td><td>${action}</td><td>${entity}</td>`;
  auditBody.prepend(row);
  filterAudit();
}

function openConfirm(title, message, action, label = "Confirm") {
  pendingAction = action;
  if (confirmTitle) confirmTitle.textContent = title;
  if (confirmMessage) confirmMessage.textContent = message;
  if (applyConfirm) applyConfirm.textContent = label;
  if (confirmModal) confirmModal.hidden = false;
}

function closeConfirmModal() {
  pendingAction = null;
  if (confirmModal) confirmModal.hidden = true;
}

function openDetail(title, html) {
  if (detailTitle) detailTitle.textContent = title;
  if (detailBody) detailBody.innerHTML = html;
  if (detailModal) detailModal.hidden = false;
}

function closeDetailModal() {
  if (detailModal) detailModal.hidden = true;
}

function openClarificationForm() {
  if (clarificationMessage) clarificationMessage.value = "";
  if (clarificationModal) clarificationModal.hidden = false;
  setTimeout(() => clarificationMessage?.focus(), 0);
}

function closeClarificationForm() {
  if (clarificationModal) clarificationModal.hidden = true;
}

function statusChip(label, color) {
  return `<span class="status-chip ${color}">${label}</span>`;
}

function getRowTitle(row) {
  return row?.querySelector("strong")?.textContent.trim() || row?.children[0]?.childNodes[0]?.textContent.trim() || "Selected record";
}

function rowDetails(row) {
  return [...row.children].slice(0, -1).map((cell, index) => {
    const heading = row.closest("table")?.tHead?.rows[0]?.children[index]?.textContent.trim() || "Field";
    return `<div><small>${heading}</small><strong>${cell.textContent.trim()}</strong></div>`;
  }).join("");
}

function addNotification(title, message, target = "audit") {
  const list = notificationPanel?.querySelector(".notification-list");
  if (!list) return;
  const item = document.createElement("button");
  item.className = "notification-item unread";
  item.type = "button";
  item.dataset.notificationTarget = target === "users" ? "administration" : target;
  item.dataset.defaultUnread = "false";
  item.innerHTML = `<strong>${title}</strong><span>${message}</span><small>Just now</small>`;
  list.prepend(item);
  updateNotificationCount();
}

function updateNotificationCount() {
  const unread = document.querySelectorAll(".notification-item.unread").length;
  if (notificationCount) {
    notificationCount.textContent = String(unread);
    notificationCount.hidden = unread === 0;
  }
  if (notificationSummary) notificationSummary.textContent = unread ? `${unread} unread updates` : "All caught up";
}

function closeNotificationsPanel() {
  if (notificationPanel) notificationPanel.hidden = true;
  if (notificationButton) notificationButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("notification-open");
}

function toggleNotificationsPanel() {
  if (!notificationPanel || !notificationButton) return;
  const open = notificationPanel.hidden;
  notificationPanel.hidden = !open;
  notificationButton.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("notification-open", open);
}

function applyTextFilter(tableName, searchSelector, statusSelector, extraSelector) {
  const table = document.querySelector(`[data-table="${tableName}"]`);
  if (!table) return;
  const query = (document.querySelector(searchSelector)?.value || "").trim().toLowerCase();
  const statusValue = (document.querySelector(statusSelector)?.value || "").toLowerCase();
  const extraValue = extraSelector ? (document.querySelector(extraSelector)?.value || "").toLowerCase() : "";
  [...table.tBodies[0].rows].forEach((row) => {
    const textMatch = !query || row.textContent.toLowerCase().includes(query);
    const statusMatch = statusValue.startsWith("all") || statusValue.startsWith("any") || row.dataset.status === statusValue || row.dataset.stage === statusValue;
    const extraMatch = !extraSelector || extraValue.startsWith("all") || extraValue.startsWith("any") || row.dataset.compliance === extraValue || row.dataset.nationality === extraValue || row.dataset.type === extraValue || row.dataset.age === extraValue;
    row.hidden = !(textMatch && statusMatch && extraMatch);
  });
}

function applicationAgeValue(row) {
  const value = row?.children[5]?.textContent.trim().toLowerCase() || "";
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : null;
}

function filterApplications() {
  const table = document.querySelector('[data-table="applications"]');
  if (!table) return;
  const query = (document.querySelector("#applicationSearch")?.value || "").trim().toLowerCase();
  const stageValue = (document.querySelector("#applicationStageFilter")?.value || "").toLowerCase();
  const nationalityValue = (document.querySelector("#applicationNationalityFilter")?.value || "").toLowerCase();
  const ageValue = (document.querySelector("#applicationAgeFilter")?.value || "").toLowerCase();

  [...table.tBodies[0].rows].forEach((row) => {
    const age = applicationAgeValue(row);
    const textMatch = !query || row.textContent.toLowerCase().includes(query);
    const stageMatch = stageValue.startsWith("all") || row.dataset.stage === stageValue;
    const nationalityMatch = nationalityValue.startsWith("any") || row.dataset.nationality === nationalityValue;
    const ageMatch = ageValue.startsWith("any") ||
      (ageValue.startsWith("below") && age !== null && age < 60) ||
      (ageValue.startsWith("60") && age !== null && age >= 60);
    row.hidden = !(textMatch && stageMatch && nationalityMatch && ageMatch);
  });
}

function filterAudit() {
  const query = (document.querySelector("#auditSearch")?.value || "").trim().toLowerCase();
  const entity = document.querySelector("#auditEntityFilter")?.value || "All entities";
  if (!auditBody) return;
  [...auditBody.rows].forEach((row) => {
    const matchesQuery = !query || row.textContent.toLowerCase().includes(query);
    const matchesEntity = entity === "All entities" || row.children[3]?.textContent === entity;
    row.hidden = !(matchesQuery && matchesEntity);
  });
}

function filterCurrentPanel(button) {
  const view = button.closest("[data-view]")?.dataset.view;
  const filters = {
    universities: () => applyTextFilter("universities", "#universitySearch", "#universityStatusFilter", "#universityComplianceFilter"),
    programmes: () => applyTextFilter("programmes", "#programmeSearch", "#programmeStatusFilter", "#programmeAgeFilter"),
    applications: filterApplications,
    audit: filterAudit
  };
  filters[view]?.();
}

function runTopSearch(query) {
  const activePanel = document.querySelector(".view-panel.active");
  const match = [...activePanel.querySelectorAll("tr, article, .activity-list div")].find((item) => item.textContent.toLowerCase().includes(query));
  activePanel.querySelectorAll(".highlight").forEach((item) => item.classList.remove("highlight"));
  if (!query || !match) return;
  match.classList.add("highlight");
  match.scrollIntoView({ behavior: "smooth", block: "center" });
}

function setSelectValue(selector, value) {
  const select = document.querySelector(selector);
  if (!select || !value) return;
  const option = [...select.options].find((item) => item.textContent.trim().toLowerCase() === value.toLowerCase());
  if (option) select.value = option.value;
}

function openQueueTarget(button) {
  const target = button.dataset.queueTarget;
  if (!target) return;
  setActiveView(target);
  history.replaceState(null, "", `#${target}`);
  if (target === "programmes") {
    setSelectValue("#programmeStatusFilter", button.dataset.queueStatus);
    setSelectValue("#programmeAgeFilter", button.dataset.queueAge);
    applyTextFilter("programmes", "#programmeSearch", "#programmeStatusFilter", "#programmeAgeFilter");
  }
  if (target === "applications") {
    setSelectValue("#applicationAgeFilter", button.dataset.queueAge);
    filterApplications();
  }
  if (target === "universities") {
    setSelectValue("#universityStatusFilter", button.dataset.queueStatus);
    setSelectValue("#universityComplianceFilter", button.dataset.queueCompliance);
    applyTextFilter("universities", "#universitySearch", "#universityStatusFilter", "#universityComplianceFilter");
  }
}

function openUserForm(row = null) {
  editingUserRow = row;
  if (userModalTitle) userModalTitle.textContent = row ? "Edit User" : "Add User";
  if (saveUserModal) saveUserModal.textContent = row ? "Save Changes" : "Add User";
  if (userName) userName.value = row?.children[0]?.textContent.trim() || "";
  if (userEmail) userEmail.value = row?.children[1]?.textContent.trim() || "";
  if (userLogin) userLogin.value = (row?.children[1]?.textContent.trim() || "").split("@")[0] || "";
  if (userPassword) userPassword.value = "";
  if (userRole) userRole.value = row?.children[2]?.textContent.trim() || "KPT Officer";
  if (userStatus) userStatus.value = row?.children[3]?.textContent.trim() || "Active";
  if (userModal) userModal.hidden = false;
}

function closeUserForm() {
  editingUserRow = null;
  if (userModal) userModal.hidden = true;
}

function saveUserForm() {
  const body = document.querySelector('[data-table="users"] tbody');
  if (!body) return;
  const name = userName?.value.trim() || "New Officer";
  const email = userEmail?.value.trim() || "new.officer@kpt.example";
  const role = userRole?.value || "KPT Officer";
  const status = userStatus?.value || "Active";
  const statusHtml = status === "Active" ? statusChip("Active", "green") : statusChip("Inactive", "neutral");
  if (editingUserRow) {
    editingUserRow.innerHTML = `<td><strong>${name}</strong></td><td>${email}</td><td>${role}</td><td>${statusHtml}</td><td>${currentTimestamp()}</td><td><button data-user-edit>Edit</button></td>`;
    addAudit(`Updated user ${name}`, "User");
  } else {
    const row = document.createElement("tr");
    row.innerHTML = `<td><strong>${name}</strong></td><td>${email}</td><td>${role}</td><td>${statusHtml}</td><td>Never</td><td><button data-user-edit>Edit</button></td>`;
    body.prepend(row);
    addAudit(`Added user ${name}`, "User");
  }
  addNotification("User management updated", `${name} was saved in the KPT / EMGS user list.`, "administration");
  closeUserForm();
}

function getProgrammeRowData(row) {
  const status = row.children[3]?.querySelector(".status-chip")?.textContent.trim() || row.children[3]?.textContent.trim() || "Pending KPT Approval";
  return {
    name: getRowTitle(row),
    university: row.children[1]?.textContent.trim() || "University",
    category: row.children[2]?.textContent.trim() || "Category",
    status,
    submitted: row.children[4]?.textContent.trim() || "13 Aug 2026",
    age: row.children[5]?.textContent.trim() || "0 days",
    duration: row.dataset.duration || "30 Days",
    fee: row.dataset.fee || "RM 3,500",
    language: row.dataset.language || "English",
    target: row.dataset.target || "General Public (including student)",
    credit: row.dataset.credit || "Eligible",
    activities: row.dataset.activities || "Activity 1, Activity 2, guided site visit",
    outcome: row.dataset.outcome || "Participants complete guided activities, site visits, and a reflective project assessed by university facilitators.",
    overview: row.dataset.overview || "Programme overview appears here."
  };
}

function updateProgrammeApprovalRow(row, status, color) {
  row.dataset.status = status.toLowerCase();
  row.children[3].innerHTML = statusChip(status, color);
  row.children[5].textContent = status === "Approved" || status === "Rejected" ? "-" : row.children[5].textContent;
  row.children[6].innerHTML = '<button data-programme-view>View</button>';
  applyTextFilter("programmes", "#programmeSearch", "#programmeStatusFilter", "#programmeAgeFilter");
}

function renderProgrammeSidePanel(row) {
  if (!row || !programmeSidePanel) return;
  activeProgrammeRow = row;
  document.querySelectorAll('[data-table="programmes"] tbody tr').forEach((item) => item.classList.toggle("selected-row", item === row));
  const data = getProgrammeRowData(row);
  const statusColor = universityStatusColor(data.status);
  programmeSidePanel.hidden = false;
  programmesSplitLayout?.classList.add("has-side-panel");
  programmeSidePanel.innerHTML = `
    <div class="side-review-head">
      <div>
        <small>Programme approval review</small>
        <h3>${escapeHtml(data.name)}</h3>
      </div>
      <button type="button" data-close-programme-side aria-label="Close programme review">X</button>
    </div>
    <div class="side-status-row">${statusChip(data.status, statusColor)}</div>
    <div class="side-review-layout">
      <div class="side-review-main">
        <div class="side-review-grid programme-review-grid">
          <div><small>University</small><strong>${escapeHtml(data.university)}</strong></div>
          <div><small>Category</small><strong>${escapeHtml(data.category)}</strong></div>
          <div><small>Duration</small><strong>${escapeHtml(data.duration)}</strong></div>
          <div><small>Fee</small><strong>${escapeHtml(data.fee)}</strong></div>
          <div><small>Submitted</small><strong>${escapeHtml(data.submitted)}</strong></div>
          <div><small>Age</small><strong>${escapeHtml(data.age)}</strong></div>
          <div><small>Language</small><strong>${escapeHtml(data.language)}</strong></div>
          <div><small>Credit Transfer</small><strong>${escapeHtml(data.credit)}</strong></div>
        </div>
        <div class="side-signal"><small>Overview</small><strong>${escapeHtml(data.overview)}</strong></div>
        ${row.dataset.kptNote ? `<div class="side-signal"><small>Latest KPT note</small><strong>${escapeHtml(row.dataset.kptNote)}</strong></div>` : ""}
        <div class="side-mini-docs">
          <h4>Submitted Programme Content</h4>
          <div><span>Target group</span><strong>${escapeHtml(data.target)}</strong></div>
          <div><span>Activities</span><strong>${escapeHtml(data.activities)}</strong></div>
          <div><span>Learning scope</span><strong>${escapeHtml(data.outcome)}</strong></div>
          <div><span>Gallery</span><button type="button" class="inline-panel-button" data-programme-gallery>3 images submitted</button></div>
        </div>
      </div>
      <aside class="university-actions side-action-panel programme-action-panel">
        <h4>KPT Actions</h4>
        <div class="programme-action-block approve">
          <strong>Approve programme</strong>
          <span>Use when the submitted programme is acceptable for KPT approval.</span>
          <button type="button" data-programme-action="approve">Approve</button>
        </div>
        <div class="programme-action-block changes">
          <strong>Need further clarification / changes</strong>
          <span>Return the programme to the university with specific corrections.</span>
          <textarea rows="4" data-programme-change-note placeholder="Explain what the university must correct or clarify"></textarea>
          <button type="button" data-programme-action="changes">Send changes request</button>
        </div>
        <div class="programme-action-block reject">
          <strong>Reject programme</strong>
          <span>Use only when the programme cannot proceed in its submitted form.</span>
          <textarea rows="4" data-programme-reject-note placeholder="State the rejection reason for audit and university visibility"></textarea>
          <button type="button" data-programme-action="reject">Reject programme</button>
        </div>
      </aside>
    </div>
  `;
}

function closeProgrammeSidePanel() {
  if (programmeSidePanel) programmeSidePanel.hidden = true;
  programmesSplitLayout?.classList.remove("has-side-panel");
  document.querySelectorAll('[data-table="programmes"] tbody tr').forEach((item) => item.classList.remove("selected-row"));
}

function handleProgrammePanelAction(button) {
  const row = activeProgrammeRow;
  if (!row) return;
  const action = button.dataset.programmeAction;
  const programmeName = getRowTitle(row);
  if (action === "approve") {
    openConfirm("Approve programme?", `Approve ${programmeName}? KPT will launch it when ready for applications.`, () => {
      updateProgrammeApprovalRow(row, "Approved", "green");
      addAudit(`Approved ${programmeName}`, "Programme");
      addNotification("Programme approved", `${programmeName} is now approved by KPT.`, "programmes");
      renderProgrammeSidePanel(row);
    }, "Approve");
    return;
  }
  if (action === "changes") {
    const note = programmeSidePanel?.querySelector("[data-programme-change-note]")?.value.trim() || "Please clarify the programme fee, learning scope, and submitted activity details.";
    openConfirm("Request programme changes?", `Send this change request to ${programmeName}?`, () => {
      row.dataset.kptNote = note;
      updateProgrammeApprovalRow(row, "Changes Requested", "purple");
      addAudit(`Requested changes for ${programmeName}: ${note}`, "Programme");
      addNotification("KPT changes requested", `${programmeName} has been returned to the university.`, "programmes");
      renderProgrammeSidePanel(row);
    }, "Send Request");
    return;
  }
  if (action === "reject") {
    const reason = programmeSidePanel?.querySelector("[data-programme-reject-note]")?.value.trim() || "Programme did not meet KPT approval requirements based on the submitted scope and supporting details.";
    openConfirm("Reject programme?", `Reject ${programmeName} with the entered reason?`, () => {
      row.dataset.kptNote = reason;
      updateProgrammeApprovalRow(row, "Rejected", "red");
      addAudit(`Rejected ${programmeName}: ${reason}`, "Programme");
      addNotification("Programme rejected", `${programmeName} was rejected by KPT.`, "programmes");
      renderProgrammeSidePanel(row);
    }, "Reject");
  }
}

function universityStatusColor(status) {
  const normalized = status.toLowerCase();
  if (normalized === "approved" || normalized === "live" || normalized === "clear" || normalized === "verified") return "green";
  if (normalized === "pending review" || normalized === "pending kpt approval" || normalized === "action required") return "amber";
  if (normalized === "clarification requested" || normalized === "changes requested") return "purple";
  if (normalized === "resubmitted" || normalized === "watch") return "blue";
  if (normalized === "suspended" || normalized === "rejected" || normalized === "blocked") return "red";
  if (normalized === "archived") return "neutral";
  return "neutral";
}

function updateUniversityRow(row, status, compliance) {
  row.dataset.status = status.toLowerCase();
  row.dataset.compliance = compliance.toLowerCase();
  row.dataset.complianceSignal = status === "Clarification Requested" ? "KPT clarification pending from university" : compliance === "Clear" ? "No open KPT credential requests" : row.dataset.complianceSignal || "KPT compliance review required";
  row.children[1].innerHTML = statusChip(status, universityStatusColor(status));
  row.children[4].innerHTML = `${statusChip(compliance, compliance === "Clear" ? "green" : compliance === "Watch" ? "blue" : compliance === "Blocked" ? "red" : "amber")}<small>${row.dataset.complianceSignal}</small>`;
  row.children[5].textContent = row.dataset.responseTime || "Pending";
  row.children[6].textContent = currentTimestamp();
  applyTextFilter("universities", "#universitySearch", "#universityStatusFilter", "#universityComplianceFilter");
}

function confirmUniversityDecision(row, status, compliance, label) {
  const name = getRowTitle(row);
  openConfirm(`${label} university?`, `Confirm ${label.toLowerCase()} for ${name}? This will update the university record and audit log.`, () => {
    updateUniversityRow(row, status, compliance);
    addAudit(`${label} ${name}`, "University");
    addNotification(`University ${status.toLowerCase()}`, `${name} is now ${status.toLowerCase()}.`, "universities");
    if (document.querySelector('[data-view="university-detail"]')?.classList.contains("active")) {
      renderUniversityDetail(row);
    } else {
      renderUniversitySidePanel(row);
    }
  }, label);
}

function universityClarifications(row) {
  try {
    return JSON.parse(row?.dataset.clarifications || "[]");
  } catch {
    return [];
  }
}

function clarificationHistoryHtml(row) {
  const messages = universityClarifications(row);
  if (!messages.length) return "";
  return `
    <div class="clarification-history">
      <h4>Clarification History</h4>
      ${messages.map((item) => `
        <div class="clarification-item">
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(item.message)}</span>
          <small>${escapeHtml(item.time)}</small>
        </div>
      `).join("")}
    </div>
  `;
}

function sendUniversityClarification() {
  const row = activeUniversityRow;
  if (!row) return;
  const message = clarificationMessage?.value.trim() || "Please clarify the uploaded credential document and provide the latest supporting file.";
  const existing = universityClarifications(row);
  existing.unshift({
    title: "KPT requested clarification",
    message,
    time: currentTimestamp()
  });
  row.dataset.clarifications = JSON.stringify(existing);
  row.dataset.openRequests = String(Number(row.dataset.openRequests || 0) + 1);
  row.dataset.responseTime = row.dataset.responseTime || "Pending";
  row.dataset.complianceSignal = "KPT clarification pending from university";
  updateUniversityRow(row, "Clarification Requested", "Action Required");
  addAudit(`Requested clarification from ${getRowTitle(row)}`, "University");
  addNotification("University clarification requested", `${getRowTitle(row)} has been asked to clarify credentials.`, "universities");
  closeClarificationForm();
  if (document.querySelector('[data-view="university-detail"]')?.classList.contains("active")) {
    renderUniversityDetail(row);
    document.querySelector('[data-university-tab="compliance"]')?.click();
  } else {
    renderUniversitySidePanel(row);
  }
}

function universityProgrammes(name, status) {
  if (/Cyberjaya/.test(name)) return [
    ["Global Health Innovation Lab", "Health Sciences", "Pending KPT Approval", "0", "17 Aug 2026"],
    ["Tropical Biodiversity Programme", "Nature & Environment", "Live", "24", "16 Aug 2026"],
    ["Digital Entrepreneurship Bootcamp", "Business & Innovation", "Live", "31", "15 Aug 2026"],
    ["Marine Conservation Lab", "Nature & Environment", "Archived", "7", "12 Aug 2026"]
  ];
  if (/Penang/.test(name)) return [
    ["Smart Tourism Analytics", "Technology", "Resubmitted", "0", "17 Aug 2026"],
    ["Malaysian Heritage Experience", "Culture & Heritage", "Live", "16", "14 Aug 2026"],
    ["Applied AI for Tourism", "Technology", "Approved", "9", "13 Aug 2026"]
  ];
  if (/Metro/.test(name)) return [
    ["Fast Track Business Camp", "Business", "Rejected", "0", "10 Aug 2026"],
    ["Urban Mobility Workshop", "Urban Studies", "Archived", "14", "9 Aug 2026"],
    ["Food Culture Field School", "Culinary Culture", "Changes Requested", "0", "8 Aug 2026"]
  ];
  return [
    ["EduTourism Foundation Programme", "Academic Exchange", status === "Rejected" ? "Rejected" : "Pending KPT Approval", "0", "16 Aug 2026"],
    ["Cultural Field Immersion", "Culture & Heritage", status === "Approved" ? "Approved" : "Changes Requested", status === "Approved" ? "18" : "0", "15 Aug 2026"]
  ];
}

function programmeBreakdown(items) {
  const counts = { total: items.length, pending: 0, changes: 0, approved: 0, live: 0, archived: 0, rejected: 0, resubmitted: 0 };
  items.forEach((item) => {
    const status = item[2].toLowerCase();
    if (status.includes("pending")) counts.pending += 1;
    else if (status.includes("changes")) counts.changes += 1;
    else if (status.includes("resubmitted")) counts.resubmitted += 1;
    else if (status.includes("live")) counts.live += 1;
    else if (status.includes("archived")) counts.archived += 1;
    else if (status.includes("rejected")) counts.rejected += 1;
    else if (status.includes("approved")) counts.approved += 1;
  });
  return counts;
}

function universityMonitoringData(row) {
  const data = getUniversityRowData(row);
  const programmes = universityProgrammes(data.name, data.status);
  const breakdown = programmeBreakdown(programmes);
  const responseDays = Number.parseInt(data.responseTime, 10);
  const avgApprovalAge = data.status === "Rejected" ? "-" : `${Math.max(3, responseDays || 4) + breakdown.pending + breakdown.changes} days`;
  const escalated = data.compliance === "Blocked" ? 6 : data.compliance === "Action Required" ? 4 : data.compliance === "Watch" ? 3 : 1;
  const activeApplicants = Math.max(0, Math.round(Number(data.applicants || 0) * 0.34));
  const awaitingApplicants = Math.max(0, Math.round(Number(data.applicants || 0) * 0.28));
  const approvedApplicants = Math.max(0, Math.round(Number(data.applicants || 0) * 0.26));
  const closedApplicants = Math.max(0, Number(data.applicants || 0) - activeApplicants - awaitingApplicants - approvedApplicants);
  const riskSignals = [];
  if (data.compliance === "Action Required" || Number(data.openRequests) > 0) riskSignals.push(`${data.openRequests} open KPT request${Number(data.openRequests) === 1 ? "" : "s"}`);
  if (data.compliance === "Watch") riskSignals.push("Repeated late clarification replies");
  if (data.status === "Suspended") riskSignals.push("Participation suspended until KPT clears unresolved issues");
  if (data.status === "Rejected" || data.compliance === "Blocked") riskSignals.push("Eligibility or credential failure recorded");
  if (escalated >= 3) riskSignals.push(`${escalated} escalated applicant records`);
  if (!riskSignals.length) riskSignals.push("No immediate risk signal");
  return {
    ...data,
    programmesList: programmes,
    breakdown,
    avgApprovalAge,
    escalated,
    applicantMix: {
      active: activeApplicants,
      awaiting: awaitingApplicants,
      approved: approvedApplicants,
      closed: closedApplicants
    },
    riskSignals
  };
}

function getUniversityRowData(row) {
  const name = getRowTitle(row);
  const reference = row.children[0]?.querySelector("small")?.textContent.trim() || "EDU-REF";
  const status = row.children[1]?.querySelector(".status-chip")?.textContent.trim() || row.children[1]?.textContent.trim() || "Pending Review";
  const programmes = row.children[2]?.textContent.trim() || "0";
  const applicants = row.children[3]?.textContent.trim() || "0";
  const compliance = row.children[4]?.querySelector(".status-chip")?.textContent.trim() || row.children[4]?.textContent.trim() || "Action Required";
  const responseTime = row.children[5]?.textContent.trim() || row.dataset.responseTime || "3 days";
  const lastActivity = row.children[6]?.textContent.trim() || "17 Aug 2026";
  return {
    name,
    reference,
    status,
    programmes,
    applicants,
    compliance,
    lastActivity,
    openRequests: row.dataset.openRequests || "0",
    responseTime,
    complianceSignal: row.dataset.complianceSignal || "No open KPT credential requests"
  };
}

function nextUniversityStep(status, compliance, openRequests) {
  if (status === "Rejected") return "Record closed. View the rejection reason or keep the record for audit.";
  if (status === "Suspended") return "Review unresolved compliance items, then reactivate or reject.";
  if (compliance === "Action Required" || Number(openRequests) > 0) return "Wait for university reply or request clarification again.";
  if (compliance === "Watch") return "Monitor response pattern, then clear compliance if resolved.";
  if (status === "Pending Review" || status === "Clarification Requested") return "Review credentials and approve, request clarification, or reject.";
  return "No immediate action. Keep monitoring programmes and applications.";
}

function renderUniversitySidePanel(row) {
  if (!row || !universitySidePanel) return;
  activeUniversityRow = row;
  document.querySelectorAll('[data-table="universities"] tbody tr').forEach((item) => item.classList.toggle("selected-row", item === row));
  const data = universityMonitoringData(row);
  const statusColor = universityStatusColor(data.status);
  const complianceColor = data.compliance === "Clear" ? "green" : data.compliance === "Watch" ? "blue" : data.compliance === "Blocked" ? "red" : "amber";
  universitySidePanel.hidden = false;
  universitiesSplitLayout?.classList.add("has-side-panel");
  universitySidePanel.innerHTML = `
    <div class="side-review-head">
      <div>
        <small>${data.reference}</small>
        <h3>${data.name}</h3>
      </div>
      <button type="button" data-close-side-panel aria-label="Close university review">X</button>
    </div>
    <div class="side-status-row">${statusChip(data.status, statusColor)} ${statusChip(data.compliance, complianceColor)}</div>
    <nav class="detail-tabs side-detail-tabs" aria-label="University side review tabs">
      <button class="active" type="button" data-side-university-tab="overview">Overview</button>
      <button type="button" data-side-university-tab="programmes">Programme Breakdown</button>
      <button type="button" data-side-university-tab="compliance">Compliance</button>
    </nav>
    <div class="side-review-layout">
      <div class="side-review-main">
        <section class="side-content-section active" data-side-university-panel="overview">
          <h4>Overview</h4>
          <div class="side-review-grid">
            <div><small>Programmes</small><strong>${data.programmes}</strong></div>
            <div><small>Applicants</small><strong>${data.applicants}</strong></div>
            <div><small>Avg Response</small><strong>${data.responseTime}</strong></div>
            <div><small>Avg Approval Age</small><strong>${data.avgApprovalAge}</strong></div>
            <div><small>Active Review</small><strong>${data.applicantMix.active}</strong></div>
            <div><small>Awaiting Response</small><strong>${data.applicantMix.awaiting}</strong></div>
            <div><small>Approved</small><strong>${data.applicantMix.approved}</strong></div>
            <div><small>Escalated Apps</small><strong>${data.escalated}</strong></div>
          </div>
          <div class="side-mini-docs">
            <h4>Credentials</h4>
            <div><span>MOHE registration certificate</span><span class="side-doc-actions">${statusChip("Received", "green")}<button type="button" data-document-preview="MOHE registration certificate">View</button><button type="button" data-document-download="MOHE registration certificate">Download</button></span></div>
            <div><span>Representative letter</span><span class="side-doc-actions">${Number(data.openRequests) > 0 ? statusChip("Check", "amber") : statusChip("Verified", "green")}<button type="button" data-document-preview="Official representative letter">View</button><button type="button" data-document-download="Official representative letter">Download</button></span></div>
            <div><span>Participation declaration</span><span class="side-doc-actions">${data.compliance === "Blocked" ? statusChip("Issue", "red") : statusChip("Received", "blue")}<button type="button" data-document-preview="EduTourism participation declaration">View</button><button type="button" data-document-download="EduTourism participation declaration">Download</button></span></div>
          </div>
        </section>
        <section class="side-content-section" data-side-university-panel="programmes" hidden>
          <h4>Programme Breakdown</h4>
          <div class="side-mini-table">
            ${data.programmesList.map(([programme, category, programmeStatus]) => `
              <div><span><strong>${escapeHtml(programme)}</strong><small>${escapeHtml(category)}</small></span>${statusChip(programmeStatus, universityStatusColor(programmeStatus) || "neutral")}</div>
            `).join("")}
          </div>
        </section>
        <section class="side-content-section" data-side-university-panel="compliance" hidden>
          <h4>Compliance</h4>
          <div class="side-signal">
            <small>Current status</small>
            <strong>${data.compliance} - ${data.complianceSignal}</strong>
          </div>
          <div class="side-mini-docs">
            <h4>Compliance Log</h4>
            ${data.riskSignals.map((signal) => `<div><span>${escapeHtml(signal)}</span>${statusChip(signal === "No immediate risk signal" ? "Clear" : "Watch", signal === "No immediate risk signal" ? "green" : "amber")}</div>`).join("")}
            <div><span>Credentials received on 15 Aug 2026</span>${statusChip("Logged", "blue")}</div>
            <div><span>University profile created on 12 Aug 2026</span>${statusChip("Logged", "blue")}</div>
          </div>
        </section>
      </div>
      <aside class="university-actions side-action-panel">
        <h4>KPT Actions</h4>
        <button class="primary" type="button" data-university-action="approve">Approve participation</button>
        <button type="button" data-university-action="clarify">Request clarification</button>
        <button type="button" data-university-action="watch">Mark compliance watch</button>
        <button type="button" data-university-action="clear">Clear compliance</button>
        <button type="button" data-university-action="suspend">Suspend participation</button>
        <button type="button" data-university-action="reactivate">Reactivate</button>
        <button class="danger" type="button" data-university-action="reject">Reject participation</button>
        <button class="expand-detail-btn" type="button" data-expand-university-detail>Expand full view</button>
      </aside>
    </div>
  `;
  addAudit(`Opened side review for ${data.name}`, "University");
}

function closeUniversitySidePanel() {
  if (universitySidePanel) universitySidePanel.hidden = true;
  universitiesSplitLayout?.classList.remove("has-side-panel");
  document.querySelectorAll('[data-table="universities"] tbody tr').forEach((item) => item.classList.remove("selected-row"));
}

function applicationStatusColor(stage) {
  const normalised = String(stage || "").toLowerCase();
  if (normalised.includes("required")) return "amber";
  if (normalised.includes("submitted") || normalised.includes("new")) return "blue";
  if (normalised.includes("pre-approved") || normalised.includes("approved")) return "green";
  if (normalised.includes("rejected")) return "red";
  return "neutral";
}

function applicationMeta(row) {
  const applicantCell = row.children[0];
  const applicantParts = [...applicantCell.querySelectorAll("small")].map((item) => item.textContent.trim());
  const applicantName = applicantCell.childNodes[0]?.textContent.trim() || "Applicant";
  return {
    name: applicantName,
    tracking: applicantParts[0] || "EDT-2026-000000",
    nationality: applicantParts[1] || "Not stated",
    university: row.children[1]?.textContent.trim() || "University",
    programme: row.children[2]?.textContent.trim() || "Programme",
    stage: row.children[3]?.textContent.trim() || "Stage",
    lastUpdated: row.children[4]?.textContent.trim() || "-",
    age: row.children[5]?.textContent.trim() || "-",
    appliedDate: "12 Aug 2026",
    applicantType: row.dataset.nationality === "malaysia" ? "Malaysian" : "International",
    email: `${applicantName.toLowerCase().replaceAll(" ", ".")}@student.example`,
    phone: row.dataset.nationality === "malaysia" ? "+60 11-555 0188" : "+60 11-555 2148",
    immigration: row.dataset.nationality === "malaysia" ? "Not required" : "Student pass / visa required"
  };
}

function openApplicationSidePanel(row) {
  if (!row || !applicationSidePanel) return;
  activeApplicationRow?.classList.remove("selected-row");
  activeApplicationRow = row;
  row.classList.add("selected-row");
  applicationsSplitLayout?.classList.add("has-side-panel");
  const data = applicationMeta(row);
  const ageNumber = applicationAgeValue(row);
  const showEscalate = ageNumber !== null && ageNumber >= 60;
  applicationSidePanel.hidden = false;
  applicationSidePanel.innerHTML = `
    <div class="side-review-head">
      <div>
        <small>${escapeHtml(data.tracking)}</small>
        <h3>${escapeHtml(data.name)}</h3>
      </div>
      <button type="button" data-close-application-side aria-label="Close application review">X</button>
    </div>
    <div class="side-status-row">${statusChip(data.stage, applicationStatusColor(data.stage))}</div>
    <div class="side-review-layout">
      <div class="side-review-main">
        <div class="side-signal"><small>Programme</small><strong>${escapeHtml(data.programme)}</strong></div>
        <div class="side-review-grid">
          <div><small>University</small><strong>${escapeHtml(data.university)}</strong></div>
          <div><small>Nationality</small><strong>${escapeHtml(data.nationality)}</strong></div>
          <div><small>Applicant Type</small><strong>${escapeHtml(data.applicantType)}</strong></div>
          <div><small>Age</small><strong>${escapeHtml(data.age)}</strong></div>
        </div>
        <div class="side-review-grid">
          <div><small>Email</small><strong>${escapeHtml(data.email)}</strong></div>
          <div><small>Phone</small><strong>${escapeHtml(data.phone)}</strong></div>
          <div><small>Applied Date</small><strong>${escapeHtml(data.appliedDate)}</strong></div>
          <div><small>Last Updated</small><strong>${escapeHtml(data.lastUpdated)}</strong></div>
        </div>
        <div class="side-mini-docs">
          <h4>Application Documents</h4>
          <div><span>Passport copy</span><span class="side-doc-actions">${statusChip("Received", "green")}<button type="button" data-document-preview="Passport copy">View</button><button type="button" data-document-download="Passport copy">Download</button></span></div>
          <div><span>University decision record</span><span class="side-doc-actions">${statusChip(data.stage, applicationStatusColor(data.stage))}<button type="button" data-document-preview="University decision record">View</button></span></div>
        </div>
        <div class="activity-list compliance-log">
          <div><strong>${escapeHtml(data.stage)}</strong><span>Current application stage from the university dashboard.</span><small>${escapeHtml(data.lastUpdated)}</small></div>
          <div><strong>Last action age</strong><span>${data.age === "-" ? "Closed applications are not counted for active age monitoring." : `${escapeHtml(data.age)} since the last recorded action.`}</span><small>KPT monitoring</small></div>
          <div><strong>Immigration requirement</strong><span>${escapeHtml(data.immigration)}</span><small>EMGS check</small></div>
        </div>
      </div>
      <aside class="university-actions side-action-panel">
        <h4>KPT / EMGS Actions</h4>
        <button type="button" data-application-action="Request university update">Request university update</button>
        ${showEscalate ? `<button type="button" class="danger" data-application-action="Escalate delayed case">Escalate delayed case</button>` : `<div class="side-signal"><small>Escalation</small><strong>Available when age reaches 60 days.</strong></div>`}
      </aside>
    </div>
  `;
  addAudit(`Opened side review for ${data.tracking}`, "Application");
}

function closeApplicationSidePanel() {
  if (applicationSidePanel) applicationSidePanel.hidden = true;
  applicationsSplitLayout?.classList.remove("has-side-panel");
  activeApplicationRow?.classList.remove("selected-row");
  activeApplicationRow = null;
}

function renderUniversityDetail(row) {
  if (!row) return;
  activeUniversityRow = row;
  const data = universityMonitoringData(row);
  const { name, reference, status, programmes, applicants, compliance, lastActivity, openRequests, responseTime, complianceSignal } = data;
  const statusColor = universityStatusColor(status);
  const complianceColor = compliance === "Clear" ? "green" : compliance === "Watch" ? "blue" : compliance === "Blocked" ? "red" : "amber";

  if (universityDetailName) universityDetailName.textContent = name;
  if (universityDetailMeta) universityDetailMeta.textContent = `${reference}  ${programmes} programmes  ${applicants} applicants`;
  if (universityDetailStatus) universityDetailStatus.innerHTML = `<strong>Status:</strong> ${statusChip(status, statusColor)} ${statusChip(compliance, complianceColor)}`;
  if (universityOverview) {
    universityOverview.innerHTML = `
      <section class="overview-group">
        <h3>Institution Details</h3>
        <div class="overview-fields">
          <div><small>Institution Name</small><strong>${name}</strong></div>
          <div><small>Institution Type</small><strong>Private Higher Education Institution</strong></div>
          <div><small>Registration Number</small><strong>MOHE-2026-${reference.slice(-3)}</strong></div>
          <div><small>Institution Reference</small><strong>${reference}</strong></div>
          <div><small>Last Activity</small><strong>${lastActivity}</strong></div>
        </div>
      </section>
      <section class="overview-group">
        <h3>Applicant Mix</h3>
        <div class="overview-fields">
          <div><small>Total Applicants</small><strong>${applicants}</strong></div>
          <div><small>Active Review</small><strong>${data.applicantMix.active}</strong></div>
          <div><small>Awaiting Response</small><strong>${data.applicantMix.awaiting}</strong></div>
          <div><small>Approved</small><strong>${data.applicantMix.approved}</strong></div>
          <div><small>Closed / Exit</small><strong>${data.applicantMix.closed}</strong></div>
          <div><small>Escalated Applications</small><strong>${data.escalated}</strong></div>
        </div>
      </section>
      <section class="overview-group">
        <h3>Credentials</h3>
        <div class="overview-fields">
          <div><small>MOHE Certificate</small><strong>Received</strong></div>
          <div><small>Representative Letter</small><strong>${Number(openRequests) > 0 ? "Check required" : "Verified"}</strong></div>
          <div><small>Participation Declaration</small><strong>${compliance === "Blocked" ? "Issue found" : "Received"}</strong></div>
          <div><small>Open KPT Requests</small><strong>${openRequests}</strong></div>
        </div>
      </section>
      <section class="overview-group">
        <h3>Contact & Control</h3>
        <div class="overview-fields">
          <div><small>Primary Contact</small><strong>EduTourism Coordinator</strong></div>
          <div><small>Contact Number</small><strong>+60 3-5555 0100</strong></div>
          <div class="field-wide"><small>Official Email</small><strong><a href="mailto:edutourism@${name.toLowerCase().replaceAll(" ", "")}.example">edutourism@${name.toLowerCase().replaceAll(" ", "")}.example</a></strong></div>
        </div>
      </section>
    `;
  }
  if (universityCredentials) {
    universityCredentials.innerHTML = `
      <div class="side-signal">
        <small>Current compliance status</small>
        <strong>${compliance} - ${complianceSignal}</strong>
      </div>
      <div class="document-row">
        <div><strong>MOHE registration certificate</strong><small>Required to confirm institution recognition and registration validity.</small></div>
        <div class="document-actions">${statusChip("Received", "green")}<button type="button" data-document-preview="MOHE registration certificate">View</button><button type="button" data-document-download="MOHE registration certificate">Download</button></div>
      </div>
      <div class="document-row">
        <div><strong>Official representative letter</strong><small>Required to verify the staff member authorised to manage EduTourism submissions.</small></div>
        <div class="document-actions">${Number(openRequests) > 0 ? statusChip("Check", "amber") : statusChip("Verified", "green")}<button type="button" data-document-preview="Official representative letter">View</button><button type="button" data-document-download="Official representative letter">Download</button></div>
      </div>
      <div class="document-row">
        <div><strong>EduTourism participation declaration</strong><small>Required to confirm programme terms, compliance responsibility, and official contact details.</small></div>
        <div class="document-actions">${compliance === "Blocked" ? statusChip("Issue", "red") : statusChip("Received", "blue")}<button type="button" data-document-preview="EduTourism participation declaration">View</button><button type="button" data-document-download="EduTourism participation declaration">Download</button></div>
      </div>
      <div class="document-row">
        <div><strong>Documents required from university</strong><small>Use request clarification when credentials are incomplete, expired, mismatched, or unclear.</small></div>
        <div class="document-actions"><button type="button" data-university-action="clarify">Request clarification</button></div>
      </div>
      <div class="activity-list compliance-log">
        <div><strong>${compliance}</strong><span>${complianceSignal}</span><small>${lastActivity}</small></div>
        ${data.riskSignals.map((signal) => `<div><strong>Risk signal</strong><span>${escapeHtml(signal)}</span><small>Current review</small></div>`).join("")}
        <div><strong>Credentials received</strong><span>Registration, representative letter, and participation declaration are available for KPT review.</span><small>15 Aug 2026</small></div>
        <div><strong>University profile created</strong><span>${name} submitted institution details for EduTourism participation.</span><small>12 Aug 2026</small></div>
      </div>
      ${clarificationHistoryHtml(row)}
    `;
  }
  if (universityProgrammeBody) {
    universityProgrammeBody.innerHTML = universityProgrammes(name, status).map(([programme, category, programmeStatus, count, date]) => `
      <tr><td><strong>${programme}</strong><small>${category} · ${count} applicants · ${date}</small></td><td>${statusChip(programmeStatus, universityStatusColor(programmeStatus) || "neutral")}</td></tr>
    `).join("");
  }
}

function openUniversityDetail(row) {
  renderUniversityDetail(row);
  setActiveView("university-detail");
  history.replaceState(null, "", "#universities/detail");
  addAudit(`Viewed university ${getRowTitle(row)}`, "University");
}

function entityFromTable(tableName) {
  if (tableName === "universities") return "University";
  if (tableName === "programmes") return "Programme";
  if (tableName === "applications") return "Application";
  if (tableName === "users") return "User";
  return "Record";
}

function handleRowAction(button) {
  const row = button.closest("tr");
  const tableName = row?.closest("[data-table]")?.dataset.table || "record";
  const title = getRowTitle(row);
  const action = button.dataset.rowAction;
  const entity = entityFromTable(tableName);

  if (tableName === "applications" && /view/i.test(action)) {
    openApplicationSidePanel(row);
    return;
  }

  if (/view/i.test(action)) {
    openDetail(action, `<div class="detail-summary">${rowDetails(row)}</div><div class="detail-note">This prototype panel represents the full ${entity.toLowerCase()} record. In production this would show documents, notes, decision history, compliance status, and linked university actions.</div>`);
    addAudit(action, entity);
    return;
  }

  openConfirm(`${action}?`, `Confirm ${action.toLowerCase()} for ${title}? This will update the row and audit log for the prototype.`, () => {
    if (/reactivate/i.test(action)) {
      row.dataset.status = "approved";
      row.dataset.compliance = "watch";
      row.children[1].innerHTML = statusChip("Approved", "green");
      row.children[4].innerHTML = statusChip("Watch", "blue");
      row.children[row.children.length - 1].innerHTML = '<button data-row-action="View university">View</button>';
    }
    if (/clarification/i.test(action)) {
      row.dataset.compliance = "action required";
      row.children[4].innerHTML = statusChip("Action Required", "amber");
    }
    if (/request/i.test(action)) {
      row.children[row.children.length - 2].textContent = currentTimestamp();
    }
    if (/escalate/i.test(action)) {
      const statusCell = tableName === "applications" ? row.children[3] : row.children[4];
      if (statusCell) statusCell.innerHTML = statusChip("Escalated", "red");
      row.dataset.status = "delayed";
    }
    addAudit(`${action} for ${title}`, entity);
    addNotification(action, `${title} was updated by KPT / EMGS.`, tableName);
  }, /request/i.test(action) ? "Send" : "Confirm");
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveView(link.dataset.viewLink);
    history.replaceState(null, "", `#${link.dataset.viewLink}`);
  });
});

document.querySelectorAll("[data-view-link-button]").forEach((button) => {
  button.addEventListener("click", () => {
    setActiveView(button.dataset.viewLinkButton);
    history.replaceState(null, "", `#${button.dataset.viewLinkButton}`);
  });
});

document.querySelectorAll("[data-filter-button]").forEach((button) => {
  button.addEventListener("click", () => filterCurrentPanel(button));
});

[
  ["#universitySearch", "universities", "#universitySearch", "#universityStatusFilter", "#universityComplianceFilter"],
  ["#universityStatusFilter", "universities", "#universitySearch", "#universityStatusFilter", "#universityComplianceFilter"],
  ["#universityComplianceFilter", "universities", "#universitySearch", "#universityStatusFilter", "#universityComplianceFilter"],
  ["#programmeSearch", "programmes", "#programmeSearch", "#programmeStatusFilter", "#programmeAgeFilter"],
  ["#programmeStatusFilter", "programmes", "#programmeSearch", "#programmeStatusFilter", "#programmeAgeFilter"],
  ["#programmeAgeFilter", "programmes", "#programmeSearch", "#programmeStatusFilter", "#programmeAgeFilter"],
  ["#applicationSearch", "applications"],
  ["#applicationStageFilter", "applications"],
  ["#applicationNationalityFilter", "applications"],
  ["#applicationAgeFilter", "applications"],
].forEach(([selector, table, search, status, extra]) => {
  document.querySelector(selector)?.addEventListener(selector.includes("Search") ? "input" : "change", () => {
    if (table === "applications") filterApplications();
    else applyTextFilter(table, search, status, extra);
  });
});

document.querySelector("#auditSearch")?.addEventListener("input", filterAudit);
document.querySelector("#auditEntityFilter")?.addEventListener("change", filterAudit);

document.addEventListener("click", (event) => {
  const sectionTooltip = event.target.closest(".section-tooltip");
  if (sectionTooltip) {
    event.stopPropagation();
    document.querySelectorAll(".section-tooltip").forEach((tooltip) => {
      if (tooltip !== sectionTooltip) tooltip.classList.remove("tooltip-open");
    });
    sectionTooltip.classList.toggle("tooltip-open");
    return;
  }
  const universityView = event.target.closest("[data-university-view]");
  if (universityView) {
    renderUniversitySidePanel(universityView.closest("tr"));
    return;
  }
  const closeSidePanel = event.target.closest("[data-close-side-panel]");
  if (closeSidePanel) {
    closeUniversitySidePanel();
    return;
  }
  const expandUniversityDetail = event.target.closest("[data-expand-university-detail]");
  if (expandUniversityDetail) {
    openUniversityDetail(activeUniversityRow);
    return;
  }
  const universityAction = event.target.closest("[data-university-action]");
  if (universityAction) {
    const row = activeUniversityRow;
    if (!row) return;
    const action = universityAction.dataset.universityAction;
    if (action === "approve") confirmUniversityDecision(row, "Approved", "Clear", "Approve");
    if (action === "clarify") openClarificationForm();
    if (action === "watch") confirmUniversityDecision(row, row.children[1]?.textContent.trim() || "Approved", "Watch", "Mark watch");
    if (action === "clear") confirmUniversityDecision(row, row.children[1]?.textContent.trim() || "Approved", "Clear", "Clear compliance");
    if (action === "suspend") confirmUniversityDecision(row, "Suspended", "Action Required", "Suspend");
    if (action === "reactivate") confirmUniversityDecision(row, "Approved", "Watch", "Reactivate");
    if (action === "reject") confirmUniversityDecision(row, "Rejected", "Blocked", "Reject");
    return;
  }
  const documentPreview = event.target.closest("[data-document-preview]");
  if (documentPreview) {
    const documentName = documentPreview.dataset.documentPreview;
    openDetail(documentName, `<div class="detail-note">Prototype document preview for ${documentName}. In the full system, KPT officers would see the uploaded file, issuer details, expiry date, and verification notes here.</div>`);
    addAudit(`Viewed ${documentName}`, "University");
    return;
  }
  const documentDownload = event.target.closest("[data-document-download]");
  if (documentDownload) {
    const documentName = documentDownload.dataset.documentDownload;
    openConfirm("Download document?", `Download ${documentName} for review?`, () => {
      addAudit(`Downloaded ${documentName}`, "University");
      addNotification("Document downloaded", `${documentName} was opened for KPT review.`, "universities");
    }, "Download");
    return;
  }
  const backUniversities = event.target.closest("[data-back-universities]");
  if (backUniversities) {
    setActiveView("universities");
    history.replaceState(null, "", "#universities");
    return;
  }
  const universityTab = event.target.closest("[data-university-tab]");
  if (universityTab) {
    const tab = universityTab.dataset.universityTab;
    document.querySelectorAll("[data-university-tab]").forEach((button) => button.classList.toggle("active", button === universityTab));
    document.querySelectorAll("[data-university-tab-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.universityTabPanel === tab));
    return;
  }
  const sideUniversityTab = event.target.closest("[data-side-university-tab]");
  if (sideUniversityTab) {
    const tab = sideUniversityTab.dataset.sideUniversityTab;
    universitySidePanel?.querySelectorAll("[data-side-university-tab]").forEach((button) => button.classList.toggle("active", button === sideUniversityTab));
    universitySidePanel?.querySelectorAll("[data-side-university-panel]").forEach((panel) => {
      const active = panel.dataset.sideUniversityPanel === tab;
      panel.hidden = !active;
      panel.classList.toggle("active", active);
    });
    return;
  }
  const helpTab = event.target.closest("[data-help-tab]");
  if (helpTab) {
    const tab = helpTab.dataset.helpTab;
    document.querySelectorAll("[data-help-tab]").forEach((button) => button.classList.toggle("active", button === helpTab));
    document.querySelectorAll("[data-help-tab-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.helpTabPanel === tab));
    return;
  }
  const programmeButton = event.target.closest("[data-programme-decision]");
  if (programmeButton) {
    renderProgrammeSidePanel(programmeButton.closest("tr"));
    return;
  }
  const programmeView = event.target.closest("[data-programme-view]");
  if (programmeView) {
    renderProgrammeSidePanel(programmeView.closest("tr"));
    return;
  }
  const closeProgrammeSide = event.target.closest("[data-close-programme-side]");
  if (closeProgrammeSide) {
    closeProgrammeSidePanel();
    return;
  }
  const closeApplicationSide = event.target.closest("[data-close-application-side]");
  if (closeApplicationSide) {
    closeApplicationSidePanel();
    return;
  }
  const applicationAction = event.target.closest("[data-application-action]");
  if (applicationAction) {
    const action = applicationAction.dataset.applicationAction;
    const data = activeApplicationRow ? applicationMeta(activeApplicationRow) : { name: "Selected applicant", tracking: "Application" };
    if (/review/i.test(action)) {
      openDetail("Application documents", `<div class="detail-note">Prototype application document review for ${escapeHtml(data.name)} (${escapeHtml(data.tracking)}). KPT / EMGS would see submitted files, university decisions, and EMGS requirements here.</div>`);
      addAudit(`Reviewed documents for ${data.tracking}`, "Application");
      return;
    }
    openConfirm(`${action}?`, `Confirm ${action.toLowerCase()} for ${data.name}?`, () => {
      addAudit(`${action} for ${data.tracking}`, "Application");
      addNotification(action, `${data.name} was updated in KPT / EMGS monitoring.`, "applications");
    }, /request/i.test(action) ? "Send" : "Confirm");
    return;
  }
  const programmePanelAction = event.target.closest("[data-programme-action]");
  if (programmePanelAction) {
    handleProgrammePanelAction(programmePanelAction);
    return;
  }
  const programmeGallery = event.target.closest("[data-programme-gallery]");
  if (programmeGallery) {
    const name = activeProgrammeRow ? getRowTitle(activeProgrammeRow) : "Programme";
    openDetail("Programme gallery", `
      <div class="detail-note">Prototype gallery preview for ${escapeHtml(name)}. In the full system, KPT officers would review submitted programme images, captions, image quality, and whether the gallery matches the programme description.</div>
      <div class="placeholder-gallery">
        <div><span>Image 1</span></div>
        <div><span>Image 2</span></div>
        <div><span>Image 3</span></div>
      </div>
    `);
    return;
  }
  const rowAction = event.target.closest("[data-row-action]");
  if (rowAction) {
    handleRowAction(rowAction);
    return;
  }
  const userEdit = event.target.closest("[data-user-edit]");
  if (userEdit) openUserForm(userEdit.closest("tr"));
});

document.querySelector("#addUser")?.addEventListener("click", () => openUserForm());

document.querySelectorAll("[data-queue-target]").forEach((button) => {
  button.addEventListener("click", () => openQueueTarget(button));
});

searchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  runTopSearch((topSearch?.value || "").trim().toLowerCase());
});

topSearch?.addEventListener("input", () => {
  if (!topSearch.value.trim()) document.querySelectorAll(".highlight").forEach((item) => item.classList.remove("highlight"));
});

logoutButton?.addEventListener("click", (event) => {
  event.preventDefault();
  openConfirm("Logout from demo?", "This prototype will stay on the page, but the action will be recorded in the audit log.", () => {
    addAudit("Logged out from KPT / EMGS demo", "User");
    addNotification("Logout recorded", "The demo logout action was recorded in the audit log.", "audit");
  }, "Logout");
});

document.querySelectorAll(".settings-list input[type='checkbox']").forEach((toggle) => {
  toggle.addEventListener("change", () => {
    const label = toggle.closest(".settings-toggle-row")?.querySelector("strong")?.textContent.trim() || "setting";
    addAudit(`${toggle.checked ? "Enabled" : "Disabled"} ${label}`, "Settings");
    addNotification("Settings updated", `${label} has been ${toggle.checked ? "enabled" : "disabled"}.`, "settings");
  });
});

notificationButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleNotificationsPanel();
});

notificationPanel?.addEventListener("click", (event) => {
  event.stopPropagation();
  const item = event.target.closest(".notification-item");
  if (!item) return;
  item.classList.remove("unread");
  updateNotificationCount();
  closeNotificationsPanel();
  setActiveView(item.dataset.notificationTarget);
  history.replaceState(null, "", `#${item.dataset.notificationTarget}`);
});

markNotificationsRead?.addEventListener("click", (event) => {
  event.stopPropagation();
  document.querySelectorAll(".notification-item.unread").forEach((item) => item.classList.remove("unread"));
  updateNotificationCount();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".notification-wrap")) closeNotificationsPanel();
  if (event.target.closest(".section-tooltip")) return;
  document.querySelectorAll(".section-tooltip").forEach((tooltip) => tooltip.classList.remove("tooltip-open"));
});

closeConfirm?.addEventListener("click", closeConfirmModal);
cancelConfirm?.addEventListener("click", closeConfirmModal);
applyConfirm?.addEventListener("click", () => {
  const action = pendingAction;
  closeConfirmModal();
  action?.();
});

closeDetail?.addEventListener("click", closeDetailModal);
closeDetailAction?.addEventListener("click", closeDetailModal);
closeClarification?.addEventListener("click", closeClarificationForm);
cancelClarification?.addEventListener("click", closeClarificationForm);
sendClarification?.addEventListener("click", sendUniversityClarification);
closeUserModal?.addEventListener("click", closeUserForm);
cancelUserModal?.addEventListener("click", closeUserForm);
saveUserModal?.addEventListener("click", saveUserForm);

resetDemo?.addEventListener("click", () => {
  initialTables.forEach((html, body) => { body.innerHTML = html; });
  if (auditBody) auditBody.innerHTML = initialAuditHtml;
  const list = notificationPanel?.querySelector(".notification-list");
  if (list) list.innerHTML = initialNotificationHtml;
  document.querySelectorAll("input[type='search']").forEach((input) => { input.value = ""; });
  document.querySelectorAll("select").forEach((select) => { select.selectedIndex = 0; });
  document.querySelectorAll(".settings-list input[type='checkbox']").forEach((toggle) => { toggle.checked = true; });
  closeConfirmModal();
  closeDetailModal();
  closeClarificationForm();
  closeUserForm();
  closeNotificationsPanel();
  closeUniversitySidePanel();
  activeUniversityRow = null;
  updateNotificationCount();
  setActiveView("dashboard");
  history.replaceState(null, "", "#dashboard");
});

const initialHash = location.hash.replace("#", "");
if (initialHash) setActiveView(initialHash);
updateNotificationCount();
