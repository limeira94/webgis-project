import axios from 'axios'

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/'

export const getProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}api/main/projects/`);

      return response.data
    } catch (error) {
      console.error('Error fetching GeoJSON data:', error);
    }
  }

