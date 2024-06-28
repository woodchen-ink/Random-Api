# Random-Api 随机文件API

## 图片接口

| 种类     | 请求地址   | 
| ---------- | ---------------- | 
| 所有     | [https://random-api.czl.net/pic/all](https://random-api.czl.net/pic/all) |
| CZL网站背景 | [https://random-api.czl.net/pic/czlwb](https://random-api.czl.net/pic/czlwb) |
| 真人美女 | [https://random-api.czl.net/pic/truegirl](https://random-api.czl.net/pic/truegirl) |
| 二次元全部 | [https://random-api.czl.net/pic/ecy](https://random-api.czl.net/pic/ecy) |
| 二次元1 | [https://random-api.czl.net/pic/ecy1](https://random-api.czl.net/pic/ecy1) |
| 二次元2 | [https://random-api.czl.net/pic/ecy2](https://random-api.czl.net/pic/ecy2) |
| 风景横图 | [https://random-api.czl.net/pic/fjht](https://random-api.czl.net/pic/fjht) |

--- 

## 视频接口
| 种类     | 请求地址   | 
| ---------- | ---------------- | 
| 所有 | [https://random-api.czl.net/video/all](https://random-api.czl.net/video/all) |

## 功能测试(勿用)

| 种类     | 请求地址   | 
| ---------- | ---------------- | 
| 格式测试     | [https://random-api.czl.net/pic/test](https://random-api.czl.net/pic/test) |


## 部署、更新和原理

请见我的博客：[https://woodchen.ink/archives/1705367469203](https://woodchen.ink/archives/1705367469203)

**2024.06.26更新**

1. oracle存储桶的图片全部套上优选cloudfront CDN, 加快国内访问;
2. 函数部署到Edgeone, 访问速度更快;
3. 静态文件放到"上海阿里小机+ Edgeone缓存",因为小机器带宽比较低, 高并发太慢,还容易失败, 套了CDN, 直接缓存个一年嘿嘿;

**永久可用**
                
