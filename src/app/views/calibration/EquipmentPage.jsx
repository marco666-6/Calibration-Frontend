import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2,
  IconButton,
  InputAdornment,
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
  Tooltip,
  Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { useDebounce } from "use-debounce";
import useAuth from "app/hooks/useAuth";
import {
  useCreateEquipment,
  useDeleteEquipment,
  useEquipment,
  useSections,
  useUpdateEquipment
} from "app/hooks/useCalibration";
import {
  CALIBRATION_TYPES,
  EQUIPMENT_STATUSES,
  EQUIPMENT_STATUS_COLOR
} from "app/utils/constant";
import { ConfirmationDialog } from "app/components";
import { asPaged, formatDate } from "./calibrationViewUtils";

const EMPTY_EQUIPMENT = {
  name: "",
  controlNo: "",
  serialNo: "",
  brand: "",
  model: "",
  rangeValue: "",
  location: "",
  sectionId: "",
  calibInterval: 12,
  lastCalibDate: "",
  calibType: "Internal",
  status: "Active",
  oosReason: "",
  remarks: ""
};

function toPayload(values) {
  return {
    name: values.name.trim(),
    controlNo: values.controlNo.trim(),
    serialNo: values.serialNo.trim() || null,
    brand: values.brand.trim() || null,
    model: values.model.trim() || null,
    rangeValue: values.rangeValue.trim() || null,
    location: values.location.trim() || null,
    sectionId: Number(values.sectionId),
    calibInterval: Number(values.calibInterval),
    lastCalibDate: values.lastCalibDate || null,
    calibType: values.calibType,
    status: values.status,
    oosReason: values.oosReason.trim() || null,
    remarks: values.remarks.trim() || null
  };
}

function EquipmentDialog({ open, onClose, equipment, sections }) {
  const [values, setValues] = useState(EMPTY_EQUIPMENT);
  const createMutation = useCreateEquipment();
  const updateMutation = useUpdateEquipment();
  const isEdit = !!equipment?.id;
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!open) return;
    setValues(
      equipment
        ? {
            ...EMPTY_EQUIPMENT,
            ...equipment,
            lastCalibDate: equipment.lastCalibDate ?? "",
            sectionId: equipment.sectionId ?? ""
          }
        : EMPTY_EQUIPMENT
    );
  }, [equipment, open]);

  const setField = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = toPayload(values);
    if (isEdit) {
      await updateMutation.mutateAsync({ id: equipment.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="md">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? "Edit Equipment" : "New Equipment"}</DialogTitle>
        <DialogContent>
          <Grid2 container spacing={2} sx={{ mt: 0.5 }}>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField label="Equipment Name" value={values.name} onChange={setField("name")} fullWidth required />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField label="Control No" value={values.controlNo} onChange={setField("controlNo")} fullWidth required />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField label="Serial No" value={values.serialNo ?? ""} onChange={setField("serialNo")} fullWidth />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField label="Brand" value={values.brand ?? ""} onChange={setField("brand")} fullWidth />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField label="Model" value={values.model ?? ""} onChange={setField("model")} fullWidth />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField label="Range" value={values.rangeValue ?? ""} onChange={setField("rangeValue")} fullWidth />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField label="Location" value={values.location ?? ""} onChange={setField("location")} fullWidth />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField select label="Section" value={values.sectionId} onChange={setField("sectionId")} fullWidth required>
                {sections.map((section) => (
                  <MenuItem key={section.sectionId} value={section.sectionId}>
                    {section.sectionCode} - {section.sectionName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField
                label="Interval (months)"
                type="number"
                value={values.calibInterval}
                onChange={setField("calibInterval")}
                inputProps={{ min: 1 }}
                fullWidth
                required
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField
                label="Last Calibration"
                type="date"
                value={values.lastCalibDate ?? ""}
                onChange={setField("lastCalibDate")}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField select label="Type" value={values.calibType} onChange={setField("calibType")} fullWidth required>
                {CALIBRATION_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <TextField select label="Status" value={values.status} onChange={setField("status")} fullWidth required>
                {EQUIPMENT_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 8 }}>
              <TextField
                label="OOS Reason"
                value={values.oosReason ?? ""}
                onChange={setField("oosReason")}
                fullWidth
                required={values.status === "Out Of Service"}
              />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <TextField label="Remarks" value={values.remarks ?? ""} onChange={setField("remarks")} fullWidth multiline minRows={2} />
            </Grid2>
          </Grid2>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function EquipmentPage() {
  const { user } = useAuth();
  const canManage = user?.role === "Admin";
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [calibType, setCalibType] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [debouncedSearch] = useDebounce(search, 350);
  const sectionsQuery = useSections({ activeOnly: true });
  const deleteMutation = useDeleteEquipment();
  const equipmentQuery = useEquipment({
    Page: page,
    PageSize: pageSize,
    ...(debouncedSearch.trim() ? { Search: debouncedSearch.trim() } : {}),
    ...(calibType ? { CalibType: calibType } : {}),
    ...(status ? { Status: status } : {})
  });

  const paged = asPaged(equipmentQuery.data);
  const rows = paged.items;
  const sectionsById = useMemo(
    () => Object.fromEntries((sectionsQuery.data ?? []).map((section) => [section.sectionId, section])),
    [sectionsQuery.data]
  );

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Equipment Master
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Maintain equipment identity, section, calibration interval, due dates, and service status.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setSelected({})} disabled={!canManage}>
            New Equipment
          </Button>
        </Stack>

        {!canManage && <Alert severity="info">You can view equipment. Admin role is required for create, edit, and delete.</Alert>}

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
          <Grid2 container spacing={1.5} alignItems="center">
            <Grid2 size={{ xs: 12, md: 5 }}>
              <TextField
                placeholder="Search name, control no, serial no, brand, model"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField select label="Type" value={calibType} onChange={(event) => setCalibType(event.target.value)} size="small" fullWidth>
                <MenuItem value="">All</MenuItem>
                {CALIBRATION_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField select label="Status" value={status} onChange={(event) => setStatus(event.target.value)} size="small" fullWidth>
                <MenuItem value="">All</MenuItem>
                {EQUIPMENT_STATUSES.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <Typography variant="body2" color="text.secondary" textAlign={{ xs: "left", md: "right" }}>
                Showing {rows.length} of {paged.totalCount}
              </Typography>
            </Grid2>
          </Grid2>
        </Paper>

        {equipmentQuery.isLoading ? (
          <LinearProgress />
        ) : equipmentQuery.isError ? (
          <Alert severity="error">{equipmentQuery.error?.message ?? "Failed to load equipment."}</Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Equipment</TableCell>
                  <TableCell>Control</TableCell>
                  <TableCell>Section</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Last</TableCell>
                  <TableCell>Next</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={800}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {[item.brand, item.model, item.rangeValue].filter(Boolean).join(" / ") || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{item.controlNo}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        SN: {item.serialNo || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>{sectionsById[item.sectionId]?.sectionName ?? item.sectionId}</TableCell>
                    <TableCell>{item.calibType}</TableCell>
                    <TableCell>{formatDate(item.lastCalibDate)}</TableCell>
                    <TableCell>{formatDate(item.nextCalibDate)}</TableCell>
                    <TableCell>
                      <Chip label={item.status} color={EQUIPMENT_STATUS_COLOR[item.status] ?? "default"} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit equipment">
                        <span>
                          <IconButton onClick={() => setSelected(item)} disabled={!canManage}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Delete equipment">
                        <span>
                          <IconButton color="error" onClick={() => setDeleteTarget(item)} disabled={!canManage}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No equipment found.
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

      <EquipmentDialog
        open={!!selected}
        equipment={selected?.id ? selected : null}
        sections={sectionsQuery.data ?? []}
        onClose={() => setSelected(null)}
      />

      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete Equipment"
        text={`Delete "${deleteTarget?.name}" (${deleteTarget?.controlNo})?`}
        confirmText="Delete"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirmDialogClose={() => setDeleteTarget(null)}
        onYesClick={async () => {
          if (!deleteTarget) return;
          await deleteMutation.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </Box>
  );
}
