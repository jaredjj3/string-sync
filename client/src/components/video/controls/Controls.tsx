import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { NotationMenuActions } from '../../../data/notation-menu/notationMenuActions';
import { Row, Col, Icon } from 'antd';
import { Lane } from '../../lane';
import styled from 'react-emotion';
import { Settings } from './Settings';
import { Detail } from './Detail';

interface IDispatchProps {
  toggleVisibility: () => void;
}

const enhance = compose<IDispatchProps, {}>(
  connect(
    null,
    dispatch => ({
      toggleVisibility: () => dispatch(NotationMenuActions.toggleVisibility())
    })
  )
);

const Outer = styled('div')`
  padding: 12px 0;
`;

export const Controls = enhance(props => (
  <Outer>
    <Lane withPadding={true}>
      <Row type="flex" justify="center" align="middle">
        <Col span={1}>
          <Row type="flex" justify="center" align="middle">
            <Icon type="play-circle" style={{ fontSize: 24 }} />
          </Row>
        </Col>
        <Col xxl={18} xl={18} lg={22} md={22} sm={22} xs={22}>
          <div>Slider</div>
        </Col>
        <Col span={1}>
          <Settings />
        </Col>
        <Col xxl={4} xl={4} lg={0} md={0} sm={0} xs={0}>
          <Detail />
        </Col>
      </Row>
    </Lane>
  </Outer>
));
