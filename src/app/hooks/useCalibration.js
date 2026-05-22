import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import {
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
} from "/src/api/calibration";
import { USER_KEYS } from "./useUsers";

export const CALIBRATION_KEYS = {
  equipment: ["calibration", "equipment"],
  equipmentList: (params) => ["calibration", "equipment", params],
  dueEquipment: (params) => ["calibration", "equipment", "due", params],
  sectionRoot: ["calibration", "sections"],
  sections: (params) => ["calibration", "sections", params],
  companyRoot: ["calibration", "external-companies"],
  companies: (params) => ["calibration", "external-companies", params],
  documents: ["calibration", "documents"],
  documentList: (params) => ["calibration", "documents", params],
  document: (id) => ["calibration", "documents", id],
  userRoles: (userId) => ["calibration", "user-roles", userId]
};

const messageOf = (res, fallback) => res?.message || fallback;

const useCalibrationMutation = ({ mutationFn, successMessage, invalidate = [] }) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn,
    onSuccess: (res) => {
      invalidate.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
      enqueueSnackbar(messageOf(res, successMessage), { variant: "success" });
    },
    onError: (err) => enqueueSnackbar(err.message || "Calibration request failed", { variant: "error" })
  });
};

export const useEquipment = (params = {}, options = {}) =>
  useQuery({
    queryKey: CALIBRATION_KEYS.equipmentList(params),
    queryFn: () => getEquipment(params).then((res) => res.data),
    keepPreviousData: true,
    staleTime: 20_000,
    ...options
  });

export const useDueEquipment = (params = {}, options = {}) =>
  useQuery({
    queryKey: CALIBRATION_KEYS.dueEquipment(params),
    queryFn: () => getDueEquipment(params).then((res) => res.data ?? []),
    staleTime: 15_000,
    ...options
  });

export const useCreateEquipment = () =>
  useCalibrationMutation({
    mutationFn: createEquipment,
    successMessage: "Equipment created",
    invalidate: [CALIBRATION_KEYS.equipment]
  });

export const useUpdateEquipment = () =>
  useCalibrationMutation({
    mutationFn: ({ id, data }) => updateEquipment(id, data),
    successMessage: "Equipment updated",
    invalidate: [CALIBRATION_KEYS.equipment, CALIBRATION_KEYS.documents]
  });

export const useDeleteEquipment = () =>
  useCalibrationMutation({
    mutationFn: deleteEquipment,
    successMessage: "Equipment deleted",
    invalidate: [CALIBRATION_KEYS.equipment]
  });

export const useSections = (params = {}, options = {}) =>
  useQuery({
    queryKey: CALIBRATION_KEYS.sections(params),
    queryFn: () => getSections(params).then((res) => res.data ?? []),
    staleTime: 60_000,
    ...options
  });

export const useCreateSection = () =>
  useCalibrationMutation({
    mutationFn: createSection,
    successMessage: "Section created",
    invalidate: [CALIBRATION_KEYS.sectionRoot]
  });

export const useUpdateSection = () =>
  useCalibrationMutation({
    mutationFn: ({ id, data }) => updateSection(id, data),
    successMessage: "Section updated",
    invalidate: [CALIBRATION_KEYS.sectionRoot]
  });

export const useExternalCompanies = (params = {}, options = {}) =>
  useQuery({
    queryKey: CALIBRATION_KEYS.companies(params),
    queryFn: () => getExternalCompanies(params).then((res) => res.data ?? []),
    staleTime: 60_000,
    ...options
  });

export const useCreateExternalCompany = () =>
  useCalibrationMutation({
    mutationFn: createExternalCompany,
    successMessage: "External company created",
    invalidate: [CALIBRATION_KEYS.companyRoot]
  });

export const useUpdateExternalCompany = () =>
  useCalibrationMutation({
    mutationFn: ({ id, data }) => updateExternalCompany(id, data),
    successMessage: "External company updated",
    invalidate: [CALIBRATION_KEYS.companyRoot]
  });

export const useCalibrationDocuments = (params = {}, options = {}) =>
  useQuery({
    queryKey: CALIBRATION_KEYS.documentList(params),
    queryFn: () => getCalibrationDocuments(params).then((res) => res.data),
    keepPreviousData: true,
    staleTime: 15_000,
    ...options
  });

export const useCalibrationDocument = (id, options = {}) =>
  useQuery({
    queryKey: CALIBRATION_KEYS.document(id),
    queryFn: () => getCalibrationDocument(id).then((res) => res.data),
    enabled: !!id,
    staleTime: 10_000,
    ...options
  });

export const useCreateInternalCalibrationPlan = () =>
  useCalibrationMutation({
    mutationFn: createInternalCalibrationPlan,
    successMessage: "Internal calibration plan created",
    invalidate: [CALIBRATION_KEYS.documents]
  });

export const useCreateExternalCalibrationPlan = () =>
  useCalibrationMutation({
    mutationFn: createExternalCalibrationPlan,
    successMessage: "External calibration plan created",
    invalidate: [CALIBRATION_KEYS.documents]
  });

export const useCalibrationDocumentAction = (documentId) =>
  useCalibrationMutation({
    mutationFn: async ({ action, rowId, payload = {} }) => {
      if (action === "toggle-equipment") return toggleDocumentEquipment({ documentId, rowId, ...payload });
      if (action === "overdue-handling") return updateDocumentOverdueHandling({ documentId, rowId, ...payload });
      if (action === "record-result") return recordDocumentResult({ documentId, rowId, data: payload });
      if (action === "undo-result") return undoDocumentResult({ documentId, rowId });
      if (action === "approve") return approveCalibrationDocument({ documentId, ...payload });
      if (action === "undo-approval") return undoCalibrationApproval({ documentId, ...payload });
      if (action === "restart-approval") return restartCalibrationApproval({ documentId, ...payload });
      if (action === "lock") return lockCalibrationDocument({ documentId, ...payload });
      throw new Error("Unsupported calibration action.");
    },
    successMessage: "Calibration document updated",
    invalidate: [CALIBRATION_KEYS.document(documentId), CALIBRATION_KEYS.documents, CALIBRATION_KEYS.equipment]
  });

export const useDownloadCalibrationPdf = () =>
  useMutation({
    mutationFn: downloadCalibrationPdf
  });

export const useUserCalibrationRoles = (userId, options = {}) =>
  useQuery({
    queryKey: CALIBRATION_KEYS.userRoles(userId),
    queryFn: () => getUserCalibrationRoles(userId).then((res) => res.data ?? []),
    enabled: !!userId,
    staleTime: 30_000,
    ...options
  });

export const useSetUserCalibrationRoles = (userId) =>
  useCalibrationMutation({
    mutationFn: (roles) => setUserCalibrationRoles(userId, roles),
    successMessage: "Calibration roles updated",
    invalidate: [CALIBRATION_KEYS.userRoles(userId), USER_KEYS.all]
  });
