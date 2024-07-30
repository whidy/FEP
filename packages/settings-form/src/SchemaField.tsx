import { createSchemaField } from '@formily/vue'
import * as ElementUI from '@formily/element-plus'
import { Slider, FormItemSwitcher } from '@formily/element-plus-renderer'
import {
  ColorInput,
  CollapseItem,
  SizeInput,
  DisplayStyleSetter,
  BackgroundStyleSetter,
  BoxShadowStyleSetter,
  FontStyleSetter,
  BoxStyleSetter,
  BorderRadiusStyleSetter,
  BorderStyleSetter,
  ValueInput,
  DrawerSetter,
} from './components'
// todo fix
setTimeout(() => {
  console.log(Slider, ValueInput)
}, 500);
const SchemaFields = createSchemaField({
  components: {
    ...ElementUI,
    CollapseItem,
    ColorInput,
    SizeInput,
    DisplayStyleSetter,
    BackgroundStyleSetter,
    BoxShadowStyleSetter,
    FontStyleSetter,
    DrawerSetter,
    BoxStyleSetter,
    BorderRadiusStyleSetter,
    BorderStyleSetter,
    ValueInput,
    // Slider,
    // FormItemSwitcher
  },
})

export const SchemaField = SchemaFields.SchemaField
