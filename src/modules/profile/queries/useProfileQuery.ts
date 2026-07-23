import { useQuery } from '@tanstack/react-query';
import ProfileService from '../services/ProfileService';

export const useProfileQuery = () =>
  useQuery({
    queryKey: ['profile', 'me'],
    queryFn: ProfileService.getMyProfile,
    staleTime: 5 * 60 * 1000,
  });
