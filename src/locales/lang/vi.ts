import { genMessage } from '../helper';
import antdLocale from 'ant-design-vue/es/locale/en_US';
//import momentLocale from 'moment/dist/locale/eu';

const modules = import.meta.globEager('./vi/**/*.ts');
export default {
  message: {
    ...genMessage(modules, 'vi'),
    antdLocale,
  },
  momentLocale: null,
  momentLocaleName: 'vi',
};
