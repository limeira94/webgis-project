import Cookies from 'js-cookie';
import axios from 'axios'
import M from 'materialize-css';
import { parseGeoJSON } from './MapUtils';
import defaultStyle from "./defaultStyle.json";

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/'

export const getProjects = async (setProjects) => {
    try {
        const accessToken = Cookies.get('access_token');
        const response = await axios.get(`${API_URL}api/main/projects/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        setProjects(response.data)
    } catch (error) {
        console.error('Error fetching GeoJSON data:', error);
    }
}


export const handleDeleteProject = async (projectId,setProjects) => {
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

export const handleNewProject = async (setProjects,inputValue,navigate) => {
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

        const modalInstance = M.Modal.getInstance(document.getElementById('modal1'));
        modalInstance.close();

        await getProjects(setProjects);

        const selectedProjectId = parseInt(response.data.id, 10);
        
        navigate(`/project/${selectedProjectId}`);
    } catch (error) {
        console.error('Error fetching GeoJSON data:', error);
    }
}

export const handleChooseOption = (id,navigate) => {
    const selectedProjectId = parseInt(id, 10);
    navigate(`/project/${selectedProjectId}`);
    const modalInstance = M.Modal.getInstance(document.getElementById('modal1'));
    modalInstance.close();
}


export const handleDeleteOption = (id,setProjects) => {
    const selectedProjectId = parseInt(id, 10);
  
    const confirmDelete = window.confirm("Are you sure you want to delete this project? You will lost all your data.");
  
    if (confirmDelete) {
      handleDeleteProject(selectedProjectId,setProjects);
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
            "bounds":bounds,
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
            "visible": true,
            // "bounds":bounds,
            "style": defaultStyle
        };
        result.push(geojsonDict);
    });

    return result
}

export const setData = (setProject,setGeoJSONs,setRasters,project_id,projects,navigate) => {
    const selectedProject = projects.find(project => project.id === parseInt(project_id, 10));
        if (selectedProject) {
            setProject(selectedProject);
            setGeoJSONs(createGeojsons(parseGeoJSON(selectedProject.geojson)))
            setRasters(createRasters(selectedProject.raster));
        }
        else {
            navigate(`/project`);
        }
}


