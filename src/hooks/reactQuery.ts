import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

export const handleMutation = async (mutationFn: any, onSuccess: any) => {
  try {
    await mutationFn();
    queryClient.invalidateQueries({ queryKey: ['tasks', 'all'] });
  } catch (error) {
    console.error(error);
  }
};
