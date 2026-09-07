import type { Theme } from '@mui/material/styles';

export function getDrawerSxTransitionMixin(expanded: boolean, prop: string) {
  // Use the `expanded` flag to choose a slightly different duration so the
  // parameter is actually referenced (avoids unused param diagnostics) and
  // gives a subtle different effect when collapsing/expanding.
  const duration = expanded ? 'enteringScreen' : 'leavingScreen';

  return {
    transition: (theme: Theme) =>
      theme.transitions.create(prop, {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration[duration as keyof Theme['transitions']['duration']] as number,
      }),
  };
}

export function getDrawerWidthTransitionMixin(expanded: boolean) {
  const duration = expanded ? 'enteringScreen' : 'leavingScreen';

  return {
    transition: (theme: Theme) =>
      theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration[duration as keyof Theme['transitions']['duration']] as number,
      }),
  };
}
