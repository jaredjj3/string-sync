import React from 'react';
import { Icon, Spin } from 'antd';
import styled from 'styled-components';
import { SpinProps } from 'antd/lib/spin';

const StyledIcon = styled(Icon)`
  font-size: 5em;
`;

const LoadingIcon = () => {
  return <StyledIcon spin type="loading" />;
};

const Spinner = (props: SpinProps) => {
  return <Spin indicator={<LoadingIcon />} {...props} />;
};

export default Spinner;