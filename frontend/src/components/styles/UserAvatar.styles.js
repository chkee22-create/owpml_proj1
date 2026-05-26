import styled from 'styled-components';
import { palette } from '../../shared/palette';

export const AvatarContainer = styled.div`
  width: ${(props) => props.$size || '40px'};
  height: ${(props) => props.$size || '40px'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  user-select: none;

  i {
    font-size: ${(props) => props.$size || '40px'};
    color: ${palette.slate[5]};
    transition: color 0.15s;
  }

  i:hover {
    color: ${palette.slate[7]};
  }

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;
