{
  "targets": [
    {
      "target_name": "window_api",
      "sources": ["../window-api/window_api.cc"],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "<!@(node -p \"(require('path').join(require.resolve('electron/package.json'), '../headers'))\")"
      ],
      "dependencies": ["<!(node -p \"require('node-addon-api').gyp\")"],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
      "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS"],
      "conditions": [
         ["target_arch=='x64'", {
           "defines": ["NODE_GYP_MODULE_NAME=window_api_x64"]
         }]
       ],
    }
  ]
}
