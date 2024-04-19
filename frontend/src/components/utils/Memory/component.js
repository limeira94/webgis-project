import { UploadToMemory } from "./eventHandlers";

// const memoryButton = 
const MemoryButton = (
    {
        handleButtonClick,
        fileInputRef,
        setGeojsons,
        mapInstance,
    }) => {


    const handleFileInputChange = (event) => {
        UploadToMemory(event, setGeojsons, mapInstance);
        };

return (
    <>
    <a
      onClick={handleButtonClick}
      className='btn-floating waves-effect waves-light  upload-geo-button'
      title='Upload GeoJSON'
    >

      <i className="small material-icons">file_upload</i>
      <input
        type="file"
        onChange={
            handleFileInputChange
        }
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".geojson, application/geo+json"
      />
    </a>
  </>

)}

export default MemoryButton;