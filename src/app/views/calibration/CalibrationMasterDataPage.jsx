import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2,
  IconButton,
  LinearProgress,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Paper
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  useCreateExternalCompany,
  useCreateSection,
  useExternalCompanies,
  useSections,
  useUpdateExternalCompany,
  useUpdateSection
} from "app/hooks/useCalibration";

const EMPTY_SECTION = { sectionCode: "", sectionName: "", isActive: true };
const EMPTY_COMPANY = {
  companyName: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  isActive: true
};

function SectionDialog({ open, onClose, section }) {
  const [values, setValues] = useState(EMPTY_SECTION);
  const createMutation = useCreateSection();
  const updateMutation = useUpdateSection();
  const isEdit = !!section?.sectionId;
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) setValues(section ? { ...EMPTY_SECTION, ...section } : EMPTY_SECTION);
  }, [open, section]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      sectionCode: values.sectionCode.trim(),
      sectionName: values.sectionName.trim(),
      ...(isEdit ? { isActive: values.isActive } : {})
    };
    if (isEdit) {
      await updateMutation.mutateAsync({ id: section.sectionId, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? "Edit Section" : "New Section"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Section Code" value={values.sectionCode} onChange={(event) => setValues((current) => ({ ...current, sectionCode: event.target.value }))} fullWidth required />
            <TextField label="Section Name" value={values.sectionName} onChange={(event) => setValues((current) => ({ ...current, sectionName: event.target.value }))} fullWidth required />
            {isEdit && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Switch checked={values.isActive} onChange={(event) => setValues((current) => ({ ...current, isActive: event.target.checked }))} />
                <Typography>Active</Typography>
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function CompanyDialog({ open, onClose, company }) {
  const [values, setValues] = useState(EMPTY_COMPANY);
  const createMutation = useCreateExternalCompany();
  const updateMutation = useUpdateExternalCompany();
  const isEdit = !!company?.externalCompanyId;
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) setValues(company ? { ...EMPTY_COMPANY, ...company } : EMPTY_COMPANY);
  }, [company, open]);

  const setField = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      companyName: values.companyName.trim(),
      contactPerson: values.contactPerson.trim() || null,
      phone: values.phone.trim() || null,
      email: values.email.trim() || null,
      address: values.address.trim() || null,
      ...(isEdit ? { isActive: values.isActive } : {})
    };
    if (isEdit) {
      await updateMutation.mutateAsync({ id: company.externalCompanyId, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? "Edit External Company" : "New External Company"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Company Name" value={values.companyName} onChange={setField("companyName")} fullWidth required />
            <TextField label="Contact Person" value={values.contactPerson ?? ""} onChange={setField("contactPerson")} fullWidth />
            <TextField label="Phone" value={values.phone ?? ""} onChange={setField("phone")} fullWidth />
            <TextField label="Email" value={values.email ?? ""} onChange={setField("email")} fullWidth />
            <TextField label="Address" value={values.address ?? ""} onChange={setField("address")} fullWidth multiline minRows={2} />
            {isEdit && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Switch checked={values.isActive} onChange={(event) => setValues((current) => ({ ...current, isActive: event.target.checked }))} />
                <Typography>Active</Typography>
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function CalibrationMasterDataPage() {
  const sectionsQuery = useSections();
  const companiesQuery = useExternalCompanies();
  const [sectionDialog, setSectionDialog] = useState(null);
  const [companyDialog, setCompanyDialog] = useState(null);
  const isLoading = sectionsQuery.isLoading || companiesQuery.isLoading;

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Calibration Master Data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage sections and external calibration companies used by equipment and plans.
          </Typography>
        </Box>

        {isLoading && <LinearProgress />}
        {(sectionsQuery.isError || companiesQuery.isError) && (
          <Alert severity="error">Some master data could not be loaded.</Alert>
        )}

        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, xl: 6 }}>
            <Card variant="outlined" sx={{ borderRadius: 1 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography variant="h6" fontWeight={800}>
                    Sections
                  </Typography>
                  <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setSectionDialog({})}>
                    New
                  </Button>
                </Stack>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Code</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(sectionsQuery.data ?? []).map((section) => (
                        <TableRow key={section.sectionId} hover>
                          <TableCell>{section.sectionCode}</TableCell>
                          <TableCell>{section.sectionName}</TableCell>
                          <TableCell>
                            <Chip label={section.isActive ? "Active" : "Inactive"} color={section.isActive ? "success" : "default"} size="small" />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit section">
                              <IconButton onClick={() => setSectionDialog(section)}>
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid2>

          <Grid2 size={{ xs: 12, xl: 6 }}>
            <Card variant="outlined" sx={{ borderRadius: 1 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography variant="h6" fontWeight={800}>
                    External Companies
                  </Typography>
                  <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setCompanyDialog({})}>
                    New
                  </Button>
                </Stack>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Company</TableCell>
                        <TableCell>Contact</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(companiesQuery.data ?? []).map((company) => (
                        <TableRow key={company.externalCompanyId} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={800}>
                              {company.companyName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {company.address || "-"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {company.contactPerson || "-"}
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                              {[company.phone, company.email].filter(Boolean).join(" / ") || "-"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={company.isActive ? "Active" : "Inactive"} color={company.isActive ? "success" : "default"} size="small" />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit company">
                              <IconButton onClick={() => setCompanyDialog(company)}>
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>
      </Stack>

      <SectionDialog open={!!sectionDialog} section={sectionDialog?.sectionId ? sectionDialog : null} onClose={() => setSectionDialog(null)} />
      <CompanyDialog open={!!companyDialog} company={companyDialog?.externalCompanyId ? companyDialog : null} onClose={() => setCompanyDialog(null)} />
    </Box>
  );
}
