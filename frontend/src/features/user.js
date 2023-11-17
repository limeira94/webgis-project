import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

export const register = createAsyncThunk(
    'users/register',
	async ({username,email,password,password2},thunkAPI)=>{
        const body = JSON.stringify({
			username,
            email,
            password,
			password2,
        });

        try {
            const res = await fetch(
				`${process.env.REACT_APP_API_URL}/api/users/register/`
			,{
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    "Content-Type": 'application/json',
                },
                body,
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

export const update = createAsyncThunk(
	'users/update',
	async ({ first_name, last_name, profile_picture,access }, thunkAPI) => {
	  const formData = new FormData();
	  formData.append('first_name', first_name);
	  formData.append('last_name', last_name);
	  formData.append('profile_picture', profile_picture);
  
	  try {
		const res = await fetch(`${process.env.API_URL}/api/users/update/`, {
			method: 'POST',
			headers: {
			  Accept: 'application/json',
			  Authorization: `Bearer ${access}`,
			},
			body: formData,
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


const getUser = createAsyncThunk('users/me', 
	// async (_, thunkAPI) => {
	async (_, thunkAPI) => {
	try {
		// const res = await fetch('/api/users/me', {
		// 	method: 'GET',
		// 	headers: {
		// 		Accept: 'application/json',
		// 	},
		// });
		const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/me`,{
            method:'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${Cookies.get('access_token')}`
            },
        });

		const data = await res.json();

		if (res.status === 200) {
			return data;
		} else {
			const { dispatch } = thunkAPI;
				
			dispatch(logout());
			return thunkAPI.rejectWithValue(data);
		}
	} catch (err) {
		return thunkAPI.rejectWithValue(err.response.data);
	}
});

export const login = createAsyncThunk(
    'users/login',
    async ({ username, password },thunkAPI) => {
        const body = JSON.stringify({
            username,
            password,
        });

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}api/main/token/`, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body,
			});

            const data = await res.json();

            if (res.status === 200) {
                const { dispatch } = thunkAPI;

                Cookies.set('access_token', data.access);
                Cookies.set('refresh_token', data.refresh);

                dispatch(getUser());

                return data;
            } else {
                return thunkAPI.rejectWithValue(data);
            }
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response.data);
        }
    }
);

export const checkAuth = createAsyncThunk(
	'users/verify',
	async (_, thunkAPI) => {
		try {

			const body = JSON.stringify({
				token:Cookies.get('refresh_token'),//access
			});

			const res = await fetch(`${process.env.REACT_APP_API_URL}/api/main/token/verify/`,{
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					// Authorization: `Bearer ${Cookies.get('access_token')}`
				},
				body,
			});

			const data = await res.json();

			if (res.status === 200) {
				const { dispatch } = thunkAPI;

				dispatch(getUser());

				return data;
			} else {
				return thunkAPI.rejectWithValue(data);
			}
		} catch (err) {
			return thunkAPI.rejectWithValue(err.response.data);
		}
	}
);

export const logout = createAsyncThunk('users/logout', async (_, thunkAPI) => {
	try {
		Cookies.remove('access_token');
      	Cookies.remove('refresh_token');
	} catch (err) {
		return thunkAPI.rejectWithValue(err.response.data);
	}
});


export const deleteUser = createAsyncThunk(
	'users/deleteUser',
	async (userId, thunkAPI) => {
	  try {
		const res = await fetch(`/api/users/delete/${userId}`, {
		  method: 'DELETE',
		  headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		  },
		});
  
		if (res.ok) {
		  // Deletion was successful
		  return userId;
		} else {
		  const data = await res.json();
		  return thunkAPI.rejectWithValue(data);
		}
	  } catch (err) {
		return thunkAPI.rejectWithValue(err.response.data);
	  }
	}
  );

const initialState =  {
    isAuthenticated: false,
    user: null,
    loading: true,//false,
    registered: false,
}

const userSlice = createSlice({
    name:'user',
    initialState,
    reducers:{
        resetRegistered: state => {
            state.registered = false
        },
    },
    extraReducers: builder => {
        builder
            .addCase(register.pending, state => {
                state.loading = true;
            })
            .addCase(register.fulfilled, state => {
                state.loading = false;
                state.registered = true;
            })
            .addCase(register.rejected, state => {
                state.loading = false;
            })
            .addCase(login.pending, state => {
				state.loading = true;
			})
			.addCase(login.fulfilled, state => {
				state.loading = false;
				state.isAuthenticated = true;
			})
			.addCase(login.rejected, state => {
				state.loading = false;
			})
            .addCase(getUser.pending, state => {
				state.loading = true;
			})
			.addCase(getUser.fulfilled, (state, action) => {
				state.loading = false;
				state.user = action.payload;
				
			})
			.addCase(getUser.rejected, state => {
				state.loading = false;
			})
            .addCase(checkAuth.pending, state => {
				state.loading = true;
			})
			.addCase(checkAuth.fulfilled, state => {
				state.loading = false;
				state.isAuthenticated = true;
			})
			.addCase(checkAuth.rejected, state => {
				state.loading = false;
			})
            .addCase(logout.pending, state => {
				state.loading = true;
			})
			.addCase(logout.fulfilled, state => {
				state.loading = false;
				state.isAuthenticated = false;
				state.user = null;
			})
			.addCase(logout.rejected, state => {
				state.loading = false;
			})
			.addCase(update.pending,state => {
				// console.log(state)
				state.loading = true;
			})
			.addCase(update.fulfilled,state =>{
				// console.log(state)
				state.loading = false
			})
			.addCase(update.rejected,state =>{
				// console.log(state)
				state.loading = false
			})
			;
    }
})

export const { resetRegistered } = userSlice.actions;
export default userSlice.reducer;