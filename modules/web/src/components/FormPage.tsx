import React from 'react';
import { Box } from './Box';
import styled from 'styled-components';
import { Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { Wordmark } from './Wordmark';

const SPANS = {
  xs: 18,
  sm: 16,
  md: 10,
  lg: 8,
  xl: 7,
  xxl: 6,
};

const StyledRow = styled(Row)`
  margin-top: 24px;
`;

const MaxWidth = styled.div`
  max-width: 320px;
  margin: 0 auto;
`;

const StyledBox = styled(Box)`
  margin-top: 24px;
`;

const StyledH1 = styled.h1`
  text-align: center;
  font-size: 32px;
`;

type Props = {
  wordmarked: boolean;
  main: JSX.Element;
  footer?: JSX.Element;
};

export const FormPage: React.FC<Props> = (props) => {
  return (
    <StyledRow data-testid="form-page" justify="center" align="middle">
      <Col {...SPANS}>
        <MaxWidth>
          <StyledBox>
            {props.wordmarked ? (
              <Link to="library">
                <StyledH1>
                  <Wordmark />
                </StyledH1>
              </Link>
            ) : null}
            {props.main}
          </StyledBox>
          {props.footer ? <StyledBox>{props.footer}</StyledBox> : null}
        </MaxWidth>
      </Col>
    </StyledRow>
  );
};