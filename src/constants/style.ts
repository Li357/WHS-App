/** Contains non-theme layout styles */

import { Platform } from 'react-native';

export const TEXT_FONT = Platform.select({ ios: 'SFProDisplay-Bold', android: 'Roboto-Bold' });
export const TEXT_SIZE = 40;
export const SUBTEXT_FONT = Platform.select({ ios: 'SFProDisplay-Light', android: 'Roboto-Light' });
export const SUBTEXT_SIZE = 20;

export const SCREEN_PADDING_HORIZONTAL = '10%';
export const SCREEN_PADDING_TOP = '10%';

// Controls both input and button form elements
export const FORM_HEIGHT = '50px';
export const FORM_BORDER_RADIUS = '25px'; // 1/2 of height
export const FORM_MARGIN_VERTICAL = '7.5px';

export const INPUT_PADDING_HORIZONTAL = '20px';
export const INPUT_BORDER_WIDTH = '1px';

export const LOGIN_HEADER_MARGIN = '15px'; // 2x form vertical margin
export const LOGIN_IMAGE_SIZE = '25%'; // of window height
