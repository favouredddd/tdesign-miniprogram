/*
 * @Author: rileycai
 * @Date: 2021-09-22 10:33:54
 * @LastEditTime: 2021-09-28 10:26:44
 * @LastEditors: Please set LastEditors
 * @Description: 新增textarea组件
 * @FilePath: /tdesign-miniprogram/src/textarea/textarea.ts
 */
import { SuperComponent, wxComponent } from '../common/src/index';
import config from '../common/config';
import props from './props';
import { getCharacterLength } from '../common/utils';

const { prefix } = config;
const name = `${prefix}-textarea`;

@wxComponent()
export default class Textarea extends SuperComponent {
  options = {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
  };

  behaviors = ['wx://form-field'];

  externalClasses = [`${prefix}-class`, `${prefix}-class-textarea`, `${prefix}-class-label`];

  properties = {
    ...props,
    // 指定光标与键盘的距离。取textarea距离底部的距离和cursor-spacing指定的距离的最小值作为光标与键盘的距离
    cursorSpacing: {
      type: Number,
      value: 0,
    },
  };

  data = {
    prefix,
    classPrefix: name,
    count: 0,
    maxcharacterDefault: -1,
  };

  observers = {
    value(val) {
      const { maxcharacter } = this.properties;
      const maxcharacterValue = Number(maxcharacter);
      if (maxcharacter && maxcharacter > 0 && !Number.isNaN(maxcharacter)) {
        const { length = 0 } = getCharacterLength(val);

        if (length < maxcharacterValue) {
          this.setData({
            count: length,
            maxcharacterDefault: -1,
          });
        } else if (length === maxcharacterValue) {
          this.setData({
            count: length,
            maxcharacterDefault: val.length,
          });
        } else {
          this.setData({
            value: val.slice(0, val.length - 1),
            count: length,
            maxcharacterDefault: val.length - 1,
          });
        }
      } else {
        this.setData({
          count: val ? String(val).length : 0,
        });
      }
    },
  };

  methods = {
    onInput(event) {
      this.triggerEvent('change', {
        ...event.detail,
      });
    },
    onFocus(event) {
      this.triggerEvent('focus', {
        ...event.detail,
      });
    },
    onBlur(event) {
      this.triggerEvent('blur', {
        ...event.detail,
      });
    },
    onConfirm(event) {
      this.triggerEvent('enter', {
        ...event.detail,
      });
    },
    onLineChange(event) {
      this.triggerEvent('lineChange', {
        ...event.detail,
      });
    },
  };
}
