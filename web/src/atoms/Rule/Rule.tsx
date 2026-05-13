import type { CSSProperties } from 'react';
import { color } from '../../fringe-ui/tokens';

interface RuleProps {
  color?: string;
  thick?: boolean;
}

export function Rule({ color: c = color.rule, thick }: RuleProps) {
  return (
    <div style={{ height: thick ? 2 : 1, background: c, width: '100%' }} />
  );
}