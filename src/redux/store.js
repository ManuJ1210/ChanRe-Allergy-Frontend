import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../redux/slices/userSlice';
import authReducer from '../features/auth/authSlice';
import centerReducer from '../features/center/centerSlice';
import patientReducer from '../features/patient/patientSlice';
import doctorReducer from '../features/doctor/doctorSlice'; 
import adminReducer from '../features/admin/adminSlice';
import receptionistReducer from '../features/receptionist/receptionistSlice';
import centerAdminReducer from '../features/centerAdmin/centerAdminSlice';
import superadminReducer from '../features/superadmin/superadminSlice';
import superAdminDoctorReducer from '../features/superadmin/superAdminDoctorSlice';

import centerAdminDoctorReducer from '../features/centerAdmin/centerAdminDoctorSlice';
import centerAdminReceptionistReducer from '../features/centerAdmin/centerAdminReceptionistSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
    admin: adminReducer,
    center: centerReducer,
    centerAdmin: centerAdminReducer,
    patient: patientReducer,
    doctor: doctorReducer,
    receptionist: receptionistReducer,
    superadmin: superadminReducer,
    superAdminDoctors: superAdminDoctorReducer,

    centerAdminDoctors: centerAdminDoctorReducer,
    centerAdminReceptionists: centerAdminReceptionistReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
