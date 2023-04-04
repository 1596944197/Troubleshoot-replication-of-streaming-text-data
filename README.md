---
theme: mk-cute
highlight: a11y-light
---

## 背景

---

**这个问题源于在访问 gpt 官网时，发现当 ai 还在输出文本时，选中文本会出现错误**

![动画.gif](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c2128d872ffd450984cd315a2c828bc8~tplv-k3u1fbpfcp-watermark.image?)

[示例源码](https://github.com/1596944197/Troubleshoot-replication-of-streaming-text-data)

## 现象

---

**除非元素已完全加载完并且在一次事件循环内对该元素无其他操作，否则执行选中文本操作会把左边的内容也选择上**

## 原因猜测

### 猜测 1：因元素重新赋值会导致浏览器执行重排操作，而默认的选择文本行为会在重排后出现异常

#### 开始模拟

##### 服务端代码

```
import { createReadStream } from "node:fs";
import { createServer } from "node:http";

const server = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // 使接口以流的形式返还到前端
  createReadStream('./t.txt', { encoding: 'utf8', highWaterMark: 1 * 100 }).pipe(res);
});

server.listen(3002, () => console.log('is ok'));
直接使用nodemon index.js启动代码
```

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/094ca11d45af4fe08bc072576cc9cdaf~tplv-k3u1fbpfcp-watermark.image?)

##### 前端代码

```
// 前端先采用官网fetch返还流的代码改一下做尝试
// [ReadableStream - Web API 接口参考 | MDN (mozilla.org)](https://developer.mozilla.org/zh-CN/docs/Web/API/ReadableStream)

<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <button onclick="fff()">点击触发</button>
  <h3>测试：</h3>
</body>
<script>
  const h2 = document.querySelector('h3')
  const fff = () => {
    const textDecoder = new TextDecoder();
    fetch('http://127.0.0.1:3002').then(res => {
      const reader = res.body.getReader()
      new ReadableStream({
        start(controller) {
          async function push() {
            const { done, value } = await reader.read()
            if (done) {
              controller.close();
              return;
            }

            controller.enqueue(value);
            // 模拟操作
            h2.innerHTML += textDecoder.decode(value)
            push();
          }
          push();
        }
      });
    })
  }
</script>

</html>
```

设置节流模式,防止传输过快无法准确复现
![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c525991a7b7a44148b431e5cae186860~tplv-k3u1fbpfcp-watermark.image?)

##### demo 复现效果

![动画2.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5de666afa70e4ac3878bc3a870d9942e~tplv-k3u1fbpfcp-watermark.image?)

这里可以看到已经最简单的复现出来(暂不考虑 markdown)

#### 解决思路

##### 尝试使用 dom 原生 api 来替代 innerhtml +=操作

```
            // h3.innerHTML += textDecoder.decode(value)
            // 模拟操作->替换
            const text = document.createTextNode(textDecoder.decode(value))
            h3.appendChild(text)
```

![动画2.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bacf15bed9674ad8af6f8a17168de63b~tplv-k3u1fbpfcp-watermark.image?)

可以看到这就是我们想要的效果，开始分析原理

# 未完待续......
