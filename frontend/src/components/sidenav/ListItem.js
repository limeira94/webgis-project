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
    Alert
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import DeleteIcon from '@mui/icons-material/Delete';


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
    inmemory = false
}) => {

    const dispatch = useDispatch();
    const [showStyleControls, setShowStyleControls] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAttributes, setSelectedAttributes] = useState({ features: [] });
    const modalRef = useRef(null);
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

    const handleToggleClick = () => {
        setShowStyleControls(!showStyleControls);
    };

    const handleDelete = () => handleDeleteFiles(
        dataset_id,
        dispatch,
        datasets,
        setDatasets,
        deleteFunction,
        setSnackbarState,
        inmemory,
        datatype
    );

    const dataset_id = datatype === "raster" ? dataset.data.id : dataset.data.properties.id;
    const deleteFunction = datatype === "raster" ? delete_raster : delete_geojson;
    const url = process.env.PUBLIC_URL;
    const maxCharacters = 20;
    let img_icon, styleControlItem, dataset_name;
    const zoomanddelete = (
        <>
            <TableRow>
                <TableCell>Zoom to</TableCell>
                <TableCell align="right">
                    <IconButton onClick={() => zoomToLayer(dataset_id)}>
                        <ZoomInIcon />
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell>Delete</TableCell>
                <TableCell align="right">
                    <IconButton onClick={handleDelete}>
                        <DeleteIcon />
                    </IconButton>
                </TableCell>
            </TableRow>
        </>
    );
    if (datatype === "raster") {
        dataset_name = dataset.data.name;
        img_icon = "/raster.png";
        styleControlItem = (
            <StyleRasterControls
                rasters={datasets}
                setRasters={setDatasets}
                raster_id={dataset_id}
                bands={dataset.data.bands}
                zoomanddelete={zoomanddelete}
            />
        );
    } else {
        dataset_name = dataset.data.properties.name;
        img_icon = "/vector.png";
        styleControlItem = (
            <StyleControls
                geojsondata={dataset}
                updateStyle={updateStyle}
                updateStyleCat={updateStyleCat}
                zoomanddelete={zoomanddelete}
                changeStyleData={changeStyleData}
                setChangeStyleData={setChangeStyleData}
            />
        );
    }

    return (
        <div>
        <MUIListItem key={`${datatype}-${dataset_id}`} className='list-dataset'>
            <Box display="flex" alignItems="center">
                <IconButton onClick={handleToggleClick}>
                    {showStyleControls ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
                </IconButton>

                <Checkbox
                    checked={dataset.visible}
                    onChange={() => handleVisibilityChange(dataset)}
                />

                <Box display="flex" alignItems="center">
                    <img className="icon-data" src={url + img_icon} alt={`${datatype}-item`} />
                    <Typography variant="body1">
                        {dataset_name.length > maxCharacters ? `${dataset_name.slice(0, maxCharacters)}...` : dataset_name}
                    </Typography>
                </Box>
            </Box>

            <Collapse in={showStyleControls}>
                <Box>
                    {styleControlItem}
                </Box>
            </Collapse>

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
        </MUIListItem>
        <Snackbar
                open={snackbarState.open}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarState.severity} sx={{ width: '100%' }}>
                    {snackbarState.message}
                </Alert>
            </Snackbar>
        </div>
    );
};