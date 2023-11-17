import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/user';
// import mainReducer from './features/main'
// import forestmaskReducer from './features/forestmask'
// import productReducer from './features/products'

export const store = configureStore({
	reducer: {
		user: userReducer,
		// main: mainReducer,
		// forestmask: forestmaskReducer,
		// product:productReducer,
	},
	devTools: process.env.NODE_ENV !== 'production',
});

