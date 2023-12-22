import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie'

export const geojson = createAsyncThunk(
    'geojson',
    async (thunkAPI) => {
        try{
            const res = await fetch(
				`${process.env.REACT_APP_API_URL}api/main/geojson/`
			,{
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${Cookies.get('access_token')}`
                },
            });
            const data = await res.json();
            if (res.status === 200) {
                return data;   
            } else {
                return thunkAPI.rejectWithValue(data);
            }

        } catch (err) {
            return thunkAPI.rejectWithValue(err.response.data);
        }
    }
)

export const raster = createAsyncThunk(
    'raster',
    async (thunkAPI) => {
        try{
            const res = await fetch(
				`${process.env.REACT_APP_API_URL}api/main/rasters/`
			,{
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${Cookies.get('access_token')}`
                },
            });
            const data = await res.json();
            if (res.status === 200) {
                return data;   
            } else {
                return thunkAPI.rejectWithValue(data);
            }

        } catch (err) {
            
            return thunkAPI.rejectWithValue(err.response.data);
        }
    }
)

export const upload_geojson = createAsyncThunk(
    'geojson/upload',
    async ({file,projectid},thunkAPI) => {
        const formData = new FormData();
        formData.append('geojson', file, file.name); 
        formData.append('projectid',projectid)
        // for (var key of formData.entries()) {
        //     console.log("FORM",key[0] + ', ' + key[1]);
        // }

        try{
            const res = await fetch(
				`${process.env.REACT_APP_API_URL}api/main/upload/`
			,{
                method: 'POST',
                headers: {
                    // Accept: 'application/json',
                    // 'Content-Type': 'application/json',
                    Authorization: `Bearer ${Cookies.get('access_token')}`,
                },
                // body,
                body:formData,
            });
            const data = await res.json();
            if (res.status === 201) {
                return data;   
            } else {
                return thunkAPI.rejectWithValue(data);
            }
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response.data);
        }
    }
);


export const upload_raster = createAsyncThunk(
    'rasters/upload',
    async ({file,projectid},thunkAPI) => {
        
        const formData = new FormData();
        formData.append("name",file.name)
        formData.append('raster', file, file.name); 
        formData.append('projectid',projectid)

        try{
            const res = await fetch(
				`${process.env.REACT_APP_API_URL}api/main/rasters/`
			,{
                method: 'POST',
                headers: {
                    // Accept: 'application/json',
                    Authorization: `Bearer ${Cookies.get('access_token')}`
                },
                // body,
                body:formData,
            });

            const data = await res.json();

            if (res.status === 201) {
                return data;                
            } else {
                return thunkAPI.rejectWithValue(data);
            }

        } catch (err) {
            return thunkAPI.rejectWithValue(err.response.data);
        }
    }
)

export const delete_geojson = createAsyncThunk(
    'geojson/delete',
    async(id,thunkAPI) => {
        console.log("AAAAAAa",id)
        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL}api/main/geojson/${id}`
			,{
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${Cookies.get('access_token')}`
                },
            });

            if (res.ok) {
                return id;

              } else {
                const data = await res.json();
                return thunkAPI.rejectWithValue(data);
              }
            
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
    )

export const delete_raster = createAsyncThunk(
    'raster/delete',
    async (id,thunkAPI) => {
        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL}api/main/rasters/${id}`
			,{
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${Cookies.get('access_token')}`
                },
            });

            if (res.ok) {
                return id;

              } else {
                const data = await res.json();
                return thunkAPI.rejectWithValue(data);
              }
            
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

const initialState =  {
    geojson: [],
    vector: [],
    raster: [],
    loading: true,
}

const dataSlice = createSlice({
    name:'data',
    initialState,
    reducers:{
        addGeojsons:(state,action) => {
            state.geojson = action.payload;
        },
        addRasters:(state,action) => {
            state.raster = action.payload;
        }
        // resetRegistered: state => {
        //     state.registered = false
        // },
    },
    extraReducers: builder => {
        builder
            .addCase(geojson.pending, state => {
                state.loading = true;
            })
            .addCase(geojson.fulfilled, (state, action) => {
                state.loading = false;
                state.geojson = action.payload;
            })
            .addCase(geojson.rejected, state => {
                state.loading = false;
            })
            .addCase(raster.pending, state => {
                state.loading = true;
            })
            .addCase(raster.fulfilled, (state, action) => {
                state.loading = false;
                state.raster = action.payload;
            })
            .addCase(raster.rejected, state => {
                state.loading = false;
            })

    }
})

// export const { resetRegistered } = userSlice.actions;
export const {addGeojsons,addRasters} = dataSlice.actions;
export default dataSlice.reducer;