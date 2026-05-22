import { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid2,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { useCalibrationDocuments, useDueEquipment, useEquipment } from "app/hooks/useCalibration";
import {
  CALIBRATION_STATUS_COLOR,
  DUE_STATUS_COLOR,
  EQUIPMENT_STATUS_COLOR
} from "app/utils/constant";
import { asPaged, formatDate, getNextMonthTarget, monthLabel } from "./calibrationViewUtils";

function StatCard({ title, value, caption, icon, color = "primary" }) {
  return (
    <Card variant="outlined" sx={{ height: "100%", borderRadius: 1 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
              {caption}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
              bgcolor: `${color}.main`,
              color: `${color}.contrastText`
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function CalibrationDashboard() {
  const target = getNextMonthTarget();
  const equipmentQuery = useEquipment({ Page: 1, PageSize: 100 });
  const documentsQuery = useCalibrationDocuments({ Page: 1, PageSize: 10 });
  const dueInternalQuery = useDueEquipment({
    calibrationType: "Internal",
    targetMonth: target.targetMonth,
    targetYear: target.targetYear
  });
  const dueExternalQuery = useDueEquipment({
    calibrationType: "External",
    targetMonth: target.targetMonth,
    targetYear: target.targetYear
  });

  const equipment = asPaged(equipmentQuery.data).items;
  const documents = asPaged(documentsQuery.data).items;
  const dueAll = useMemo(
    () => [...(dueInternalQuery.data ?? []), ...(dueExternalQuery.data ?? [])],
    [dueExternalQuery.data, dueInternalQuery.data]
  );
  const isLoading =
    equipmentQuery.isLoading || documentsQuery.isLoading || dueInternalQuery.isLoading || dueExternalQuery.isLoading;

  const stats = useMemo(
    () => ({
      totalEquipment: asPaged(equipmentQuery.data).totalCount,
      activeEquipment: equipment.filter((item) => item.status === "Active").length,
      overdue: dueAll.filter((item) => item.dueStatus === "Overdue").length,
      lockedDocuments: documents.filter((item) => item.status === "Locked").length
    }),
    [documents, dueAll, equipment, equipmentQuery.data]
  );

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Calibration Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Due equipment, active plans, actual calibrations, approval status, and locked records.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/equipment" variant="outlined" startIcon={<BuildOutlinedIcon />}>
              Equipment
            </Button>
            <Button
              component={RouterLink}
              to="/calibration-documents"
              variant="contained"
              startIcon={<AssignmentTurnedInOutlinedIcon />}
            >
              Plans & Actuals
            </Button>
          </Stack>
        </Stack>

        {isLoading && <LinearProgress />}

        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
            <StatCard
              title="Equipment"
              value={stats.totalEquipment}
              caption={`${stats.activeEquipment} active records loaded`}
              icon={<BuildOutlinedIcon />}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
            <StatCard
              title="Due Target"
              value={dueAll.length}
              caption={monthLabel(target.targetMonth, target.targetYear)}
              icon={<EventBusyOutlinedIcon />}
              color="info"
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
            <StatCard
              title="Overdue"
              value={stats.overdue}
              caption="Requires planning attention"
              icon={<WarningAmberOutlinedIcon />}
              color={stats.overdue ? "error" : "success"}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
            <StatCard
              title="Locked Records"
              value={stats.lockedDocuments}
              caption="PDF record available"
              icon={<LockOutlinedIcon />}
              color="success"
            />
          </Grid2>
        </Grid2>

        {(equipmentQuery.isError || documentsQuery.isError || dueInternalQuery.isError || dueExternalQuery.isError) && (
          <Alert severity="error">Some calibration dashboard data could not be loaded.</Alert>
        )}

        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, xl: 7 }}>
            <Card variant="outlined" sx={{ borderRadius: 1 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography variant="h6" fontWeight={800}>
                    Due Equipment
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {monthLabel(target.targetMonth, target.targetYear)}
                  </Typography>
                </Stack>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Control No</TableCell>
                        <TableCell>Equipment</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Next Due</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dueAll.slice(0, 8).map((item) => (
                        <TableRow key={`${item.calibType}-${item.equipmentId}`} hover>
                          <TableCell>{item.controlNo}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={700}>
                              {item.equipmentName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.brand || item.model || "-"}
                            </Typography>
                          </TableCell>
                          <TableCell>{item.calibType}</TableCell>
                          <TableCell>{formatDate(item.nextCalibDate)}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.dueStatus}
                              color={DUE_STATUS_COLOR[item.dueStatus] ?? "default"}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                      {dueAll.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            No due equipment found for this target month.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid2>

          <Grid2 size={{ xs: 12, xl: 5 }}>
            <Card variant="outlined" sx={{ borderRadius: 1 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography variant="h6" fontWeight={800}>
                    Recent Calibration Documents
                  </Typography>
                  <Button
                    component={RouterLink}
                    to="/calibration-documents"
                    size="small"
                    endIcon={<OpenInNewOutlinedIcon />}
                  >
                    Open
                  </Button>
                </Stack>
                <Stack spacing={1}>
                  {documents.map((item) => (
                    <Paper key={item.calibrationDocumentId} variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                      <Stack direction="row" justifyContent="space-between" spacing={2}>
                        <Box>
                          <Typography component={RouterLink} to={`/calibration-documents/${item.calibrationDocumentId}`} variant="subtitle2" fontWeight={800} sx={{ color: "primary.main", textDecoration: "none" }}>
                            {item.calibrationType} {item.phase}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                            {monthLabel(item.targetMonth, item.targetYear)}
                          </Typography>
                        </Box>
                        <Chip
                          label={item.status}
                          color={CALIBRATION_STATUS_COLOR[item.status] ?? "default"}
                          size="small"
                        />
                      </Stack>
                    </Paper>
                  ))}
                  {documents.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No calibration documents created yet.
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>

        <Card variant="outlined" sx={{ borderRadius: 1 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>
              Equipment Health Snapshot
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {["Active", "Out Of Service", "Scrap"].map((status) => (
                <Chip
                  key={status}
                  label={`${status}: ${equipment.filter((item) => item.status === status).length}`}
                  color={EQUIPMENT_STATUS_COLOR[status]}
                  variant="outlined"
                />
              ))}
              {["Internal", "External"].map((type) => (
                <Chip
                  key={type}
                  label={`${type}: ${equipment.filter((item) => item.calibType === type).length}`}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
