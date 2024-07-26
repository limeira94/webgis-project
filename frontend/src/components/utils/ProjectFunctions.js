import Cookies from 'js-cookie';
import axios from 'axios'
import M from 'materialize-css';
import { parseGeoJSON,parseVector } from './MapUtils';
import defaultStyle from "../../configs/defaultStyle.json";

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/'

export const getProjects = async (setProjects) => {
    try {
        const accessToken = Cookies.get('access_token');
        const response = await axios.get(`${API_URL}api/main/projects/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        // const projects = response.data.map(project => {
        //     const center = calculateCenter(project.geojson);
        //     const bounds = calculateBoundingBox(project.geojson);
        //     return {
        //         ...project,
        //         centerCoordinate: center,
        //         bounds: bounds,
        //     };
        // });

        // console.log("response data", projects)
        const projects = response.data
        setProjects(projects)
    } catch (error) {
        console.error('Error fetching GeoJSON data:', error);
    }
}

export const getProject = async (projectId) => {
    try {
        const accessToken = Cookies.get('access_token');
        const response = await axios.get(`${API_URL}api/main/project/${projectId}/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        // console.log(response.data)
        const center = calculateCenter(response.data.geojson);
        const bounds = calculateBoundingBox(response.data.geojson);
        return {
            ...response.data,
                centerCoordinate: center,
                bounds: bounds,
        }  
    } catch (error) {
        console.error('Error fetching GeoJSON data:', error);
    }
}

const calculateBoundingBox = (geojsons) => {
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    geojsons.forEach(geojson => {
        const coordinates = geojson.geojson.replace('SRID=4326;', '');
        const regex = /-?\d+\.\d+ -?\d+\.\d+/g; // Regex para capturar coordenadas
        const matches = coordinates.match(regex);

        if (matches) {
            matches.forEach(match => {
                const [lng, lat] = match.split(' ').map(Number);
                minLat = Math.min(minLat, lat);
                maxLat = Math.max(maxLat, lat);
                minLng = Math.min(minLng, lng);
                maxLng = Math.max(maxLng, lng);
            });
        }
    });

    return { minLat, maxLat, minLng, maxLng };
};

const calculateCenter = (geojsons) => {
    let totalLat = 0;
    let totalLng = 0;
    let count = 0;

    geojsons.forEach(geojson => {
        const coordinates = geojson.geojson.replace('SRID=4326;', '');
        const type = geojson.geojson.includes('POLYGON') ? 'POLYGON' : 'POINT';
        const regex = /-?\d+\.\d+ -?\d+\.\d+/g; // Regex atualizado para extrair corretamente "longitude latitude", considerando sinais negativos
        const matches = coordinates.match(regex);

        if (matches) {
            matches.forEach(match => {
                const [lng, lat] = match.split(' ').map(Number);
                totalLat += lat;
                totalLng += lng;
                count++;
            });
        }
    });

    return count > 0 ? { lat: totalLat / count, lng: totalLng / count } : null;
};


export const handleDeleteProject = async (projectId, setProjects) => {
    try {
        const accessToken = Cookies.get('access_token');
        await axios.delete(`${API_URL}api/main/projects/${projectId}/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        await getProjects(setProjects);
    } catch (error) {
        console.error('Error deleting project:', error);
    }
};

export const handleNewProject = async (setProjects, inputValue, navigate) => {
    try {
        const accessToken = Cookies.get('access_token');
        const response = await axios.post(`${API_URL}api/main/projects/`,
            {
                name: inputValue
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
        console.log("RESPONSE", response)

        // const modalInstance = M.Modal.getInstance(document.getElementById('modal1'));
        // modalInstance.close();

        await getProjects(setProjects);

        const selectedProjectId = parseInt(response.data.id, 10);
        navigate(`/project/${selectedProjectId}`);
    } catch (error) {
        console.error('Error fetching GeoJSON data:', error);
    }
}

export const handleChooseOption = (id, navigate) => {
    const selectedProjectId = parseInt(id, 10);
    navigate(`/project/${selectedProjectId}`);
    // const modalInstance = M.Modal.getInstance(document.getElementById('modal1'));
    // modalInstance.close();
}


export const handleDeleteOption = (id, setProjects) => {
    const selectedProjectId = parseInt(id, 10);

    const confirmDelete = window.confirm("Are you sure you want to delete this project? You will lost all your data.");

    if (confirmDelete) {
        handleDeleteProject(selectedProjectId, setProjects);
        M.toast({
            html: "Project deleted sucessfully",
            classes: 'green rounded',
            displayLength: 5000
        });
    }
};

const createRasters = (rasters) => {
    let result = [];
    rasters.forEach(raster => {

        const tileCoordinates = raster.tiles.split(',').map(Number);
        const [xmin, ymin, xmax, ymax] = tileCoordinates;
        const bounds = [[ymin, xmin], [ymax, xmax]];


        let rasterDict = {
            "data": raster,
            "visible": true,
            "bounds": bounds,
            "style": {
                "opacity": 1
            }
        };
        result.push(rasterDict);
    });

    return result
}

export const createGeojsons = (geojsons) => {
    let result = [];
    geojsons.forEach(geojson => {
        let geojsonDict = {
            "data": geojson,
            "visible": true
        };
        result.push(geojsonDict);
    });

    return result
}


export const setData = async (
    setProject, 
    setGeoJSONs, 
    setRasters, 
    project_id, 
    projects, 
    navigate,
    setVectors
) => {
    try {
        const selectedProject = await getProject(project_id); // Wait for the project data to be fetched
        if (selectedProject) {
            setProject(selectedProject);
            setVectors(createGeojsons(parseVector(selectedProject.vector)))
            setGeoJSONs(createGeojsons(parseGeoJSON(selectedProject.geojson)));
            setRasters(createRasters(selectedProject.raster));
        } else {
            navigate(`/project`);
        }
    } catch (error) {
        console.error('Error setting project data:', error);
        navigate(`/project`);
    }
};
