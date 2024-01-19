# Random-Api 随机文件API

## 接口

| 类型  | 种类     | 请求地址   | 
| ---- | ---------- | ---------------- | 
| 图片 | 所有     | [https://random-api.woodchen.ink/pic/all](https://random-api.woodchen.ink/pic/all) |
| 图片 | 白底   | [https://random-api.woodchen.ink/pic/whitebackground](https://random-api.woodchen.ink/pic/whitebackground) |
| 图片 | 风景横图 | [https://random-api.woodchen.ink/pic/fjht](https://random-api.woodchen.ink/pic/fjht) |
| 视频 | 所有 | [https://random-api.woodchen.ink/video/all](https://random-api.woodchen.ink/video/all) |


## 原理

> github地址： [https://github.com/woodchen-ink/Random-Api](https://github.com/woodchen-ink/Random-Api)  
> 我的博客说明：[https://woodchen.ink/archives/1705367469203](https://woodchen.ink/archives/1705367469203)

使用cloudflare worker配合github，实现获取path与csv_path关系，从 `url.csv` 文件中给出的链接来实现一个随机文件

不仅可以放图片，还能放文本文件，视频，等等

## 自行部署
                
1. cloudflare 新建一个worker，把 worker.js文件的代码粘贴进去，保存（可以修改为自己的链接）
2. 访问即可

## 更新说明

1. 只需要git修改github上文件即可，不需要修改worker.js文件
2. 有时候会有点缓存，生效要等一会儿


## 感谢
                
大部分图片来自网络分享的API
                
以下不分先后：
                
* https://t.mwm.moe/
                


## 赞赏

如果对这个项目对你有帮助，欢迎打赏，支持微信和支付宝，请留言和备注项目，我会在我的博客上写出，感谢。

### 微信

![1705312445316.png](https://cdn-img-r2.czl.net/2024/01/15/65a501199193b.png)

### 支付宝

![1705312348956.png](https://cdn-img-r2.czl.net/2024/01/15/65a50089b4b92.png)
