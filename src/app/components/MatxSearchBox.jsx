import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@mui/material/Icon";
import {
  Alert,
  Box,
  Card,
  CardActionArea,
  Chip,
  ClickAwayListener,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Typography,
  alpha,
  styled
} from "@mui/material";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import KeyboardCommandKeyRoundedIcon from "@mui/icons-material/KeyboardCommandKeyRounded";
import { useDebounce } from "use-debounce";
import { useCalibrationDocuments, useEquipment } from "app/hooks/useCalibration";
import { topBarHeight } from "app/utils/constant";
import { asPaged, monthLabel } from "app/views/calibration/calibrationViewUtils";

const SearchRoot = styled("div")({
  position: "relative"
});

const SearchContainer = styled("div")(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  zIndex: 1200,
  width: "min(860px, calc(100vw - 24px))",
  display: "flex",
  alignItems: "center",
  height: topBarHeight,
  minHeight: topBarHeight,
  paddingInline: 12,
  background: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  [theme.breakpoints.down("md")]: {
    width: "calc(100vw - 24px)"
  }
}));

const SearchInput = styled("input")(({ theme }) => ({
  width: "100%",
  border: "none",
  outline: "none",
  fontSize: "1rem",
  paddingLeft: 20,
  height: "calc(100% - 5px)",
  background: "transparent",
  color: theme.palette.primary.contrastText,
  "&::placeholder": {
    color: alpha(theme.palette.primary.contrastText, 0.8)
  }
}));

const SearchOverlay = styled("div")(({ theme }) => ({
  position: "absolute",
  top: `calc(${topBarHeight}px - 4px)`,
  left: 0,
  width: "min(860px, calc(100vw - 24px))",
  zIndex: 1201,
  [theme.breakpoints.down("md")]: {
    width: "calc(100vw - 24px)"
  }
}));

const SearchPanel = styled(Card)(({ theme }) => ({
  borderRadius: "0 0 8px 8px",
  overflow: "hidden",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
  boxShadow: theme.shadows[16]
}));

function buildGroups(equipment, documents) {
  return [
    {
      key: "equipment",
      title: "Equipment",
      icon: <BuildOutlinedIcon fontSize="small" />,
      items: equipment.map((item) => ({
        id: `equipment-${item.id}`,
        primary: item.name,
        secondary: `${item.controlNo}${item.serialNo ? ` / SN ${item.serialNo}` : ""}`,
        tertiary: `${item.calibType} / ${item.status}`,
        path: "/equipment"
      }))
    },
    {
      key: "documents",
      title: "Documents",
      icon: <DescriptionOutlinedIcon fontSize="small" />,
      items: documents.map((item) => ({
        id: `document-${item.calibrationDocumentId}`,
        primary: `${item.calibrationType} ${item.phase}`,
        secondary: item.documentNo || `Document #${item.calibrationDocumentId}`,
        tertiary: `${monthLabel(item.targetMonth, item.targetYear)} / ${item.status}`,
        path: `/calibration-documents/${item.calibrationDocumentId}`
      }))
    }
  ].filter((group) => group.items.length > 0);
}

export default function MatxSearchBox() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const enabled = open && debouncedQuery.trim().length >= 2;
  const equipmentQuery = useEquipment(
    { Page: 1, PageSize: 5, Search: debouncedQuery.trim() },
    { enabled }
  );
  const documentsQuery = useCalibrationDocuments(
    { Page: 1, PageSize: 5 },
    { enabled }
  );

  const groups = useMemo(() => {
    const equipment = asPaged(equipmentQuery.data).items;
    const lower = debouncedQuery.trim().toLowerCase();
    const documents = asPaged(documentsQuery.data).items.filter((item) =>
      [
        item.documentNo,
        item.calibrationType,
        item.phase,
        item.status,
        monthLabel(item.targetMonth, item.targetYear)
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(lower))
    );
    return buildGroups(equipment, documents);
  }, [debouncedQuery, documentsQuery.data, equipmentQuery.data]);

  const isBusy = equipmentQuery.isLoading || equipmentQuery.isFetching || documentsQuery.isLoading || documentsQuery.isFetching;
  const isError = equipmentQuery.isError || documentsQuery.isError;
  const totalCount = groups.reduce((sum, group) => sum + group.items.length, 0);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const closeSearch = () => {
    setOpen(false);
    setQuery("");
  };

  const openResult = (path) => {
    navigate(path);
    closeSearch();
  };

  return (
    <ClickAwayListener onClickAway={() => open && closeSearch()}>
      <SearchRoot
        sx={{
          width: { xs: 40, md: "min(860px, calc(100vw - 24px))" },
          height: topBarHeight,
          display: "flex",
          alignItems: "center",
          flexShrink: 0
        }}
      >
        {!open && (
          <IconButton onClick={() => setOpen(true)} sx={{ ml: 0.5, mt: 0.5 }}>
            <Icon sx={{ color: "text.primary" }}>search</Icon>
          </IconButton>
        )}

        {open && (
          <Fragment>
            <SearchContainer sx={{ mt: 0.3 }}>
              <Icon sx={{ color: "inherit" }}>search</Icon>
              <SearchInput
                type="text"
                placeholder="Search calibration equipment and documents..."
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <Chip
                icon={<KeyboardCommandKeyRoundedIcon sx={{ fontSize: 14 }} />}
                label="K"
                size="small"
                sx={{
                  display: { xs: "none", md: "inline-flex" },
                  mr: 1,
                  color: "inherit",
                  bgcolor: alpha("#fff", 0.12),
                  "& .Chip-icon": { color: "inherit" }
                }}
              />
              <IconButton onClick={closeSearch} sx={{ mx: 1, verticalAlign: "middle", color: "inherit" }}>
                <Icon>close</Icon>
              </IconButton>
            </SearchContainer>

            <SearchOverlay>
              <SearchPanel>
                <Box sx={{ maxHeight: "min(70vh, 620px)", overflowY: "auto", p: 1.5 }}>
                  {query.trim().length < 2 ? (
                    <Box sx={{ py: 5, px: 2, textAlign: "center" }}>
                      <Typography variant="h6" fontWeight={700}>
                        Search Calibration
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Type at least 2 characters to find equipment and calibration documents.
                      </Typography>
                    </Box>
                  ) : isBusy ? (
                    <Stack spacing={1.5}>
                      {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} variant="rounded" height={82} />
                      ))}
                    </Stack>
                  ) : isError ? (
                    <Alert severity="error">Search failed.</Alert>
                  ) : totalCount === 0 ? (
                    <Box sx={{ py: 5, px: 2, textAlign: "center" }}>
                      <Typography variant="h6" fontWeight={700}>
                        No results for "{debouncedQuery.trim()}"
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={1.5}>
                      {groups.map((group) => (
                        <Card key={group.key} variant="outlined" sx={{ borderRadius: 1, overflow: "hidden" }}>
                          <Box sx={{ px: 1.5, py: 1, bgcolor: "action.hover" }}>
                            <Chip icon={group.icon} label={group.title} size="small" variant="outlined" />
                          </Box>
                          <Stack divider={<Divider flexItem />}>
                            {group.items.map((item) => (
                              <CardActionArea key={item.id} onClick={() => openResult(item.path)}>
                                <Box sx={{ px: 2, py: 1.25 }}>
                                  <Typography variant="subtitle2" fontWeight={800}>
                                    {item.primary}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {item.secondary}
                                  </Typography>
                                  <Typography variant="caption" color="text.disabled">
                                    {item.tertiary}
                                  </Typography>
                                </Box>
                              </CardActionArea>
                            ))}
                          </Stack>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Box>
              </SearchPanel>
            </SearchOverlay>
          </Fragment>
        )}
      </SearchRoot>
    </ClickAwayListener>
  );
}
