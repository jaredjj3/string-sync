import * as React from 'react';
import { compose, withHandlers } from 'recompose';
import { Form, InputNumber } from 'antd';
import { connect, Dispatch } from 'react-redux';
import { updateNotation } from 'data';

interface IConnectProps {
  deadTimeMs: number;
  durationMs: number;
  notationId: number;
  updateDeadTimeMs: (notationId: number, deadTimeMs: number) => void;
  updateDurationMs: (notationId: number, durationMs: number) => void;
}

interface IHandlerProps extends IConnectProps {
  handleDeadTimeMsChange: (e: number | string) => void;
  handleDurationMsChange: (e: number | string) => void;
}

const enhance = compose<IHandlerProps, {}>(
  connect(
    (state: Store.IState) => ({
      deadTimeMs: state.notation.deadTimeMs,
      durationMs: state.notation.durationMs,
      notationId: state.notation.id
    }),
    (dispatch: Dispatch) => ({
      updateDeadTimeMs: (notationId: number, deadTimeMs: number) => (
        dispatch(updateNotation(notationId, { dead_time_ms: deadTimeMs }) as any)
      ),
      updateDurationMs: (notationId: number, durationMs: number) => (
        dispatch(updateNotation(notationId, { duration_ms: durationMs }) as any)
      )
    })
  ),
  withHandlers({
    handleDeadTimeMsChange: (props: IConnectProps) => (value: number | string) => {
      const deadTimeMs = typeof value === 'string' ? parseInt(value, 10) : value;

      if (isNaN(deadTimeMs)) {
        return;
      }

      props.updateDeadTimeMs(props.notationId, deadTimeMs);
    },
    handleDurationMsChange: (props: IConnectProps) => (value: number | string) => {
      const durationMs = typeof value === 'string' ? parseInt(value, 10) : value;

      if (isNaN(durationMs)) {
        return;
      }

      props.updateDurationMs(props.notationId, durationMs);
    }
  })
);

export const TimeEditors = enhance(props => (
  <Form.Item>
    <Form.Item label="dead">
      <InputNumber
        onChange={props.handleDeadTimeMsChange}
        value={props.deadTimeMs}
        step={100}
      />
    </Form.Item>
    <Form.Item label="dur">
      <InputNumber
        onChange={props.handleDurationMsChange}
        value={props.durationMs}
        step={100}
      />
    </Form.Item>
  </Form.Item>
));
