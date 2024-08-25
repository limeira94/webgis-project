import { StyleControls, StyleRasterControls, } from "./StyleControls";
import React, { useState, useRef } from "react";
import { delete_geojson, delete_raster } from "../../features/data";
import { useDispatch } from "react-redux";
import {
    ListItem as MUIListItem,
    Checkbox,
    IconButton,
    Collapse,
    Modal,
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Snackbar,
    Alert,
    Menu,
    MenuItem,
    Divider
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import RectangleRoundedIcon from '@mui/icons-material/RectangleRounded';
import HorizontalRuleRoundedIcon from '@mui/icons-material/HorizontalRuleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';


const removeItemFromList = (datasets, setDatasets, fileId, datatype) => {
    if (datatype == "raster") {
        const newDatasets = datasets.filter(datasetItem => datasetItem.data.id !== fileId);
        setDatasets(newDatasets);
    } else {
        const newDatasets = datasets.filter(datasetItem => datasetItem.data.properties.id !== fileId);
        setDatasets(newDatasets);
    }
}

export const handleDeleteFiles = (
    fileId,
    dispatch,
    datasets,
    setDatasets,
    functionDelete,
    setSnackbarState,
    inmemory = false,
    datatype = "raster"
) => {

    if (inmemory) {
        removeItemFromList(datasets, setDatasets, fileId, datatype);
        setSnackbarState({
            open: true,
            message: "File deleted successfully",
            severity: "success"
        });
    } else {
        dispatch(functionDelete(fileId))
            .then((action) => {
                if (action.meta.requestStatus === 'fulfilled') {
                    removeItemFromList(datasets, setDatasets, fileId, datatype);
                    setSnackbarState({
                        open: true,
                        message: "File deleted successfully",
                        severity: "success"
                    });
                } else {
                    console.error(`Failed to delete ${datatype}`);
                    setSnackbarState({
                        open: true,
                        message: `Failed to delete ${datatype}`,
                        severity: "error"
                    });
                }
            })
            .catch((error) => {
                console.error('Error occurred while deleting request:', error);
                setSnackbarState({
                    open: true,
                    message: 'Error occurred while deleting request',
                    severity: "error"
                });
            });
    }
}

export const ListItem = ({
    datasets,
    setDatasets,
    dataset,
    datatype,
    zoomToLayer,
    updateStyle,
    updateStyleCat,
    geojsonLayerRefs,
    mapInstance,
    changeStyleData,
    setChangeStyleData,
    handleDownload,
    inmemory = false
}) => {

    const dispatch = useDispatch();
    const [showStyleControls, setShowStyleControls] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAttributes, setSelectedAttributes] = useState({ features: [] });
    const modalRef = useRef(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [snackbarState, setSnackbarState] = useState({
        open: false,
        message: '',
        severity: 'success', // ou 'error'
    });

    const handleCloseSnackbar = () => {
        setSnackbarState(prev => ({ ...prev, open: false }));
    };

    const handleVisibilityChange = (dataset) => {
        const updatedDataset = { ...dataset, visible: !dataset.visible };
        setDatasets(prevDatasets => {
            return prevDatasets.map(item => {
                const comp = dataset.data.properties == undefined ?
                    item.data.id === dataset.data.id :
                    item.data.properties.id === dataset.data.properties.id
                if (comp) {
                    return updatedDataset;
                }
                return item;
            });
        });
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDelete = () => {
        handleDeleteFiles(
            dataset_id,
            dispatch,
            datasets,
            setDatasets,
            deleteFunction,
            setSnackbarState,
            inmemory,
            datatype
        );
        handleMenuClose();
    };

    const handleRename = () => {
        handleMenuClose();
    };

    // const handleDownload = () => {
    //     handleMenuClose();
    // };

    const handleToggleClick = () => {
        setShowStyleControls(!showStyleControls);
    };

    const dataset_id = datatype === "raster" ? dataset.data.id : dataset.data.properties.id;
    const deleteFunction = datatype === "raster" ? delete_raster : delete_geojson;
    const url = process.env.PUBLIC_URL;
    const maxCharacters = 20;
    let img_icon, styleControlItem, dataset_name;

    if (datatype === "raster") {
        dataset_name = dataset.data.name;
        img_icon = "/raster.png";
        styleControlItem = (
            <StyleRasterControls
                rasters={datasets}
                setRasters={setDatasets}
                raster_id={dataset_id}
                bands={dataset.data.bands}
            />
        );
    } else {
        dataset_name = dataset.data.properties.name;
        const geometryType = dataset.data.features[0].geometry.type;
        console.log("geometryType", geometryType);
        if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
            img_icon = <RectangleRoundedIcon style={{ color: 'orange', width: 24, height: 24 }} />; 
        } else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
            img_icon = <HorizontalRuleRoundedIcon style={{ color: 'pink', width: 24, height: 24 }} />; 
        } else if (geometryType === 'Point' || geometryType === 'MultiPoint') {
            img_icon = <RadioButtonUncheckedRoundedIcon style={{ color: 'blue', width: 15, height: 15 }} />; 
        }

        styleControlItem = (
            <StyleControls
                geojsondata={dataset}
                updateStyle={updateStyle}
                updateStyleCat={updateStyleCat}
                changeStyleData={changeStyleData}
                setChangeStyleData={setChangeStyleData}
            />
        );
    }

    console.log(dataset)
    return (
        <div>
            <MUIListItem
                key={`${datatype}-${dataset_id}`}
                sx={{ paddingY: 0, paddingX: 2 }}
                className='list-dataset'>
                <Box sx={{}}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                        <Box display="flex" alignItems="center" width="100%">
                            <Box sx={{ display: 'flex', alignItems: 'center', width: 30, textAlign: 'center' }}>
                                {img_icon}
                            </Box>
                            <Typography
                                variant="body1"
                                sx={{
                                    ml: 1,
                                    flexGrow: 1,
                                    minWidth: 70, // Largura mínima para o nome
                                    maxWidth: 70, // Largura máxima fixa para o nome
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    lineHeight: '1.2em',
                                }}
                            >
                                {dataset_name.length > maxCharacters ? `${dataset_name.slice(0, maxCharacters)}...` : dataset_name}
                            </Typography>

                            <IconButton
                                onClick={() => zoomToLayer(dataset_id)}
                                aria-label="zoom"
                                sx={{ padding: 0, width: 40, height: 40 }}
                            >
                                <img src={`${process.env.PUBLIC_URL}/zoom-layer.png`} alt="Zoom Icon" style={{ width: 20, height: 20 }} />
                            </IconButton>

                            <Checkbox
                                checked={dataset.visible}
                                onClick={() => handleVisibilityChange(dataset)}
                                sx={{
                                    color: 'black',
                                    '&.Mui-checked': {
                                        color: 'black',
                                        '& .MuiSvgIcon-root': {
                                            backgroundColor: 'white',
                                            border: '1px solid black',
                                        },
                                    },
                                    width: 40,
                                    height: 40,
                                }}
                            />

                            <IconButton
                                onClick={handleMenuClick}
                                aria-label="more-options"
                                sx={{ padding: 0, width: 40, height: 40, color: 'black' }}
                            >
                                <MoreVertIcon />
                            </IconButton>
                            <IconButton
                                onClick={handleToggleClick}
                                sx={{ padding: 0, width: 40, height: 40, color: 'black' }}
                            >
                                {showStyleControls ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
                            </IconButton>
                        </Box>
                    </Box>

                    <Collapse in={showStyleControls}>
                        <Box mt={1}>
                            {styleControlItem}
                        </Box>
                    </Collapse>
                </Box>
            </MUIListItem>

            <Divider sx={{ borderColor: 'gray', borderWidth: 1, mt:0}} />

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.16)',
                        mt: 1.5,
                        '& .MuiMenuItem-root': {
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            }
                        },
                        '& .MuiMenuItem-root:last-child': {
                            borderTop: '1px solid #e0e0e0',
                            marginTop: '8px',
                        },
                    }
                }}
            >
                <MenuItem onClick={handleRename}>
                    <EditIcon sx={{ mr: 1 }} />
                    Rename
                </MenuItem>
                <MenuItem
                    // href={""}
                    onClick={()=>handleDownload(dataset)}
                    >
                    <DownloadIcon sx={{ mr: 1 }} />
                    Download
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: 'red' }}>
                    <DeleteIcon sx={{ mr: 1 }} />
                    Delete
                </MenuItem>
            </Menu>

            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box ref={modalRef} sx={{ p: 4, backgroundColor: 'white', margin: 'auto', maxWidth: 600 }}>
                    <Typography id="modal-title" variant="h6">
                        Tabela de Atributos
                    </Typography>
                    <Table className="striped">
                        <TableBody>
                            {selectedAttributes?.features?.map((feature, featureIndex) => (
                                <React.Fragment key={featureIndex}>
                                    {Object.entries(feature.properties).map(([key, value], index) => (
                                        <TableRow key={index}>
                                            <TableCell>{key}</TableCell>
                                            <TableCell>{value}</TableCell>
                                        </TableRow>
                                    ))}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                    <Box textAlign="right" mt={2}>
                        <button className="modal-close btn-flat" onClick={() => setIsModalOpen(false)}>Fechar</button>
                    </Box>
                </Box>
            </Modal>

            <Snackbar
                open={snackbarState.open}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarState.severity} sx={{ width: '100%' }}>
                    {snackbarState.message}
                </Alert>
            </Snackbar>
        </div >
    );
};
