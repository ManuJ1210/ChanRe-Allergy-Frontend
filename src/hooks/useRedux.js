// src/hooks/useRedux.js
import { useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Custom hook to get user from either auth state
export const useAuth = () => {
  const { user: authUser } = useSelector((state) => state.auth);
  const { userInfo } = useSelector((state) => state.user);
  
  // Return whichever user is available
  return authUser || userInfo;
};
