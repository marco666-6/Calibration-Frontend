import apiClient from "./client";

const unwrap = (response) => response.data;

const getEquipment = async (params) => unwrap(await apiClient.get("/equipment", { params }));
const getDueEquipment = async (params) => unwrap(await apiClient.get("/equipment/due", { params }));
const getEquipmentById = async (id) => unwrap(await apiClient.get(`/equipment/${id}`));
const createEquipment = async (data) => unwrap(await apiClient.post("/equipment", data));
const updateEquipment = async (id, data) => unwrap(await apiClient.patch(`/equipment/${id}`, data));
const deleteEquipment = async (id) => unwrap(await apiClient.delete(`/equipment/${id}`));

const getSections = async (params) => unwrap(await apiClient.get("/sections", { params }));
const createSection = async (data) => unwrap(await apiClient.post("/sections", data));
const updateSection = async (id, data) => unwrap(await apiClient.patch(`/sections/${id}`, data));

const getExternalCompanies = async (params) => unwrap(await apiClient.get("/external-companies", { params }));
const createExternalCompany = async (data) => unwrap(await apiClient.post("/external-companies", data));
const updateExternalCompany = async (id, data) => unwrap(await apiClient.patch(`/external-companies/${id}`, data));

const getCalibrationDocuments = async (params) =>
  unwrap(await apiClient.get("/calibration-documents", { params }));
const getCalibrationDocument = async (id) => unwrap(await apiClient.get(`/calibration-documents/${id}`));
const createInternalCalibrationPlan = async (data) =>
  unwrap(await apiClient.post("/calibration-documents/internal/plans", data));
const createExternalCalibrationPlan = async (data) =>
  unwrap(await apiClient.post("/calibration-documents/external/plans", data));
const toggleDocumentEquipment = async ({ documentId, rowId, isIncluded }) =>
  unwrap(await apiClient.patch(`/calibration-documents/${documentId}/equipment/${rowId}/include`, { isIncluded }));
const updateDocumentOverdueHandling = async ({ documentId, rowId, overdueDateHandling }) =>
  unwrap(
    await apiClient.patch(`/calibration-documents/${documentId}/equipment/${rowId}/overdue-handling`, {
      overdueDateHandling
    })
  );
const recordDocumentResult = async ({ documentId, rowId, data }) =>
  unwrap(await apiClient.patch(`/calibration-documents/${documentId}/equipment/${rowId}/result`, data));
const undoDocumentResult = async ({ documentId, rowId }) =>
  unwrap(await apiClient.post(`/calibration-documents/${documentId}/equipment/${rowId}/undo-result`));
const approveCalibrationDocument = async ({ documentId, remarks }) =>
  unwrap(await apiClient.post(`/calibration-documents/${documentId}/approve`, { remarks }));
const undoCalibrationApproval = async ({ documentId, remarks }) =>
  unwrap(await apiClient.post(`/calibration-documents/${documentId}/undo-approval`, { remarks }));
const restartCalibrationApproval = async ({ documentId, remarks }) =>
  unwrap(await apiClient.post(`/calibration-documents/${documentId}/restart-approval`, { remarks }));
const lockCalibrationDocument = async ({ documentId, remarks }) =>
  unwrap(await apiClient.post(`/calibration-documents/${documentId}/lock`, { remarks }));

const downloadCalibrationPdf = async (documentId) => {
  const response = await apiClient.get(`/calibration-documents/${documentId}/pdf`, {
    responseType: "blob"
  });
  const contentDisposition = response.headers["content-disposition"] ?? "";
  const fileName =
    contentDisposition.match(/filename="?([^";]+)"?/i)?.[1] ?? `calibration-document-${documentId}.pdf`;
  const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const getUserCalibrationRoles = async (userId) =>
  unwrap(await apiClient.get(`/users/${userId}/calibration-roles`));
const setUserCalibrationRoles = async (userId, roles) =>
  unwrap(await apiClient.put(`/users/${userId}/calibration-roles`, { roles }));

export {
  approveCalibrationDocument,
  createEquipment,
  createExternalCalibrationPlan,
  createExternalCompany,
  createInternalCalibrationPlan,
  createSection,
  deleteEquipment,
  downloadCalibrationPdf,
  getCalibrationDocument,
  getCalibrationDocuments,
  getDueEquipment,
  getEquipment,
  getEquipmentById,
  getExternalCompanies,
  getSections,
  getUserCalibrationRoles,
  lockCalibrationDocument,
  recordDocumentResult,
  restartCalibrationApproval,
  setUserCalibrationRoles,
  toggleDocumentEquipment,
  undoCalibrationApproval,
  undoDocumentResult,
  updateDocumentOverdueHandling,
  updateEquipment,
  updateExternalCompany,
  updateSection
};
