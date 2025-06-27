#include <napi.h>
#include <windows.h>
#include <vector>
#include <string>

// 使用 UTF-8 编码保存文件，避免警告 C4819
#pragma execution_character_set("utf-8")

struct WindowInfo {
    HWND hwnd;
    DWORD pid;
    std::wstring className;
    std::wstring title;
    bool isVisible;
    LONG style;
    LONG exStyle;
};

struct FindMain {
    DWORD pid;
    WindowInfo info;
    FindMain(DWORD p) : pid(p) {}
};

// 定义 FindData 结构体
struct FindData {
    HWND ph;
    std::vector<HWND> topHwnds; // 存储所有顶层子窗口句柄
    FindData(HWND p) : ph(p) {} // 父类句柄
   // FindData(POINT p,DWORD id) : pt(p), pid(id) {} // 初始化 pid 为 0
};
std::string WStringToUTF8(const std::wstring& wstr) {
    std::string result;
    if (!wstr.empty()) {
        int size = WideCharToMultiByte(CP_UTF8, 0, wstr.c_str(), -1, nullptr, 0, nullptr, nullptr);
        if (size > 0) {
            result.resize(size - 1); // -1 去掉末尾的 '\0'
            WideCharToMultiByte(CP_UTF8, 0, wstr.c_str(), -1, &result[0], size, nullptr, nullptr);
        }
    }
    return result;
}

// 枚举窗口回调（筛选 Chrome 主窗口）
BOOL CALLBACK EnumWindowsMainProc(HWND hwnd, LPARAM lParam) {

    FindMain* data = reinterpret_cast<FindMain*>(lParam);

    if (!IsWindowVisible(hwnd)) return TRUE; // 跳过不可见窗口

    DWORD pid;
    GetWindowThreadProcessId(hwnd, &pid);
    if(pid!=data->pid){
      return TRUE;
    }


    WCHAR className[256];
    WCHAR title[512];
    GetClassNameW(hwnd, className, 256);
    GetWindowTextW(hwnd, title, 512);
    // 筛选 Chrome 主窗口
    if (wcsstr(className, L"Chrome_WidgetWin_1") && GetParent(hwnd) == NULL) {
        data->info= {
            hwnd,
            pid,
            std::wstring(className),
            std::wstring(title),
            true
        };
        return FALSE;
    }
    return TRUE;
}


Napi::Value EnumMainWindows(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
     if (info.Length() < 1 || !info[0].IsNumber() ) {
               Napi::TypeError::New(env, "pid coordinates expected").ThrowAsJavaScriptException();
               return env.Undefined();
      }
    // 从 Napi::Number 获取值（确保为 64 位整数）
    int64_t pidValue = info[0].As<Napi::Number>().Int64Value();
    // 安全转换为 DWORD
    DWORD pid = static_cast<DWORD>(pidValue);
    FindMain data(pid);
    EnumWindows(EnumWindowsMainProc, reinterpret_cast<LPARAM>(&data));

   Napi::Object obj = Napi::Object::New(env);
   obj.Set("hwnd", Napi::Number::New(env, reinterpret_cast<int64_t>(data.info.hwnd)));
   obj.Set("pid", Napi::Number::New(env, data.info.pid));

   std::string classNameUtf8 = WStringToUTF8(data.info.className);
   obj.Set("className", Napi::String::New(env, classNameUtf8));

   std::string titleUtf8 = WStringToUTF8(data.info.title);
   obj.Set("title", Napi::String::New(env, titleUtf8));

   obj.Set("isVisible", Napi::Boolean::New(env, data.info.isVisible));

    return obj;
}


// 枚举子窗口回调
BOOL CALLBACK EnumChildWindowsProc(HWND hwnd, LPARAM lParam) {
    FindData* data = reinterpret_cast<FindData*>(lParam);

    if (!IsWindowVisible(hwnd)) return TRUE; // 跳过不可见窗口
    // 获取父窗口的句柄
    //GetParent 返回与指定窗口直接关联的父窗口句柄。父窗口是创建子窗口时指定的窗口，通常是包含子窗口的顶层窗口或更高层次的容器窗口。
    HWND parentHwnd = GetParent(hwnd);
    if(parentHwnd!=data->ph){
       return TRUE;  // 仅跳过非 Chrome 相关窗口
    }
     data->topHwnds.push_back(hwnd);
    return TRUE; // 继续枚举所有子窗口
}
// 辅助函数：根据绝对坐标 主窗口句柄和点查找顶层子窗口句柄
Napi::Value FindChildWindowFromPoint(const Napi::CallbackInfo& info) {
       Napi::Env env = info.Env();
       if (info.Length() < 4 || !info[0].IsNumber() || !info[1].IsNumber() || !info[2].IsNumber() || !info[3].IsNumber()) {
           Napi::TypeError::New(env, "HWND, x, y,dip  coordinates expected").ThrowAsJavaScriptException();
           return env.Undefined();
       }

       HWND parentHwnd = reinterpret_cast<HWND>(info[0].As<Napi::Number>().Int64Value());

       double scale = info[1].As<Napi::Number>().DoubleValue();
       RECT parentRect;
       if (!::GetWindowRect(parentHwnd, &parentRect)) {
           Napi::TypeError::New(env, "Failed to get window parentRect").ThrowAsJavaScriptException();
           return Napi::Object::New(env);
       }else{
           parentRect.left = static_cast<int>(parentRect.left / scale);
           parentRect.top = static_cast<int>(parentRect.top / scale);
           parentRect.right = static_cast<int>(parentRect.right / scale);
           parentRect.bottom = static_cast<int>(parentRect.bottom / scale);
       }

       int x = info[1].As<Napi::Number>().Int32Value();
       int y = info[2].As<Napi::Number>().Int32Value();
       x=static_cast<int>(x/scale);
       y=static_cast<int>(y/scale);

       FindData data(parentHwnd);

       // 枚举所有顶层窗口
       EnumWindows(EnumChildWindowsProc, reinterpret_cast<LPARAM>(&data));

       HWND bestHwnd = NULL;
       int lastMinDistance = INT_MAX; // 最小差异，用于最优匹配

       // 查找最优匹配
       for (const HWND hwnd : data.topHwnds) {
           RECT rect;
           if (GetWindowRect(hwnd, &rect)) {
                rect.left = static_cast<int>(rect.left / scale);
                rect.top = static_cast<int>(rect.top / scale);
                rect.right = static_cast<int>(rect.right / scale);
                rect.bottom = static_cast<int>(rect.bottom / scale);

               int centerX = rect.left+parentRect.left;
               int centerY = rect.top+parentRect.top;
                if(x>=centerX&&y>=centerY){
                     int distance =std::abs(x-centerX)+std::abs(y-centerY);
                       // 计算到窗口中心的距离，作为次优匹配
                       if (distance < lastMinDistance) {
                           lastMinDistance = distance;
                           bestHwnd = hwnd;
                       }
                  }

           }
       }

    HWND findHwnd=NULL;
    //返回子窗口信息
    if (bestHwnd) {
         findHwnd=bestHwnd;
    }else{
         findHwnd=parentHwnd;
    }
    WCHAR findClassName[256];
    WCHAR findTitle[512];
    GetClassNameW(findHwnd, findClassName, 256);
    GetWindowTextW(findHwnd, findTitle, 512);

    Napi::Object obj = Napi::Object::New(env);

    obj.Set("hwnd", Napi::Number::New(env, reinterpret_cast<int64_t>(findHwnd)));

    std::string classNameUtf8 = WStringToUTF8(findClassName);
    obj.Set("className", Napi::String::New(env, classNameUtf8));

    std::string titleUtf8 = WStringToUTF8(findTitle);
    obj.Set("title", Napi::String::New(env, titleUtf8));

    HWND  ph=GetParent(findHwnd);
    obj.Set("parentHwnd", Napi::Number::New(env, reinterpret_cast<int64_t>(ph)));

    LONG exStyle = GetWindowLongW(findHwnd, GWL_EXSTYLE);
    LONG style = GetWindowLongW(findHwnd, GWL_STYLE);

    obj.Set("style", Napi::Number::New(env, style));
    obj.Set("exStyle", Napi::Number::New(env, exStyle));

    RECT findRect;
    if (GetWindowRect(findHwnd, &findRect)){
        obj.Set("left", Napi::Number::New(env, findRect.left));
        obj.Set("top", Napi::Number::New(env, findRect.top));
        obj.Set("right", Napi::Number::New(env, findRect.right));
        obj.Set("bottom", Napi::Number::New(env, findRect.bottom));
    }
    return obj;
}


// 辅助函数：根据相对坐标和点查找最优匹配的顶层子窗口句柄
Napi::Value FindTargetWindow(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 4 || !info[0].IsNumber() || !info[1].IsNumber() || !info[2].IsNumber()|| !info[3].IsNumber()) {
        Napi::TypeError::New(env, "HWND, x, y dip  coordinates expected").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    HWND parentHwnd = reinterpret_cast<HWND>(info[0].As<Napi::Number>().Int64Value());
    if (!IsWindowVisible(parentHwnd)) {
         Napi::TypeError::New(env, "Failed to parentHwnd Window not is Visible").ThrowAsJavaScriptException();
         return Napi::Object::New(env);
    }

    double scale = info[1].As<Napi::Number>().DoubleValue();
    int x = info[1].As<Napi::Number>().Int32Value();
    int y = info[2].As<Napi::Number>().Int32Value();
    x=static_cast<int>(x/scale);
    y=static_cast<int>(y/scale);
    RECT parentRect;
    if (!::GetWindowRect(parentHwnd, &parentRect)) {
        Napi::TypeError::New(env, "Failed to get window parentRect").ThrowAsJavaScriptException();
        return Napi::Object::New(env);
    }

    parentRect.left = static_cast<int>(parentRect.left / scale);
    parentRect.top = static_cast<int>(parentRect.top / scale);
    parentRect.right = static_cast<int>(parentRect.right / scale);
    parentRect.bottom = static_cast<int>(parentRect.bottom / scale);

    HWND bestHwnd = NULL;
    double minDiff = INT_MAX; // 最小差异，用于最优匹配

    FindData data(parentHwnd);

    // 枚举所有顶层窗口
    EnumWindows(EnumChildWindowsProc, reinterpret_cast<LPARAM>(&data));

    // 查找最优匹配
    for (const HWND hwnd : data.topHwnds) {

        RECT rect;
        if (GetWindowRect(hwnd, &rect)) {
          rect.left = static_cast<int>(rect.left / scale);
          rect.top = static_cast<int>(rect.top / scale);
          rect.right = static_cast<int>(rect.right / scale);
          rect.bottom = static_cast<int>(rect.bottom / scale);
          int centerX = rect.left -parentRect.left;
          int centerY = rect.top -parentRect.top;
          int diff= std::abs(x-centerX) + std::abs(y - centerY);
          if (diff < minDiff) {
             minDiff = diff;
             bestHwnd = hwnd;
          }
       }

    }
     HWND findHwnd=NULL;
    //返回子窗口信息
    if (bestHwnd) {
         findHwnd=bestHwnd;
    }else{
         findHwnd=parentHwnd;
    }


    Napi::Object obj = Napi::Object::New(env);
    obj.Set("hwnd", Napi::Number::New(env, reinterpret_cast<int64_t>(findHwnd)));


    WCHAR findClassName[256];
    WCHAR findTitle[512];
    GetClassNameW(findHwnd, findClassName, 256);
    GetWindowTextW(findHwnd, findTitle, 512);
    std::string classNameUtf8 = WStringToUTF8(findClassName);
    obj.Set("className", Napi::String::New(env, classNameUtf8));

    std::string titleUtf8 = WStringToUTF8(findTitle);
    obj.Set("title", Napi::String::New(env, titleUtf8));

    HWND  ph=GetParent(findHwnd);
    obj.Set("parentHwnd", Napi::Number::New(env, reinterpret_cast<int64_t>(ph)));

    LONG exStyle = GetWindowLongW(findHwnd, GWL_EXSTYLE);
    LONG style = GetWindowLongW(findHwnd, GWL_STYLE);
    obj.Set("style", Napi::Number::New(env, style));
    obj.Set("exStyle", Napi::Number::New(env, exStyle));
    RECT findRect;
    if (GetWindowRect(findHwnd, &findRect)){
        obj.Set("left", Napi::Number::New(env, findRect.left));
        obj.Set("top", Napi::Number::New(env, findRect.top));
        obj.Set("right", Napi::Number::New(env, findRect.right));
        obj.Set("bottom", Napi::Number::New(env, findRect.bottom));
    }
    return obj;
}



Napi::Value FindTargetResult(const Napi::CallbackInfo& info) {
     Napi::Env env = info.Env();
     HWND hwnd = reinterpret_cast<HWND>(info[0].As<Napi::Number>().Int64Value());

      Napi::Object obj = Napi::Object::New(env);
      obj.Set("hwnd", Napi::Number::New(env, reinterpret_cast<int64_t>(hwnd)));

      WCHAR findClassName[256];
      WCHAR findTitle[512];
      GetClassNameW(hwnd, findClassName, 256);
      GetWindowTextW(hwnd, findTitle, 512);
      std::string classNameUtf8 = WStringToUTF8(findClassName);
      obj.Set("className", Napi::String::New(env, classNameUtf8));

      std::string titleUtf8 = WStringToUTF8(findTitle);
      obj.Set("title", Napi::String::New(env, titleUtf8));

      HWND  ph=GetParent(hwnd);
      obj.Set("parentHwnd", Napi::Number::New(env, reinterpret_cast<int64_t>(ph)));

      LONG exStyle = GetWindowLongW(hwnd, GWL_EXSTYLE);
      LONG style = GetWindowLongW(hwnd, GWL_STYLE);
      obj.Set("style", Napi::Number::New(env, style));
      obj.Set("exStyle", Napi::Number::New(env, exStyle));
      RECT rect;
      if (GetWindowRect(hwnd, &rect)){
          obj.Set("left", Napi::Number::New(env, rect.left));
          obj.Set("top", Napi::Number::New(env, rect.top));
          obj.Set("right", Napi::Number::New(env, rect.right));
          obj.Set("bottom", Napi::Number::New(env, rect.bottom));
      }
      return obj;
}


Napi::Value GetWindowDpi(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "HWND expected").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    HWND hwnd = reinterpret_cast<HWND>(info[0].As<Napi::Number>().Int64Value());
    UINT dpi = GetDpiForWindow(hwnd);
    return Napi::Number::New(env, dpi);
}

Napi::Value GetForegroundWindow(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    HWND hwnd = ::GetForegroundWindow();
    return Napi::Number::New(env, reinterpret_cast<int64_t>(hwnd));
}

Napi::Value GetForegroundInfo(const Napi::CallbackInfo& info) {
     Napi::Env env = info.Env();
     HWND hwnd = ::GetForegroundWindow();

     WCHAR className[256];
     WCHAR title[512];
     GetClassNameW(hwnd, className, 256);
     GetWindowTextW(hwnd, title, 512);

     Napi::Object obj = Napi::Object::New(env);

     obj.Set("hwnd", Napi::Number::New(env, reinterpret_cast<int64_t>(hwnd)));

     std::string classNameUtf8 = WStringToUTF8(className);
     obj.Set("className", Napi::String::New(env, classNameUtf8));

     std::string titleUtf8 = WStringToUTF8(title);
     obj.Set("title", Napi::String::New(env, titleUtf8));

     HWND  ph=GetParent(hwnd);
     obj.Set("parentHwnd", Napi::Number::New(env, reinterpret_cast<int64_t>(ph)));


      RECT rect;
     if (GetWindowRect(hwnd, &rect)){
         obj.Set("left", Napi::Number::New(env, rect.left));
         obj.Set("top", Napi::Number::New(env, rect.top));
         obj.Set("right", Napi::Number::New(env, rect.right));
         obj.Set("bottom", Napi::Number::New(env, rect.bottom));
     }
     return obj;
}

Napi::Value GetHwndInfo(const Napi::CallbackInfo& info) {
     Napi::Env env = info.Env();
     HWND hwnd = reinterpret_cast<HWND>(info[0].As<Napi::Number>().Int64Value());

     HWND  parentHwnd=GetParent(hwnd);
     DWORD pid;
     GetWindowThreadProcessId(hwnd, &pid);

      WCHAR className[256];
      WCHAR title[512];
      GetClassNameW(hwnd, className, 256);
      GetWindowTextW(hwnd, title, 512);

      bool isVisible = IsWindowVisible(hwnd) != 0;

      Napi::Object obj = Napi::Object::New(env);
      obj.Set("pid", Napi::Number::New(env, pid));

      std::string classNameUtf8 = WStringToUTF8(className);
      obj.Set("className", Napi::String::New(env, classNameUtf8));

      std::string titleUtf8 = WStringToUTF8(title);
      obj.Set("title", Napi::String::New(env, titleUtf8));

      obj.Set("isVisible", Napi::Boolean::New(env, isVisible));

      LONG exStyle = GetWindowLongW(hwnd, GWL_EXSTYLE);
      LONG style = GetWindowLongW(hwnd, GWL_STYLE);
      obj.Set("style", Napi::Number::New(env, style));
      obj.Set("exStyle", Napi::Number::New(env, exStyle));

      obj.Set("parentHwnd", Napi::Number::New(env, reinterpret_cast<int64_t>(parentHwnd)));

       RECT rect;
      if (GetWindowRect(hwnd, &rect)){
          obj.Set("left", Napi::Number::New(env, rect.left));
          obj.Set("top", Napi::Number::New(env, rect.top));
          obj.Set("right", Napi::Number::New(env, rect.right));
          obj.Set("bottom", Napi::Number::New(env, rect.bottom));
      }
      return obj;
}


Napi::Value GetWindowRect(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    HWND hwnd = reinterpret_cast<HWND>(info[0].As<Napi::Number>().Int64Value());
    RECT rect;
    if (!::GetWindowRect(hwnd, &rect)) {
        Napi::TypeError::New(env, "Failed to get window rect").ThrowAsJavaScriptException();
        return Napi::Object::New(env);
    }
    Napi::Object result = Napi::Object::New(env);
    result.Set("left", Napi::Number::New(env, rect.left));
    result.Set("top", Napi::Number::New(env, rect.top));
    result.Set("right", Napi::Number::New(env, rect.right));
    result.Set("bottom", Napi::Number::New(env, rect.bottom));
    return result;
}

Napi::Value PostMessage(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    HWND hwnd = reinterpret_cast<HWND>(info[0].As<Napi::Number>().Int64Value());
    UINT msg = info[1].As<Napi::Number>().Uint32Value();
    WPARAM wParam = info[2].As<Napi::Number>().Int64Value();
    LPARAM lParam = info[3].As<Napi::Number>().Int64Value();
    return Napi::Boolean::New(env, ::PostMessageW(hwnd, msg, wParam, lParam) != 0);
}

Napi::Value GetSystemMetrics(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    int nIndex = info[0].As<Napi::Number>().Int32Value();
    return Napi::Number::New(env, ::GetSystemMetrics(nIndex));
}

Napi::Value ShowWindow(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    HWND hwnd = reinterpret_cast<HWND>(info[0].As<Napi::Number>().Int64Value());
    int nCmdShow = info[1].As<Napi::Number>().Int32Value();
    return Napi::Boolean::New(env, ::ShowWindow(hwnd, nCmdShow) != 0);
}

Napi::Value MoveWindow(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    HWND hwnd = reinterpret_cast<HWND>(info[0].As<Napi::Number>().Int64Value());
    int x = info[1].As<Napi::Number>().Int32Value();
    int y = info[2].As<Napi::Number>().Int32Value();
    int w = info[3].As<Napi::Number>().Int32Value();
    int h = info[4].As<Napi::Number>().Int32Value();
    bool repaint = info[5].As<Napi::Boolean>().Value();
    return Napi::Boolean::New(env, ::MoveWindow(hwnd, x, y, w, h, repaint) != 0);
}
// 新增方法：允许指定进程设置前台窗口
Napi::Value AllowSetForegroundWindow(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "PID expected").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    DWORD pid = static_cast<DWORD>(info[0].As<Napi::Number>().Int32Value());
    BOOL success = ::AllowSetForegroundWindow(pid);
    return Napi::Boolean::New(env, success != 0);
}
// 新增方法：设置窗口为前台窗口
Napi::Value SetForegroundWindow(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "HWND expected").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    HWND hwnd = reinterpret_cast<HWND>(info[0].As<Napi::Number>().Int64Value());
    BOOL success = ::SetForegroundWindow(hwnd);
    return Napi::Boolean::New(env, success != 0);
}

Napi::Value PostKeyMessage(const Napi::CallbackInfo& info) {
   Napi::Env env = info.Env();
   if (info.Length() < 5 || !info[0].IsNumber() || !info[1].IsNumber() || !info[2].IsNumber() || !info[3].IsNumber() || !info[4].IsBoolean()) {
       Napi::TypeError::New(env, "HWND, message, wParam, lParam, and shiftKey expected").ThrowAsJavaScriptException();
       return env.Undefined();
   }

   HWND hwnd = reinterpret_cast<HWND>(info[0].As<Napi::Number>().Int64Value());
   UINT msg = info[1].As<Napi::Number>().Uint32Value();
   WPARAM wParam = info[2].As<Napi::Number>().Int64Value();
   LPARAM lParam = info[3].As<Napi::Number>().Int64Value();
   bool isShift = info[4].As<Napi::Boolean>().Value(); // 从 JavaScript 接收 shiftKey 状态
    // 确保窗口为前台或有焦点
    if (!IsWindowVisible(hwnd) || !IsWindowEnabled(hwnd)) {
        return Napi::Boolean::New(env, false);
    }

    // 检查 Caps Lock 状态
    bool isCapsLock = (GetKeyState(VK_CAPITAL) & 0x0001) != 0;
    // 优化 WM_CHAR 处理，确保 Unicode 字符正确，并根据 Caps Lock 和 Shift 调整大小写
    if (msg == WM_CHAR) {
        WCHAR charValue = static_cast<WCHAR>(wParam);
        if (charValue >= 0 && charValue <= 0xFFFF) {
            // 如果是字母（A-Z 或 a-z），根据 Caps Lock 和 Shift 调整
            if ((charValue >= 'A' && charValue <= 'Z') || (charValue >= 'a' && charValue <= 'z')) {
                bool shouldBeUpper = (isCapsLock ^ isShift); // Caps Lock 和 Shift 状态异或，决定是否大写
                if (shouldBeUpper && charValue >= 'a' && charValue <= 'z') {
                    charValue = towupper(charValue); // 转换为大写
                } else if (!shouldBeUpper && charValue >= 'A' && charValue <= 'Z') {
                    charValue = towlower(charValue); // 转换为小写
                }
                wParam = static_cast<WPARAM>(charValue);
            }
            // 设置 lParam 的时间戳和重复计数（模拟真实键盘输入）
            lParam = MAKELPARAM(1, GetMessageTime()); // 重复计数为 1，时间戳为当前消息时间
        } else {
            return Napi::Boolean::New(env, false);
        }
    }
    // 优化功能键的处理（WM_KEYDOWN/WM_KEYUP）
    if (msg == WM_KEYDOWN || msg == WM_KEYUP) {
        // 获取虚拟键码的扫描码
        UINT scanCode = MapVirtualKeyW(wParam, MAPVK_VK_TO_VSC);
        if (scanCode == 0) {
            return Napi::Boolean::New(env, false);
        }

        // 设置 lParam 的标志位和扫描码
        DWORD flags = (msg == WM_KEYUP) ? 0xC0000000 : 0; // 按下/释放标志
        lParam = MAKELPARAM(scanCode, flags | (GetKeyState(VK_SHIFT) & 0x8000) | (GetKeyState(VK_CONTROL) & 0x8000) | (GetKeyState(VK_MENU) & 0x8000));

        // 为特定功能键发送额外的消息（如 WM_CHAR）以模拟输入
        switch (wParam) {
            case VK_RETURN: // Enter
                ::PostMessageW(hwnd, WM_CHAR, 13, MAKELPARAM(1, GetMessageTime()));
                break;
            case VK_BACK: // Backspace
                ::PostMessageW(hwnd, WM_CHAR, 8, MAKELPARAM(1, GetMessageTime()));
                break;
            case VK_TAB: // Tab
                ::PostMessageW(hwnd, WM_CHAR, 9, MAKELPARAM(1, GetMessageTime()));
                break;
        }
    }


    // 发送消息并返回结果
    BOOL success = ::PostMessageW(hwnd, msg, wParam, lParam);
    return Napi::Boolean::New(env, success != 0);
}

// 初始化模块
Napi::Object Init(Napi::Env env, Napi::Object exports) {
   //枚举主窗口
     exports.Set("enumMainWindows", Napi::Function::New<EnumMainWindows>(env));
    // 辅助函数：根据窗口句柄查找信息
    exports.Set("getHwndInfo", Napi::Function::New<GetHwndInfo>(env));
    // 辅助函数：根据主窗口句柄和点查找子窗口句柄
    exports.Set("findChildWindowFromPoint", Napi::Function::New<FindChildWindowFromPoint>(env));
     //获取焦点窗口
    exports.Set("getForegroundWindow", Napi::Function::New<GetForegroundWindow>(env));
     //获取窗口大小
    exports.Set("getWindowRect", Napi::Function::New<GetWindowRect>(env));
      //发送异步消息
    exports.Set("postMessage", Napi::Function::New<PostMessage>(env));
     //获取屏幕大小
    exports.Set("getSystemMetrics", Napi::Function::New<GetSystemMetrics>(env));
     //获取显示窗口
    exports.Set("showWindow", Napi::Function::New<ShowWindow>(env));
     //移动窗口
    exports.Set("moveWindow", Napi::Function::New<MoveWindow>(env));
    // 获取窗口 DPI
    exports.Set("getWindowDpi", Napi::Function::New<GetWindowDpi>(env));
    //设置窗口为前台窗口
    exports.Set("setForegroundWindow", Napi::Function::New<SetForegroundWindow>(env));
    // 允许指定进程设置前台窗口
    exports.Set("allowSetForegroundWindow", Napi::Function::New<AllowSetForegroundWindow>(env));
    //根据相对坐标查找从属窗口制件
    exports.Set("findTargetWindow", Napi::Function::New<FindTargetWindow>(env));
    //根据句柄获取详细信息
    exports.Set("findTargetResult", Napi::Function::New<FindTargetResult>(env));
    //获取焦点窗口详细信息
    exports.Set("getForegroundInfo", Napi::Function::New<GetForegroundInfo>(env));
    //发送键盘信息
    exports.Set("postKeyMessage", Napi::Function::New<PostKeyMessage>(env));
    return exports;
}

NODE_API_MODULE(window_api, Init)
