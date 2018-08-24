import * as React from 'react';
import { compose } from 'recompose';
import { Form, Input } from 'antd';
import { Directive } from 'models';
import styled from 'react-emotion';

interface IOuterProps {
  directive: Directive;
}

const enhance = compose<IOuterProps, IOuterProps>(

);

const Indented = styled('div')`
  margin-left: 16px;
`;

export const GraceNote = enhance(props => (
  <Form.Item label="grace note">
    <Indented>
      {
        Object.keys(props.directive.payload).map(key => (
          <Form.Item key={`grace-note-${props.directive.element.id}-${key}`} label={`${key}`}>
            <Input value={JSON.stringify(props.directive.payload[key])} />
          </Form.Item>
        ))
      }
    </Indented>
  </Form.Item>
));
