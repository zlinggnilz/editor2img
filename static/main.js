var blobPng;
var blobJpg;
var splitBlobArr = [];
var imgWidth;
var imgHeight;
var previewWidth;
var targetWrap = "#toHtmlWrap";

var settingConfig = {};

var splitNum;

var editorHtml = "";

const E = window.wangEditor;

E.i18nChangeLanguage("zh-CN");

window.editor = E.createEditor({
  selector: "#editor-text-area",
  html: "<p><br></p>",
  config: {
    placeholder: "写入内容",
    MENU_CONF: {
      uploadImage: {
        fieldName: "test",
        base64LimitSize: 0.05 * 1024 * 1024, // 10M 以下插入 base64
        customUpload(file, insertFn) {
          const imgUrl = getObjectURL(file);
          insertFn(imgUrl);
        },
      },
    },
    onChange(editor) {
      const text = editor.getHtml();
      if (editorHtml === text) {
        return;
      }

      editorHtml = text;

      $(".preview-content").html(text);

      clear();
    },
  },
});
window.toolbar = E.createToolbar({
  editor,
  selector: "#editor-toolbar",
  config: {
    excludeKeys: ["group-video", "group-image", "todo"],
    insertKeys: {
      index: 23,
      keys: ["uploadImage"],
    },
  },
});

$(function () {
  init();

  $(".templateSelect").select2({ dropdownCssClass: "no-search", templateResult: formatState, templateSelection: formatState });

  $("#tabBtnWrap .btn").on("click", function () {
    $(this)
      .removeClass("btn-outline-secondary")
      .blur()
      .addClass("btn-secondary")
      .siblings()
      .removeClass("btn-secondary")
      .addClass("btn-outline-secondary");
    const target = $(this).attr("target");
    targetWrap = target;
    $(target).show().siblings().hide();
    init();
    settingPreviewStyle();
  });

  $(".templateSelect").on("change", function () {
    clear("all");
    settingTemplateSet();
  });

  $(".preview-setting").on("change", ".setting-items input,.setting-items select", function () {
    setStyle($(this));
  });

  $("#createImgBtn").on("click", function () {
    blurActive();

    clear("splitPreview");

    var settingWidth = ~~Number($("#setting-img-width").val()) || previewWidth;

    html2canvas(document.querySelector("#preview-wrap"), {
      scale: settingWidth / previewWidth,
    }).then(async function (canvas) {
      canvas.id = "canvas-v";
      document.body.appendChild(canvas);
      blobPng = await blobPromise(canvas, "image/png", 1);
      blobJpg = await blobPromise(canvas, "image/jpeg", 0.9);

      $("#preview-image-wrap").show();
      $("#preview-image").html(`<img src='${blobJpg}' />`);

      setTimeout(() => {
        scroll2Top("#createImgBtn");
      }, 50);

      $(canvas).remove();
    });
  });

  $("#splitImgBtn").on("click", function () {
    blurActive();

    imgWidth = $("#preview-image img").width();
    imgHeight = $("#preview-image img").height();
    $("#split-div").css({
      width: imgWidth,
      height: imgHeight,
      background: `url(${blobPng})`,
    });
    $("#split-div-wrap").css({
      height: imgHeight * 0.4 + 8,
    });
    insertSplit();
    $("#preview-split-wrap").show();

    scroll2Top("#splitImgBtn");
  });

  $("#createSplitBtn").on("click", function () {
    blurActive();

    $("#split-img").show();

    getSplitImg();
    setTimeout(() => {
      scroll2Top("#createSplitBtn");
    }, 300);
  });

  $("#split-input-wrap").on("change", "input", function () {
    var index = $(this).index();
    var v = Math.floor($(this).val());
    var anotherIndex = index === splitNum - 1 ? 0 : splitNum - 1; // 第一个或最后一个
    var totalOthers = Array.from($(`#split-input-wrap input`)).reduce((total, item, i) => {
      if (i === index || i === anotherIndex) {
        return total;
      }
      return Number($(item).val()) + total;
    }, 0);

    var rest = imgHeight - totalOthers;
    v = rest > 20 && v < 10 ? 10 : v;
    var anotherV = rest - v;
    if (rest > 20 && anotherV < 10) {
      anotherV = 10;
      v = rest - anotherV;
    }
    var halfRest = rest / 2;
    if (rest < 20 && ((anotherV < 10 && anotherV < halfRest) || (v < 10 && v < halfRest))) {
      console.log("🚀 ~ file: main.js ~ line 146 ~ anotherV", anotherV, v);
      anotherV = ~~halfRest;
      v = rest - anotherV;
      if (v < 4) {
        v = 4;
        anotherV = rest - v;
      }
    }
    console.log("🚀 ~ file: main.js ~ line 153 ~ v", v);
    $(this).val(v);
    $(`#split-input-wrap input`).eq(anotherIndex).val(anotherV);
    setSplitHeight();
  });

  $("#split-select").on("change", function () {
    splitNum = Number($(this).val()) || 2;
    clear("split");
    insertSplit();
  });

  $("#downloadHtml").on('click',function () {
    settingOutlookHtml()
    var html = $("#preview-html-container").html()
    var ht=`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Email</title></head><body>${html}</body></html>`
    downloadHtml(ht, `outlook_html_${Date.now()}.html`)
  })
});

function init() {
  if (targetWrap === "#toHtmlWrap") {
    initOutlook();
  } else {
    initImage();
  }
}

function initImage() {
  splitNum = Number($("#split-select").val()) || 2;

  settingTemplateSet();
}
function initOutlook() {
  settingTemplateSet();
}

function settingPreviewStyle() {
  $(targetWrap)
    .find(".setting-items input, .setting-items select")
    .each(function () {
      const cname = $(this).parent().attr("data-setting");
      if (cname) {
        var sv = settingConfig[cname];
        if (sv) {
          $(this).val(sv);
        }
      }
      setStyle($(this));
    });
}

function getObjectURL(obj) {
  var url = null;
  if (window.createObjectURL != undefined) {
    url = window.createObjectURL(obj);
  } else if (window.URL != undefined) {
    url = window.URL.createObjectURL(obj);
  } else if (window.webkitURL != undefined) {
    url = window.webkitURL.createObjectURL(obj);
  }
  return url;
}

function blobPromise(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      function (blob) {
        var blobUrl = getObjectURL(blob);
        resolve(blobUrl);
      },
      type,
      quality
    );
  });
}

function insertSplit() {
  var input = `<input class='form-control form-control-sm d-inline-block ms-1' type='number' min='10' style="width:60px;" />`;
  var html = input.repeat(splitNum);
  $("#split-input-wrap").html(html);
  var height = $("#preview-image img").height();
  var splitHeight = Math.floor(height / splitNum);
  var splitHeightLast = height - splitHeight * (splitNum - 1);
  $(`#split-input-wrap input:lt(${splitNum - 1})`).val(splitHeight);
  $(`#split-input-wrap input`)
    .eq(splitNum - 1)
    .val(splitHeightLast);
  var split = `<div class='split-span' style="background:url(${blobPng})"></div>`;
  var splitHtml = split.repeat(splitNum);
  $("#split-div").html(splitHtml);
  setSplitHeight();
}

function setSplitHeight() {
  $("#split-splits").html("");

  $(`#split-input-wrap input`).each(function () {
    var index = $(this).index();
    var inputV = Math.floor(Number($(this).val()));
    const h = Array.from($(`#split-input-wrap input`)).reduce((total, item, i) => {
      if (i < index) {
        return Number($(item).val()) + total;
      }
      return total;
    }, 0);
    $("#split-div .split-span").eq(index).height(inputV).css("backgroundPosition", `0 -${h}px`).attr("dy", h);
  });
}

var canvasSplit = document.createElement("canvas");
function getSplitImg() {
  var index = 0;
  const img = new Image();
  img.src = blobPng;

  var handle = async function () {
    var item = $("#split-div .split-span").eq(index);
    var h = item.height();
    var dy = Number(item.attr("dy")) || 0;
    canvasSplit.width = imgWidth;
    var cx = canvasSplit.getContext("2d");

    canvasSplit.height = h;
    cx.fillStyle = "#fff";
    cx.fillRect(0, 0, imgWidth, h);
    cx.drawImage(img, 0, -dy, imgWidth, imgHeight);
    var blobUrl = await blobPromise(canvasSplit, "image/jpeg", 0.9);
    splitBlobArr.push(blobUrl);
    $("#split-splits").append(`<div class="split-span1 me-4 mb-4"><img src='${blobUrl}' width="300" /></div>`);
    if (index < splitNum - 1) {
      index++;
      handle();
    }
  };
  handle();
}

function clear(type = "all") {
  if(targetWrap === '#toHtmlWrap'){
    return
  }
  if (type === "all") {
    blobPng && URL.revokeObjectURL(blobPng);
    blobJpg && URL.revokeObjectURL(blobJpg);
    if (splitBlobArr.length) {
      splitBlobArr.forEach((item) => {
        URL.revokeObjectURL(item);
      });
      splitBlobArr = [];
    }
    $("#preview-image,#split-div").html("");
    $("#preview-split-wrap, #split-img, #preview-image-wrap").hide();
  } else if (type === "splitPreview") {
    $("#split-div").html("");
    $("#preview-split-wrap, #split-img").hide();
    $("#split-splits").html("");
  } else if (type === "split") {
    $("#split-img").hide();
    $("#split-splits").html("");
  }
}

function scroll2Top(selector) {
  blurActive();
  document.querySelector(selector).scrollIntoView({
    behavior: "instant",
    block: "start",
    inline: "start",
  });
}

function blurActive() {
  if (document && document.activeElement) {
    document.activeElement.blur();
  }
}
function setStyle($item) {
  var name = $item.attr("data-name");
  var type = $item.attr("type");
  var target = $item.attr("target");
  var v = $item.val().trim();

  const cname = $item.parent().attr("data-setting");
  cname && (settingConfig[cname] = $item.val().trim());

  if (name === "preview-width") {
    previewWidth = v || 750;
    $item.val(previewWidth);
    $("#preview-wrap").css({
      width: `${previewWidth}px`,
    });
    return;
  }

  if (name === "text") {
    $(target).text(v);
    return;
  }

  v = type === "number" ? ~~v : v;
  var vv = type === "number" ? v + "px" : v;
  if (target && name) {
    $(target).css(name, vv);
  }
  if (targetWrap === "#toHtmlWrap") {
    if (name === "backgroundColor") {
      $(target).attr("bgcolor", v);
    }
    if (name === "width") {
      $(target).attr("width", v);
    }
    if (name === "textAlign") {
      $(target).attr("align", v);
    }
  }
}

function formatState(state) {
  if (!state.id) {
    return state.text;
  }
  return $(
    `<span class="flex align-items-center"><img src="./static/img/${state.element.value}.png" class='me-2 select2-img' />${state.text}</span>`
  );
}
function settingTemplateSet() {
  var t = $(targetWrap).find(".templateSelect").val();

  if (targetWrap === "#toHtmlWrap") {
    $("#preview-html-container").html(settingHtml[t]);
  } else {
    $("#preview-wrap").removeAttr("style").html(settingHtml[t]);
  }

  $(targetWrap).find(".preview-content").html(editorHtml);

  var html = settings[t]
    .map((item) => {
      if (item === "|") {
        return `<div class="setting-item" style="width:100%;height:8px;margin:0;"></div>`;
      }

      var st = settingItems[item];

      return `<div class="ms-3 setting-item" data-setting="${item}">${st}</div>`;
    })
    .join("");
  $(targetWrap).find(".setting-wrap").html(html);

  settingPreviewStyle();
}

function downloadHtml (content, filename) {
  let linkNode = document.createElement('a');
  linkNode.download = filename;
  linkNode.style.display = 'none';
  let blob = new Blob([content]);
  linkNode.href = URL.createObjectURL(blob);
  document.body.appendChild(linkNode);
  linkNode.click();
  document.body.removeChild(linkNode);
};

function settingOutlookHtml() {
  if(targetWrap === '#toHtmlWrap'){
    $("#toHtmlWrap .preview-content").find('p').css({'marginTop':0,'marginBottom':'14px'})
  }
}