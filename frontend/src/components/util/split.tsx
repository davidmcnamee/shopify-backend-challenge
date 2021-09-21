/** @format */

import styled, {css} from "styled-components";

export const Split = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

export const Left = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

export const Right = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
`;
