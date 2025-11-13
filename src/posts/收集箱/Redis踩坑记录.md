---
title: Redis踩坑记录
icon: cil:dog
date: 2025-11-13
order: 1
category:
  - 收集箱
tags:
  - redis
star: true
sticky: false
---

# Redis 踩坑记录

## 1. redisson客户端超时问题

**具体错误信息：**

```sh
Caused by: org.redisson.client.RedisTimeoutException: Command still hasn't been written into connection! Check connection with Redis node: r-2zegymkgsoz076kik7.redis.rds.aliyuncs.com/192.168.108.252:6379 for TCP packet drops. Try to increase nettyThreads setting.  Node source: NodeSource [slot=0, addr=null, redisClient=null, redirect=null, entry=null], connection: RedisConnection@1537994324 [redisClient=[addr=redis://r-2zegymkgsoz076kik7.redis.rds.aliyuncs.com:6379], channel=[id: 0xce0299d3, L:/10.0.0.17:43610 - R:r-2zegymkgsoz076kik7.redis.rds.aliyuncs.com/192.168.108.252:6379], currentCommand=CommandData [promise=java.util.concurrent.CompletableFuture@4e47fc5c[Completed exceptionally], command=(LRANGE), params=[[73, 65, 77, 58, 108, 111, 103, 105, 110, 95, ...], 0, -1], codec=org.redisson.client.codec.ByteArrayCodec], usage=1], command: (GET), params: [[49, 50, 58, 55, 48, 50, 50, 50, 53, 102, ...]] after 3 retry attempts
```

> [!WARNING]
>
> 上如错误日志中，✨✨✨最最最重要的错误问题 `command=(LRANGE), params=[[73, 65, 77, 58, 108, 111, 103, 105, 110, 95, ...], 0, -1]`，也就是对于 redis list 结构数据，使用了 `LRANGE [key...] 0 -1` 查询了全量的数据，从而造成了慢查询，导致服务资源被占用，Netty 连接耗尽，进一步导致了客户端超时现象的产生，使其他的命令发不出去。

**错误信息分析：**

- 核心问题：Redisson 客户端与阿里云 Redis 实例通信时发生了超时
- 错误关键点分析：
  - `Command still hasn't been written into connection!` ：说明命令卡在客户端未写入网络连接。不是 Redis 响应慢，而是命令连发送都没有发出去
- 什么情况下会造成如上的错误呢？
  - Netty 线程阻塞
  - 系统负载高
  - 网络问题
  - 连接池耗尽
- `Try to increase nettyThreads setting` ：表示 Redisson 提示你增加 `nettyThreads` ，说明可能是 Netty 工作线程不够用了

- `command=(LRANGE), params=[[73, 65, 77, 58, 108, 111, 103, 105, 110, 95, ...], 0, -1]`：表示在使用 redis 客户端查询时，使用了 `LRANGE [key...] 0 -1` 来全量读取整个列表。如果这里 list 很大（几万条以上），就会导致 Redis 响应慢、客户端发送命令时被阻塞（因为连接被占用），从而导致其他命令排队，最终造成超时

**解决方案：**

- 增加 `nettyThreads`

  - Redisson 使用 Netty 做网络通信，默认 `nettyThreads = 32`。如果遇到高并发或处理慢时，线程可能被占满。

  - 调整方式：在 Redisson 配置中增加线程数

    > 调整建议：nettyThreads = min(64, 2 * CPU 核数)

    ```java
    Config config = new Config();
    config.setNettyThreads(64);  // 建议设置为 64 或更高，根据服务器的 CPU 核数调整
    ```

- 检查连接池配置

  - 如果连接池太小，也会导致命令排队等待连接

  - 调整方式：

    ```java
    config.useSingleServer()
        .setConnectionPoolSize(64)    // 默认 64，可以增大到 128
        .setConnectionMinimumIdleSize(24)  // 保持一定空闲连接
        .setIdleConnectionTimeout(30000)  // 空闲连接超时（ms）
        .setConnectTimeout(20000)    // 连接超时
        .setTimeout(20000)      // 命令超时时间，避免无限等待
        .setRetryAttempts(3)     // 重试次数
        .setRetryInterval(1000)     // 重试间隔
        .setPingConnectionInterval(30000)  // 保持连接活跃，防止中间设备断连，没 30000ms ping 一次 redis
    ```

- 检查系统资源

  - CPU 使用率
  - 内存是否 OOM
  - 网络带宽、丢包情况

- 检查 Redis 实例状态

  > 阿里云 Redis 控制台

  - 资源使用情况（CPU、内存、带宽等）
  - 慢日志
  - QPS 是否突增
  - 是否存在网络抖动

- 避免大 Key 操作

  - 例如错误中的  `LRANGE [key...] 0 -1`
  - 调整建议：
    - 分页读取：`LRANGE key 0 20`
    - 使用 `SCAN` 类命令或结构优化

- 升级 Redisson 版本

  - 老版本可能存在 Netty 或连接管理的 BUG
  - 建议使用 3.16 + 或 3.23 +
