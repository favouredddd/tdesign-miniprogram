import simulate from 'miniprogram-simulate';
import path from 'path';
import Dialog from '../index';
import * as Util from '../../common/utils';

describe('dialog', () => {
  const dialog = simulate.load(path.resolve(__dirname, `../dialog`), 't-dialog', {
    less: true,
    rootPath: path.resolve(__dirname, '../..'),
  });

  it(':base', async () => {
    const id = simulate.load({
      template: `<t-dialog id="dialog" visible />`,
      usingComponents: {
        't-dialog': dialog,
      },
    });
    const comp = simulate.render(id);
    comp.attach(document.createElement('parent-wrapper'));

    expect(comp.toJSON()).toMatchSnapshot();
  });

  it(':event', async () => {
    const handleOpenType = jest.fn();
    const handleOpenTypeError = jest.fn();
    const handleConfirm = jest.fn();
    const handleCancel = jest.fn();
    const handleOverlayClick = jest.fn();
    const id = simulate.load({
      template: `<t-dialog id="dialog"
        visible
        confirm-btn="ok" 
        cancel-btn="cancel"
        bind:open-type-event="handleOpenType"
        bind:open-type-error-event="handleOpenTypeError"
        bind:overlayClick="handleOverlayClick"
        bind:cancel="handleCancel"
        bind:confirm="handleConfirm" />`,
      methods: {
        handleOpenType,
        handleOpenTypeError,
        handleConfirm,
        handleCancel,
        handleOverlayClick,
      },
      usingComponents: {
        't-dialog': dialog,
      },
    });
    const comp = simulate.render(id);
    comp.attach(document.createElement('parent-wrapper'));

    // click confirm
    const $confirm = comp.querySelector('#dialog >>> .t-dialog__footer-button--confirm');

    $confirm.dispatchEvent('tap');
    await simulate.sleep();

    expect(handleConfirm).toHaveBeenCalledTimes(1);

    // open-type
    $confirm.dispatchEvent('getuserinfo');
    await simulate.sleep();

    expect(handleOpenType).toHaveBeenCalledTimes(1);

    $confirm.dispatchEvent('error');
    await simulate.sleep();

    expect(handleOpenType).toHaveBeenCalledTimes(1);
    expect(handleOpenTypeError).toHaveBeenCalledTimes(1);

    // click cancel
    const $cancel = comp.querySelector('#dialog >>> .t-dialog__footer-button--cancel');

    $cancel.dispatchEvent('tap');
    await simulate.sleep();

    expect(handleCancel).toHaveBeenCalledTimes(1);

    // click overlay
    const $overlay = comp.querySelector('#dialog >>> #popup-overlay');

    $overlay.dispatchEvent('tap');
    await simulate.sleep();

    expect(handleOverlayClick).toHaveBeenCalledTimes(1);
  });

  it(':custom button', async () => {
    const bindtap = jest.fn();
    const handleOpenType = jest.fn();
    const handleOpenTypeError = jest.fn();
    const id = simulate.load({
      template: `<t-dialog id="dialog"
        visible
        bind:open-type-event="handleOpenType"
        bind:open-type-error-event="handleOpenTypeError"
        confirm-btn="{{confirmBtn}}" />`,
      data: {
        confirmBtn: {
          content: 'ok1',
          bindtap,
        },
      },
      methods: {
        handleOpenType,
        handleOpenTypeError,
      },
      usingComponents: {
        't-dialog': dialog,
      },
    });
    const comp = simulate.render(id);
    comp.attach(document.createElement('parent-wrapper'));

    // click confirm
    const $confirm = comp.querySelector('#dialog >>> .t-dialog__footer-button--confirm');

    $confirm.dispatchEvent('tap');
    await simulate.sleep();

    expect(bindtap).toHaveBeenCalledTimes(1);

    $confirm.dispatchEvent('getuserinfo', { detail: { errMsg: 'ok' } });
    await simulate.sleep();

    expect(handleOpenType).toHaveBeenCalledTimes(1);

    $confirm.dispatchEvent('getuserinfo', { detail: { errMsg: 'error' } });
    await simulate.sleep();

    expect(handleOpenTypeError).toHaveBeenCalledTimes(1);
  });

  it(':actions', async () => {
    const handleAction = jest.fn();
    const id = simulate.load({
      template: `<t-dialog id="dialog"
        visible
        actions="{{actions}}"
        bind:action="handleAction" />`,
      data: {
        actions: [{ name: '1' }],
      },
      methods: {
        handleAction,
      },
      usingComponents: {
        't-dialog': dialog,
      },
    });
    const comp = simulate.render(id);
    comp.attach(document.createElement('parent-wrapper'));

    // click confirm
    const $buttons = comp.querySelectorAll('#dialog >>> .t-dialog__footer-button-host');

    expect($buttons.length).toBe(1);

    $buttons[0].dispatchEvent('tap');
    await simulate.sleep();

    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it(':instance', async () => {
    const id = simulate.load({
      template: `<t-dialog id="dialog" visible />`,
      usingComponents: {
        't-dialog': dialog,
      },
    });
    const comp = simulate.render(id);
    comp.attach(document.createElement('parent-wrapper'));

    const $dialog = comp.querySelector('#dialog');

    const mock = jest.spyOn(Util, 'getInstance');
    mock.mockImplementation(() => $dialog.instance);

    // alert
    const handleConfirm = jest.fn();
    Dialog.alert({ confirmBtn: 'ok' }).then(handleConfirm);
    const $confirm = comp.querySelector('#dialog >>> .t-dialog__footer-button--confirm');
    $confirm.dispatchEvent('tap');
    await simulate.sleep();
    expect(handleConfirm).toHaveBeenCalledTimes(1);

    // click confirm
    Dialog.confirm({ confirmBtn: 'ok' }).then(handleConfirm);

    $confirm.dispatchEvent('tap');
    await simulate.sleep();

    expect(handleConfirm).toHaveBeenCalledTimes(2);

    // click cancel
    const handleCancel = jest.fn();
    Dialog.confirm({ confirmBtn: 'ok', cancelBtn: 'fine' }).then(handleConfirm).catch(handleCancel);
    const $cancel = comp.querySelector('#dialog >>> .t-dialog__footer-button--cancel');

    $cancel.dispatchEvent('tap');
    await simulate.sleep();

    expect(handleCancel).toHaveBeenCalledTimes(1);

    // tap action
    const handleAction = jest.fn();
    Dialog.action({ actions: [{ name: 'first' }] }).then(handleAction);
    // click confirm
    const $buttons = comp.querySelectorAll('#dialog >>> .t-dialog__footer-button-host');

    expect($buttons.length).toBe(1);
    $buttons[0].dispatchEvent('tap');
    await simulate.sleep();

    expect(handleAction).toHaveBeenCalledTimes(1);

    Dialog.close();
    mock.mockRestore();
  });
});
