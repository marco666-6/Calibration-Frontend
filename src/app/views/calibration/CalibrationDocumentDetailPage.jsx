import { useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import {
  useCalibrationDocument,
  useCalibrationDocumentAction,
  useDownloadCalibrationPdf
} from "app/hooks/useCalibration";
import {
  CALIBRATION_STATUS_COLOR,
  DUE_STATUS_COLOR,
  OVERDUE_HANDLING_OPTIONS
} from "app/utils/constant";
import { compactList, formatDate, formatDateTime, monthLabel } from "./calibrationViewUtils";

function ActionDialog({ open, title, fields, onClose, onSubmit, isPending }) {
  const [values, setValues] = useState({});

  const submit = async (event) => {
    event.preventDefault();
    await onSubmit(values);
    setValues({});
  };

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="sm">
      <form onSubmit={submit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {fields.map((field) => (
              <TextField
                key={field.name}
                label={field.label}
                value={values[field.name] ?? ""}
                onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                fullWidth
                required={field.required}
                multiline={field.multiline}
                minRows={field.multiline ? 3 : undefined}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            Submit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function SummaryCard({ title, value, caption }) {
  return (
    <Card variant="outlined" sx={{ height: "100%", borderRadius: 1 }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
          {caption}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function CalibrationDocumentDetailPage() {
  const { documentId } = useParams();
  const id = Number(documentId);
  const documentQuery = useCalibrationDocument(id);
  const actionMutation = useCalibrationDocumentAction(id);
  const downloadMutation = useDownloadCalibrationPdf();
  const [dialog, setDialog] = useState(null);
  const document = documentQuery.data;
  const isEditable =
    document && !document.isLocked && !["Prepared", "Checked", "Approved", "Locked"].includes(document.status);
  const canRecordResults =
    document?.phase === "Actual" && !document.isLocked && ["Ongoing", "Pending"].includes(document.status);

  const runAction = async (payload) => {
    await actionMutation.mutateAsync(payload);
    setDialog(null);
  };

  if (documentQuery.isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (documentQuery.isError || !document) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{documentQuery.error?.message ?? "Calibration document could not be loaded."}</Alert>
      </Box>
    );
  }

  const includedRows = document.equipment.filter((item) => item.isIncluded);
  const finishedRows = includedRows.filter((item) => item.resultStatus === "OK" || item.resultStatus === "NG");
  const isLateActual =
    document.phase === "Actual" &&
    !document.isLocked &&
    new Date() > new Date(document.targetYear, document.targetMonth, 1);

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Button component={RouterLink} to="/calibration-documents" startIcon={<ArrowBackIcon />} sx={{ mb: 1 }}>
              Back
            </Button>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
              <Typography variant="h5" fontWeight={800}>
                {document.calibrationType} {document.phase}
              </Typography>
              <Chip label={document.status} color={CALIBRATION_STATUS_COLOR[document.status] ?? "default"} size="small" />
              {document.isLocked && <Chip icon={<LockOutlinedIcon />} label="Locked" color="success" size="small" />}
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {monthLabel(document.targetMonth, document.targetYear)} / {document.documentNo || `Document #${id}`}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="flex-start">
            <Button
              variant="outlined"
              startIcon={<CheckCircleOutlineIcon />}
              onClick={() => setDialog({ action: "approve", title: "Approve Document" })}
              disabled={document.isLocked || actionMutation.isPending}
            >
              Approve
            </Button>
            <Button
              variant="outlined"
              startIcon={<UndoOutlinedIcon />}
              onClick={() => setDialog({ action: "undo-approval", title: "Undo Approval" })}
              disabled={document.isLocked || actionMutation.isPending}
            >
              Undo
            </Button>
            <Button
              variant="outlined"
              startIcon={<RestartAltOutlinedIcon />}
              onClick={() => setDialog({ action: "restart-approval", title: "Restart Approval" })}
              disabled={document.status !== "Approved" || actionMutation.isPending}
            >
              Restart
            </Button>
            <Button
              variant="contained"
              startIcon={<LockOutlinedIcon />}
              onClick={() => setDialog({ action: "lock", title: "Lock Document" })}
              disabled={document.status !== "Approved" || actionMutation.isPending}
            >
              Lock
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadOutlinedIcon />}
              onClick={() => downloadMutation.mutate(id)}
              disabled={!document.isLocked || downloadMutation.isPending}
            >
              PDF
            </Button>
          </Stack>
        </Stack>

        {isLateActual && (
          <Alert severity="warning" icon={<WarningAmberOutlinedIcon />}>
            This actual calibration passed the first day of the next month and is not locked yet.
          </Alert>
        )}

        {(actionMutation.isPending || documentQuery.isFetching) && <LinearProgress />}

        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
            <SummaryCard title="Included Equipment" value={includedRows.length} caption={`${document.equipment.length} rows copied to document`} />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
            <SummaryCard title="Actual Results" value={`${finishedRows.length}/${includedRows.length}`} caption="OK/NG rows completed" />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
            <SummaryCard
              title="Technicians"
              value={document.technicians.length || "-"}
              caption={compactList(document.technicians.map((item) => `${item.employeeName || item.username || item.userId}${item.isPic ? " (PIC)" : ""}`))}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
            <SummaryCard
              title="PDF Record"
              value={document.pdfGeneratedAt ? "Generated" : "Pending"}
              caption={document.pdfGeneratedAt ? formatDateTime(document.pdfGeneratedAt) : "Available after lock"}
            />
          </Grid2>
        </Grid2>

        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, lg: 5 }}>
            <Card variant="outlined" sx={{ borderRadius: 1, height: "100%" }}>
              <CardContent>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>
                  Approval Flow
                </Typography>
                <Stack spacing={1.5}>
                  {document.approvalSteps.map((step) => (
                    <Paper key={step.approvalStepId} variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                      <Stack direction="row" justifyContent="space-between" spacing={2}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={800}>
                            Step {step.stepNo}: {step.stepRole}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {step.assignedEmployeeName || step.assignedUsername || `User #${step.assignedUserId}`}
                          </Typography>
                        </Box>
                        <Chip
                          label={step.approvedAt ? "Approved" : "Waiting"}
                          color={step.approvedAt ? "success" : "default"}
                          size="small"
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {step.approvedAt ? formatDateTime(step.approvedAt) : step.undoneAt ? `Undone ${formatDateTime(step.undoneAt)}` : "-"}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid2>
          <Grid2 size={{ xs: 12, lg: 7 }}>
            <Card variant="outlined" sx={{ borderRadius: 1, height: "100%" }}>
              <CardContent>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>
                  Document Timing
                </Typography>
                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Approval Opens
                    </Typography>
                    <Typography variant="subtitle2">{formatDateTime(document.approvalOpensAt)}</Typography>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Timer Ends
                    </Typography>
                    <Typography variant="subtitle2">{formatDateTime(document.approvalTimerEndsAt)}</Typography>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Locked At
                    </Typography>
                    <Typography variant="subtitle2">{formatDateTime(document.lockedAt)}</Typography>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      External Company
                    </Typography>
                    <Typography variant="subtitle2">{document.externalCompanyName || "-"}</Typography>
                  </Grid2>
                </Grid2>
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>

        <Card variant="outlined" sx={{ borderRadius: 1 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>
              Equipment Rows
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Included</TableCell>
                    <TableCell>Control No</TableCell>
                    <TableCell>Equipment</TableCell>
                    <TableCell>Due</TableCell>
                    <TableCell>Planned Next</TableCell>
                    <TableCell>Overdue Handling</TableCell>
                    <TableCell>Result</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {document.equipment.map((row) => (
                    <TableRow key={row.id} hover selected={!row.isIncluded}>
                      <TableCell>
                        <Checkbox
                          checked={row.isIncluded}
                          disabled={!isEditable || actionMutation.isPending}
                          onChange={(event) =>
                            runAction({
                              action: "toggle-equipment",
                              rowId: row.id,
                              payload: { isIncluded: event.target.checked }
                            })
                          }
                        />
                      </TableCell>
                      <TableCell>{row.controlNo}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={800}>
                          {row.equipmentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {[row.brand, row.model, row.rangeValue].filter(Boolean).join(" / ") || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={row.dueStatus} color={DUE_STATUS_COLOR[row.dueStatus] ?? "default"} size="small" />
                      </TableCell>
                      <TableCell>{formatDate(row.plannedNextCalibDate)}</TableCell>
                      <TableCell sx={{ minWidth: 230 }}>
                        {row.overdueDateHandling ? (
                          <TextField
                            select
                            size="small"
                            value={row.overdueDateHandling}
                            disabled={!isEditable || actionMutation.isPending}
                            onChange={(event) =>
                              runAction({
                                action: "overdue-handling",
                                rowId: row.id,
                                payload: { overdueDateHandling: event.target.value }
                              })
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
                      <TableCell>
                        {row.resultStatus ? (
                          <Stack spacing={0.25}>
                            <Chip label={row.resultStatus} color={row.resultStatus === "OK" ? "success" : "error"} size="small" />
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(row.resultDate)}
                            </Typography>
                          </Stack>
                        ) : (
                          <Chip label="Not recorded" size="small" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.75}>
                          <Button
                            size="small"
                            color="success"
                            variant="outlined"
                            disabled={!canRecordResults || !row.isIncluded || actionMutation.isPending}
                            onClick={() =>
                              runAction({
                                action: "record-result",
                                rowId: row.id,
                                payload: { resultStatus: "OK", oosReason: null, resultRemark: row.resultRemark ?? null }
                              })
                            }
                          >
                            OK
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            disabled={!canRecordResults || !row.isIncluded || actionMutation.isPending}
                            onClick={() =>
                              setDialog({
                                action: "record-ng",
                                rowId: row.id,
                                title: `Record NG - ${row.controlNo}`
                              })
                            }
                          >
                            NG
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={!canRecordResults || !row.resultStatus || actionMutation.isPending}
                            onClick={() => runAction({ action: "undo-result", rowId: row.id })}
                          >
                            Undo
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  {document.equipment.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No equipment rows in this document.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Stack>

      <ActionDialog
        open={!!dialog?.action && dialog.action !== "record-ng"}
        title={dialog?.title ?? ""}
        fields={[{ name: "remarks", label: "Remarks", multiline: true }]}
        isPending={actionMutation.isPending}
        onClose={() => setDialog(null)}
        onSubmit={(values) => runAction({ action: dialog.action, payload: { remarks: values.remarks || null } })}
      />

      <ActionDialog
        open={dialog?.action === "record-ng"}
        title={dialog?.title ?? ""}
        fields={[
          { name: "oosReason", label: "OOS Reason", required: true },
          { name: "resultRemark", label: "Result Remark", multiline: true }
        ]}
        isPending={actionMutation.isPending}
        onClose={() => setDialog(null)}
        onSubmit={(values) =>
          runAction({
            action: "record-result",
            rowId: dialog.rowId,
            payload: {
              resultStatus: "NG",
              oosReason: values.oosReason,
              resultRemark: values.resultRemark || null
            }
          })
        }
      />
    </Box>
  );
}
