import React, { useState } from 'react';
import axios from 'axios';

const UploadComponent = () => {
    const [name, setName] = useState("");
    const [file, setFile] = useState(null);

    const onFormSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', name);
        formData.append('geojson', file);

        try {
            const response = await axios.post('http://127.0.0.1:8000/upload-api/', formData);
            console.log('Response:', response.data);
        } catch (error) {
            console.error('Error uploading:', error);
        }
    }

    return (
        <div>
            <form onSubmit={onFormSubmit}>
                <div>
                    <label>Name:</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                    <label>File:</label>
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                </div>
                <button type="submit">Upload</button>
            </form>
        </div>
    );
}

export default UploadComponent;