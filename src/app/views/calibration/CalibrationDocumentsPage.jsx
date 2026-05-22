import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid2,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import { useUserOptions } from "app/hooks/useUsers";
import {
  useCalibrationDocuments,
  useCreateExternalCalibrationPlan,
  useCreateInternalCalibrationPlan,
  useDueEquipment,
  useExternalCompanies
} from "app/hooks/useCalibration";
import {
  CALIBRATION_PHASES,
  CALIBRATION_STATUS_COLOR,
  CALIBRATION_STATUSES,
  CALIBRATION_TYPES,
  DUE_STATUS_COLOR,
  OVERDUE_HANDLING_OPTIONS
} from "app/utils/constant";
import { asPaged, getNextMonthTarget, monthLabel } from "./calibrationViewUtils";

function PlanCreateDialog({ open, onClose }) {
  const navigate = useNavigate();
  const nextTarget = getNextMonthTarget();
  const [values, setValues] = useState({
    calibrationType: "Internal",
    targetMonth: nextTarget.targetMonth,
    targetYear: nextTarget.targetYear,
    technicianUserIds: [],
    picUserId: "",
    checkerUserId: "",
    approverUserId: "",
    externalCompanyId: "",
    externalCompanyName: "",
    saveAsDraft: false,
    remarks: ""
  });
  const [excludedIds, setExcludedIds] = useState([]);
  const [overdueHandling, setOverdueHandling] = useState({});
  const usersQuery = useUserOptions({ Top: 50 });
  const companiesQuery = useExternalCompanies({ activeOnly: true });
  const dueQuery = useDueEquipment(
    {
      calibrationType: values.calibrationType,
      targetMonth: Number(values.targetMonth),
      targetYear: Number(values.targetYear)
    },
    { enabled: open && !!values.targetMonth && !!values.targetYear }
  );
  const createInternal = useCreateInternalCalibrationPlan();
  const createExternal = useCreateExternalCalibrationPlan();
  const dueEquipment = dueQuery.data ?? [];
  const isPending = createInternal.isPending || createExternal.isPending;

  useEffect(() => {
    if (!open) return;
    setExcludedIds([]);
    setOverdueHandling({});
  }, [open, values.calibrationType, values.targetMonth, values.targetYear]);

  const userOptions = usersQuery.data ?? [];
  const setField = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }));
  const selectedCompany = companiesQuery.data?.find((item) => item.externalCompanyId === Number(values.externalCompanyId));

  useEffect(() => {
    if (selectedCompany) {
      setValues((current) => ({ ...current, externalCompanyName: selectedCompany.companyName }));
    }
  }, [selectedCompany]);

  const toggleIncluded = (equipmentId) => {
    setExcludedIds((current) =>
      current.includes(equipmentId) ? current.filter((id) => id !== equipmentId) : [...current, equipmentId]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const common = {
      targetMonth: Number(values.targetMonth),
      targetYear: Number(values.targetYear),
      excludedEquipmentIds: excludedIds,
      overdueDateHandlingByEquipmentId: overdueHandling,
      checkerUserId: Number(values.checkerUserId),
      approverUserId: Number(values.approverUserId),
      saveAsDraft: values.saveAsDraft,
      remarks: values.remarks.trim() || null
    };
    const response =
      values.calibrationType === "Internal"
        ? await createInternal.mutateAsync({
            ...common,
            technicianUserIds: values.technicianUserIds.map(Number),
            picUserId: Number(values.picUserId)
          })
        : await createExternal.mutateAsync({
            ...common,
            externalCompanyId: values.externalCompanyId ? Number(values.externalCompanyId) : null,
            externalCompanyName: values.externalCompanyName.trim()
          });
    onClose();
    if (response?.data?.calibrationDocumentId) {
      navigate(`/calibration-documents/${response.data.calibrationDocumentId}`);
    }
  };

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="lg">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create Calibration Plan</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, md: 3 }}>
                <TextField select label="Calibration Type" value={values.calibrationType} onChange={setField("calibrationType")} fullWidth>
                  {CALIBRATION_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField label="Target Month" type="number" value={values.targetMonth} onChange={setField("targetMonth")} inputProps={{ min: 1, max: 12 }} fullWidth required />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField label="Target Year" type="number" value={values.targetYear} onChange={setField("targetYear")} inputProps={{ min: 2000 }} fullWidth required />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 5 }}>
                <TextField label="Remarks" value={values.remarks} onChange={setField("remarks")} fullWidth />
              </Grid2>
            </Grid2>

            {values.calibrationType === "Internal" ? (
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, md: 5 }}>
                  <TextField
                    select
                    SelectProps={{ multiple: true }}
                    label="Assigned Technicians"
                    value={values.technicianUserIds}
                    onChange={setField("technicianUserIds")}
                    fullWidth
                    required
                  >
                    {userOptions.map((user) => (
                      <MenuItem key={user.userId} value={user.userId}>
                        {user.employeeName || user.username} ({user.email})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <TextField select label="PIC" value={values.picUserId} onChange={setField("picUserId")} fullWidth required>
                    {values.technicianUserIds.map((userId) => {
                      const user = userOptions.find((item) => item.userId === Number(userId));
                      return (
                        <MenuItem key={userId} value={userId}>
                          {user?.employeeName || user?.username || userId}
                        </MenuItem>
                      );
                    })}
                  </TextField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }}>
                  <TextField select label="Checker" value={values.checkerUserId} onChange={setField("checkerUserId")} fullWidth required>
                    {userOptions.map((user) => (
                      <MenuItem key={user.userId} value={user.userId}>
                        {user.employeeName || user.username}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }}>
                  <TextField select label="Approver" value={values.approverUserId} onChange={setField("approverUserId")} fullWidth required>
                    {userOptions.map((user) => (
                      <MenuItem key={user.userId} value={user.userId}>
                        {user.employeeName || user.username}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid2>
              </Grid2>
            ) : (
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <TextField select label="External Company" value={values.externalCompanyId} onChange={setField("externalCompanyId")} fullWidth>
                    <MenuItem value="">Manual company</MenuItem>
                    {(companiesQuery.data ?? []).map((company) => (
                      <MenuItem key={company.externalCompanyId} value={company.externalCompanyId}>
                        {company.companyName}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <TextField label="Company Name" value={values.externalCompanyName} onChange={setField("externalCompanyName")} fullWidth required />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }}>
                  <TextField select label="Checker" value={values.checkerUserId} onChange={setField("checkerUserId")} fullWidth required>
                    {userOptions.map((user) => (
                      <MenuItem key={user.userId} value={user.userId}>
                        {user.employeeName || user.username}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }}>
                  <TextField select label="Approver" value={values.approverUserId} onChange={setField("approverUserId")} fullWidth required>
                    {userOptions.map((user) => (
                      <MenuItem key={user.userId} value={user.userId}>
                        {user.employeeName || user.username}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid2>
              </Grid2>
            )}

            <FormControlLabel
              control={<Checkbox checked={values.saveAsDraft} onChange={(event) => setValues((current) => ({ ...current, saveAsDraft: event.target.checked }))} />}
              label="Save as draft"
            />

            <Paper variant="outlined" sx={{ borderRadius: 1 }}>
              <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                <Typography variant="subtitle1" fontWeight={800}>
                  Due Equipment Review
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Loaded equipment is included by default. Uncheck anything that should be excluded from the plan.
                </Typography>
              </Box>
              {dueQuery.isLoading ? (
                <LinearProgress />
              ) : dueQuery.isError ? (
                <Alert severity="error" sx={{ m: 2 }}>
                  {dueQuery.error?.message ?? "Failed to load due equipment."}
                </Alert>
              ) : (
                <TableContainer sx={{ maxHeight: 360 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Include</TableCell>
                        <TableCell>Control No</TableCell>
                        <TableCell>Equipment</TableCell>
                        <TableCell>Due</TableCell>
                        <TableCell>Overdue Handling</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dueEquipment.map((item) => (
                        <TableRow key={item.equipmentId} hover>
                          <TableCell>
                            <Checkbox checked={!excludedIds.includes(item.equipmentId)} onChange={() => toggleIncluded(item.equipmentId)} />
                          </TableCell>
                          <TableCell>{item.controlNo}</TableCell>
                          <TableCell>{item.equipmentName}</TableCell>
                          <TableCell>
                            <Chip label={item.dueStatus} color={DUE_STATUS_COLOR[item.dueStatus] ?? "default"} size="small" />
                          </TableCell>
                          <TableCell sx={{ minWidth: 260 }}>
                            {item.dueStatus === "Overdue" || item.dueStatus === "Will Be Overdue" ? (
                              <TextField
                                select
                                size="small"
                                value={overdueHandling[item.equipmentId] ?? OVERDUE_HANDLING_OPTIONS[0]}
                                onChange={(event) =>
                                  setOverdueHandling((current) => ({
                                    ...current,
                                    [item.equipmentId]: event.target.value
                                  }))
                                }
                                fullWidth
                              >
                                {OVERDUE_HANDLING_OPTIONS.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {dueEquipment.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            No due equipment found for this target.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? "Creating..." : "Create Plan"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function CalibrationDocumentsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [calibrationType, setCalibrationType] = useState("");
  const [phase, setPhase] = useState("");
  const [status, setStatus] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const query = useCalibrationDocuments({
    Page: page,
    PageSize: pageSize,
    ...(calibrationType ? { CalibrationType: calibrationType } : {}),
    ...(phase ? { Phase: phase } : {}),
    ...(status ? { Status: status } : {})
  });
  const paged = asPaged(query.data);
  const rows = paged.items;
  const counts = useMemo(
    () => ({
      plans: rows.filter((item) => item.phase === "Plan").length,
      actuals: rows.filter((item) => item.phase === "Actual").length,
      locked: rows.filter((item) => item.status === "Locked").length
    }),
    [rows]
  );

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Plans & Actual Calibrations
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Create target-month plans, record actual results, approve, lock, and download permanent PDFs.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            New Plan
          </Button>
        </Stack>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
          <Grid2 container spacing={1.5} alignItems="center">
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField select label="Type" value={calibrationType} onChange={(event) => setCalibrationType(event.target.value)} size="small" fullWidth>
                <MenuItem value="">All types</MenuItem>
                {CALIBRATION_TYPES.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField select label="Phase" value={phase} onChange={(event) => setPhase(event.target.value)} size="small" fullWidth>
                <MenuItem value="">All phases</MenuItem>
                {CALIBRATION_PHASES.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField select label="Status" value={status} onChange={(event) => setStatus(event.target.value)} size="small" fullWidth>
                <MenuItem value="">All statuses</MenuItem>
                {CALIBRATION_STATUSES.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <Stack direction="row" spacing={1} justifyContent={{ xs: "flex-start", md: "flex-end" }} flexWrap="wrap" useFlexGap>
                <Chip label={`Plans ${counts.plans}`} size="small" />
                <Chip label={`Actuals ${counts.actuals}`} size="small" />
                <Chip label={`Locked ${counts.locked}`} size="small" color="success" />
              </Stack>
            </Grid2>
          </Grid2>
        </Paper>

        {query.isLoading ? (
          <LinearProgress />
        ) : query.isError ? (
          <Alert severity="error">{query.error?.message ?? "Failed to load calibration documents."}</Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Document</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Equipment</TableCell>
                  <TableCell>Approval</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Open</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((item) => (
                  <TableRow key={item.calibrationDocumentId} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={800}>
                        {item.calibrationType} {item.phase}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.documentNo || `Document #${item.calibrationDocumentId}`}
                      </Typography>
                    </TableCell>
                    <TableCell>{monthLabel(item.targetMonth, item.targetYear)}</TableCell>
                    <TableCell>
                      {item.equipment?.filter((row) => row.isIncluded).length ?? 0} included
                      {item.externalCompanyName ? (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          {item.externalCompanyName}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {(item.approvalSteps ?? []).map((step) => (
                          <Chip
                            key={step.approvalStepId}
                            label={`${step.stepNo}. ${step.stepRole}`}
                            color={step.approvedAt ? "success" : "default"}
                            size="small"
                            variant={step.approvedAt ? "filled" : "outlined"}
                          />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={item.status} color={CALIBRATION_STATUS_COLOR[item.status] ?? "default"} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        component={RouterLink}
                        to={`/calibration-documents/${item.calibrationDocumentId}`}
                        size="small"
                        endIcon={<OpenInNewOutlinedIcon />}
                      >
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No calibration documents found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={paged.totalCount}
              page={Math.max(0, page - 1)}
              onPageChange={(_, nextPage) => setPage(nextPage + 1)}
              rowsPerPage={pageSize}
              onRowsPerPageChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              rowsPerPageOptions={[10, 20, 50, 100]}
            />
          </TableContainer>
        )}
      </Stack>

      <PlanCreateDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}
