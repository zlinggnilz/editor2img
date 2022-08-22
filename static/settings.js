var settingItems = {
  backgroundOut: `背景
  <input data-name="backgroundColor" target="#preview-wrap" type="color" list="colors" value="#ffffff" class="color-input form-control form-control-sm d-block" />`,
  color: `字体颜色
  <input data-name="color" target="#preview" type="color" list="colors" value="#000000" class="color-input form-control form-control-sm d-block" />`,
  backgroundIn: `边框内背景
  <input data-name="backgroundColor" target="#preview" type="color" list="colors" value="#ffffff" class="color-input form-control form-control-sm d-block" />`,
  borderColor: `边框颜色
  <input data-name="borderColor" target="#preview" type="color" list="colors" value="#dddddd" class="color-input form-control form-control-sm d-block" />`,
  borderWidth: `边框宽度
  <input data-name="borderWidth" target="#preview" value="1" type="number" min="0" max="80" step="1" class="form-control form-control-sm" style="width:56px;" />`,
  margin: `外边距
  <input data-name="margin" target="#preview" value="20" type="number" min="0" max="120" step="1" class="form-control form-control-sm" style="width:56px;" />`,
  padding: `内边距
  <input data-name="padding" target="#preview" value="18" type="number" min="0" max="120" step="1" class="form-control form-control-sm" style="width:56px;" />`,
  borderRadius: `圆角
  <input data-name="borderRadius" target="#preview" value="16" type="number" min="0" max="999" step="1" class="form-control form-control-sm" style="width:56px;" />`,
  title: `标题
  <input data-name="text" target="#preview-title" value="Title Text" type="text" class="form-control form-control-sm" style="width:120px;" />`,
  titleSize: `标题字号
  <input data-name="fontSize" target="#preview-title" value="24" type="number" min="0" max="999" step="1" class="form-control form-control-sm" style="width:56px;" />`,
  titleWeight: `标题加粗
  <select data-name="fontWeight" target="#preview-title" class="form-select form-select-sm" style="width:94px;">
  <option selected value="bold">加粗</option>
  <option value="normal">不加粗</option>
  </select>`,
  titleAlign: `标题加粗
  <select data-name="textAlign" target="#preview-title" class="form-select form-select-sm" style="width:94px;">
  <option selected value="center">居中</option>
  <option value="left">左对齐</option>
  <option value="right">右对齐</option>
  </select>`,
  titlePadding: `标题内边距
  <input data-name="padding" target="#preview-title" value="16" type="number" min="0" max="999" step="1" class="form-control form-control-sm" style="width:56px;" />`,
  titleColor: `标题颜色
  <input data-name="color" target="#preview-title" type="color" list="colors" value="#ffffff" class="color-input form-control form-control-sm d-block" />`,
  titleBackground: `标题背景
  <input data-name="backgroundColor" target="#preview-title" type="color" list="colors" value="#6c757d" class="color-input form-control form-control-sm d-block" />`,
};

var settings = {
  basic: ["backgroundOut", "color", "padding"],
  "with-border": ["backgroundOut", "color", "backgroundIn", "borderColor", "borderWidth", "margin", "padding", "borderRadius"],
  "with-title": [
    "title",
    "titleSize",
    "titleColor",
    "titleWeight","titleAlign",
    "titlePadding",
    "titleBackground",
    "|",
    "backgroundOut",
    "color",
    "padding",
  ],
};

var settingHtml = {
  basic: `<div id="preview" class="mk"></div>`,
  "with-border": `<div id="preview" class="mk"></div>`,
  "with-title": `<div id="preview-title"></div><div id="preview" class="mk"></div>`,
};
