# Spring Cloud Gateway 源码调试环境搭建

> - Spring Cloud Gateway 源码环境所使用的版本：3.1.9

## 前提条件

1. Maven（`>= 3.6.0`）
2. JDK 1.8 +
3. Intellij IDEA

## 打包过程遇到的错误

### 1. `spring-cloud-gateway-integration-tests`模块下 `Spring Cloud Gateway gRPC Integration Test` 子模块打包错误

- 错误信息
```sh
Failed to execute goal org.apache.maven.plugins:maven-checkstyle-plugin:3.1.2:check (checkstyle-validation) on project grpc: Failed during checkstyle configuration: cannot initialize module SuppressionFilter - Unable to read https://raw.githubusercontent.com/spring-cloud/spring-cloud-build/master/spring-cloud-build-tools/src/checkstyle/checkstyle-suppressions.xml: Read timed out -> [Help 1]
```

- 原因分析：由于网络原因导致的 https://raw.githubusercontent.com/spring-cloud/spring-cloud-build/master/spring-cloud-build-tools/src/checkstyle/checkstyle-suppressions.xml 读取链接失败，从而使打包错误
- 解决方式：多大几次包、多尝试 😭😭😭



### 2. `spring-cloud-gateway-sample` 子模块示例程序运行错误

- 错误情形
  - 运行该模块下的 `GatewaySampleApplication#main()` 方法，启动示例时，出现如下错误日志：

```sh
Kotlin: [Internal Error] java.lang.NoSuchFieldError: FILE_HASHING_STRATEGY
	at org.jetbrains.kotlin.jps.targets.KotlinJvmModuleBuildTarget.updateChunkMappings(KotlinJvmModuleBuildTarget.kt:362)
	at org.jetbrains.kotlin.jps.build.KotlinBuilder.doBuild(KotlinBuilder.kt:463)
	at org.jetbrains.kotlin.jps.build.KotlinBuilder.build(KotlinBuilder.kt:299)
	at org.jetbrains.jps.incremental.IncProjectBuilder.runModuleLevelBuilders(IncProjectBuilder.java:1609)
	at org.jetbrains.jps.incremental.IncProjectBuilder.runBuildersForChunk(IncProjectBuilder.java:1238)
	at org.jetbrains.jps.incremental.IncProjectBuilder.buildTargetsChunk(IncProjectBuilder.java:1389)
	at org.jetbrains.jps.incremental.IncProjectBuilder.buildChunkIfAffected(IncProjectBuilder.java:1203)
	at org.jetbrains.jps.incremental.IncProjectBuilder.buildChunks(IncProjectBuilder.java:971)
	at org.jetbrains.jps.incremental.IncProjectBuilder.runBuild(IncProjectBuilder.java:527)
	at org.jetbrains.jps.incremental.IncProjectBuilder.build(IncProjectBuilder.java:236)
	at org.jetbrains.jps.cmdline.BuildRunner.runBuild(BuildRunner.java:135)

```

- 错误原因分析：
  - 这是一个典型的 **Kotlin 编译器版本与 Gradle 插件版本不兼容** 导致的错误
  - `FILE_HASHING_STRATEGY` 是 Kotlin 编译器（kotlin-compiler-embeddable）中的一个内部字段
  - 当你使用的 **Kotlin 插件版本** 与 **Gradle 版本** 或 **Kotlin Gradle 插件版本不兼容**时，就会出现这个字段找不到的问题

- 解决方案：

  - 调整 IDEA 配置中的 Kotlin 编译器的版本
  - 设置方式： `settings --> Build,Execution,Deployment --> Compiler --> Kotlin Compiler` ，将 Kotlin compiler version 的版本调大，调整到 2.0.0 以上
  - 图示如下：

  ![image-20250725010834682](https://raw.githubusercontent.com/witty-hamster/oss/master/202507/202507250108923.png)

- 控制台打印出如下内容，说明 `spring-cloud-gateway-sample` 模块启动成功了

```sh
2025-07-25 00:50:55.297  INFO 26136 --- [           main] o.s.b.web.embedded.netty.NettyWebServer  : Netty started on port 8080
2025-07-25 00:50:58.568 DEBUG 26136 --- [           main] o.s.c.g.r.RouteDefinitionRouteLocator    : RouteDefinition websocket_test applying {_genkey_0=/echo} to Path
2025-07-25 00:50:58.588 DEBUG 26136 --- [           main] o.s.c.g.r.RouteDefinitionRouteLocator    : RouteDefinition websocket_test applying filter {_genkey_0=/httpbin} to PrefixPath
2025-07-25 00:50:58.595 DEBUG 26136 --- [           main] o.s.c.g.r.RouteDefinitionRouteLocator    : RouteDefinition websocket_test applying filter {_genkey_0=X-Response-Default-Foo, _genkey_1=Default-Bar} to AddResponseHeader
2025-07-25 00:50:58.599 DEBUG 26136 --- [           main] o.s.c.g.r.RouteDefinitionRouteLocator    : RouteDefinition matched: websocket_test
2025-07-25 00:50:58.599 DEBUG 26136 --- [           main] o.s.c.g.r.RouteDefinitionRouteLocator    : RouteDefinition default_path_to_httpbin applying {_genkey_0=/**} to Path
2025-07-25 00:50:58.599 DEBUG 26136 --- [           main] o.s.c.g.r.RouteDefinitionRouteLocator    : RouteDefinition default_path_to_httpbin applying filter {_genkey_0=/httpbin} to PrefixPath
2025-07-25 00:50:58.600 DEBUG 26136 --- [           main] o.s.c.g.r.RouteDefinitionRouteLocator    : RouteDefinition default_path_to_httpbin applying filter {_genkey_0=X-Response-Default-Foo, _genkey_1=Default-Bar} to AddResponseHeader
2025-07-25 00:50:58.601 DEBUG 26136 --- [           main] o.s.c.g.r.RouteDefinitionRouteLocator    : RouteDefinition matched: default_path_to_httpbin
2025-07-25 00:50:58.614 DEBUG 26136 --- [           main] o.s.c.g.filter.GatewayMetricsFilter      : New routes count: 2
2025-07-25 00:50:58.627  INFO 26136 --- [           main] o.s.c.g.sample.GatewaySampleApplication  : Started GatewaySampleApplication in 20.237 seconds (JVM running for 25.542)
```



> [!CAUTION]
>
> - [ ] TODO：模块启动成功了，但是访问 http://127.0.0.1:8080/image/webp 时还是失败的，需要进一步排查网关路由的问题