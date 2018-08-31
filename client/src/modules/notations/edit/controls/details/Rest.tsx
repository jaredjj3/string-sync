import * as React from 'react';
import { compose } from 'recompose';
import { Form, InputNumber } from 'antd';
import { Rest as RestModel } from 'models';
import { Rhythm } from './Rhythm';
import { withEditorHandlers } from 'enhancers';
import { RemoveElement } from '../RemoveElement';

interface IOuterProps {
  element: RestModel;
  editor: Store.IEditorState;
}

interface IHandlerProps extends IOuterProps {
  handlePositionChange: (value: number | string) => void;
}

const enhance = compose<IHandlerProps, IOuterProps>(
  withEditorHandlers<number | string, IOuterProps>({
    handlePositionChange: props => (value, editor) => {
      const rest = editor.vextab.elements[props.editor.elementIndex] as RestModel;
      const position = typeof value === 'number' ? value : parseInt(value, 10);
      rest.position = position;
    }
  })
);

export const Rest = enhance(props => (
  <div>
    <Form layout="inline">
      <Form.Item label="id">
        <InputNumber disabled={true} value={props.element.id} />
      </Form.Item>
      <Form.Item label="position">
        <InputNumber
          defaultValue={props.element.position}
          onChange={props.handlePositionChange}
        />
      </Form.Item>
    </Form>
    <Rhythm editor={props.editor} element={props.element.rhythm} />
  </div>
));
