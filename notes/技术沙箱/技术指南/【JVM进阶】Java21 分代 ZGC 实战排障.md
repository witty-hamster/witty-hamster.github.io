## 🔥 环境底座｜云原生实验场
> [!note] 实验技术沙盒 --> [tech-sandbox-jvm](https://github.com/witty-hamster/tech-sandbox-java/tree/main/tech-sandbox-jvm)
> 通过创建一个简单的 Spring Boot 工程，模拟业务请求过程中内存泄露的场景，再通过各类工具进行监控观察、深度剖析，找到是什么原因导致的内存泄露，以及如何避免。
### ➽ 环境概览
- **版本选型**：采用 `OpenJDK21（LTS）`，利用其最新的分代 ZGC（Generational ZGC）特性
- **资源限制**：通过 Docker 明确限制 CPU 与内存（如：`cpus: '1.0'`，`memory: 512M`），模拟生产环境的算力边界
- **关键 JVM 参数清单**：
	- `-XX:+UseZGC -XX:+ZGenerational`：开启 Java 21 的分代 ZGC。
	- `-XX:MaxRAMPercentage=75.0`：相比 `-Xmx` 硬编码，此方式能自适应容器内存限制，防止因堆外内存挤压导致容器被 OS `OOM Killer`。
	- `-XX:+HeapDumpOnOutOfMemoryError` & `-XX:HeapDumpPath`：OOM自动采样，生产环境的“黑匣子”，保留崩溃瞬间的现场。

| 环境               | 版本     |
| ---------------- | ------ |
| **JDK**          | 21     |
| **Spring Boot**  | 3.5.10 |
| **Apache Maven** | 3.9.0  |
### ➽ 监控、排错工具
| ⚙️ 工具名称                                | 🔗 下载地址                            | 适用场景       | 优缺点                                   | 备注                                                      |
| -------------------------------------- | ---------------------------------- | ---------- | ------------------------------------- | ------------------------------------------------------- |
| **VisualVM**                           | [下载地址](https://visualvm.github.io) | 实时监控、轻量级分析 | 优点：直观、集成在开发环境 <br>缺点：处理大堆快照容易卡死       |                                                         |
| **Eclipse MAT (Memory Analyzer Tool)** | [下载地址](https://eclipse.dev/mat/)   | 线上诊断、不重启应用 | 优点：动态跟踪方法调用 <br>缺点：对静态堆文件的深度关联分析不如MAT | Eclipse提供的老牌内存分析工具，特别好用。分为独立安装版本、插件版本（可直接集成到Eclipse中使用） |
| **Arthas**                             | [下载地址](https://arthas.aliyun.com)  | 深度离线分析 OOM | 优点：分析能力极强、能处理超大堆 <br>缺点：UI较老旧，属于静态分析  | 阿里开源的 Java 诊断神器                                         |
> 📌 工具使用的注意事项
> - **VisualVM**
> 	- JDK1.8及更早的版本中，jvisualvm是随JDK一起安装的，可以通过JDK直接使用
> 	- JDK1.9及更高版本中，jvisualvm需要单独安装，直接安装 VisualVM 即可
> - **Eclipse MAT (Memory Analyzer Tool)**
> 	- 建议使用独立安装版本，方便对工具软件进行内存配置管理
> 	- 在处理百万级数据量产生的堆文件之前，务必要修改内存配置。
> 		- 独立版本：找到安装目录下的 `MemoryAnalyzer.ini` 文件
> 		- 插件版本：修改 Eclipse 安装目录下的 `eclipse.ini` 文件  
> 	- 修改建议：默认的 `-Xmx1024m` 通常是不够用的，需根据实际情况进行修改。比如你要分析一个10G的堆文件，建议将该值设置为系统可用内存的 60%~80%。

### ➽ 环境搭建过程
- STEP01：pom文件
```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">  
    <modelVersion>4.0.0</modelVersion>  
  
    <groupId>com.dxf.sandbox</groupId>  
    <artifactId>tech-sandbox-jvm</artifactId>  
    <version>1.0-SNAPSHOT</version>  
    <packaging>jar</packaging>  
  
    <name>tech-sandbox-jvm</name>  
    <description>        
	    Java技术沙盒 - JVM调优  
        - SpringBoot 3.5.10  
        - JDK 21.0.10（Azul Zulu Community Edition 21.0.10）  
    </description>  
  
    <properties>        
	    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>  
        <java.version>21</java.version>  
        <maven.version>3.9.0</maven.version>  
        <spring-boot.version>3.5.10</spring-boot.version>  
    </properties>  
  
    <dependencyManagement>        
	    <dependencies>  
            <dependency>  
                <groupId>org.springframework.boot</groupId>  
                <artifactId>spring-boot-dependencies</artifactId>  
                <version>${spring-boot.version}</version>  
                <type>pom</type>  
                <scope>import</scope>  
            </dependency>  
        </dependencies>  
    </dependencyManagement>  
  
    <dependencies>        
	    <dependency>  
            <groupId>org.springframework.boot</groupId>  
            <artifactId>spring-boot-starter-web</artifactId>  
        </dependency>  
        <dependency>            
	        <groupId>org.springframework.boot</groupId>  
            <artifactId>spring-boot-starter-actuator</artifactId>  
        </dependency>  
    </dependencies>  
  
    <build>        
	    <plugins>  
            <!-- Maven 编译器插件：用于构建、打包等 -->  
            <plugin>  
                <groupId>org.apache.maven.plugins</groupId>  
                <artifactId>maven-compiler-plugin</artifactId>  
                <version>${maven.version}</version>  
                <configuration>                    
	                <source>${java.version}</source>  
                    <target>${java.version}</target>  
                    <encoding>${project.build.sourceEncoding}</encoding>  
                </configuration>  
            </plugin>  
  
            <!-- Spring Boot Maven 编译器插件 -->  
            <plugin>  
                <groupId>org.springframework.boot</groupId>  
                <artifactId>spring-boot-maven-plugin</artifactId>  
                <version>${spring-boot.version}</version>  
                <executions>                    
	                <execution>  
                        <goals>  
                            <goal>repackage</goal>  
                        </goals>  
                    </execution>  
                </executions>  
            </plugin>  
        </plugins>  
    </build>  
</project>
```

- STEP02：项目配置文件`application.yaml` & 日志配置文件 `logback-spring.xml`
```yaml
server:  
  port: 10000  
  
spring:  
  application:  
    name: sandbox-jvm  
    version: 1.0.0  
  
  # 如果遇到项目启动后，控制台打印出的日志出现一堆奇怪的字符（如`[32`）而不是颜色，通常是因为你的环境不支持ANSI颜色。使用下面的配置可以强制开启ANSI颜色  
#  output:  
#    ansi:  
#      enabled: always
```
```xml
<?xml version="1.0" encoding="UTF-8"?>  
<configuration>   
    <!-- 设置日志文件路径 & 日志文件名 -->  
    <property name="LOG_PATH" value="./logs"/>  
    <property name="LOG_FILE_NAME" value="tech-sandbox-jvm"/>  
  
    <!-- 每日滚动策略下的日志文件存储文件名 -->  
    <property name="ROLLING_FILE" value="${LOG_PATH}/${LOG_FILE_NAME}-%d{yyyy-MM-dd}.%i.log.gz"/>  
    <!-- 自定义日志打印格式 -->  
    <property name="CUSTOM_COLOR_PATTERN"  
              value="%d{yyyy-MM-dd HH:mm:ss.SSS} %highlight(%-5level) %magenta(${PID:- }) %white(---) %white([%15.15t]) %cyan(%-40.40logger{39}) %blue([line:%4L]) %blue(:) %msg%n"/>  
    <!-- 每日滚动策略在的日志打印格式：时间戳 + 线程 + 日志级别 + 类名 + 消息 -->  
    <property name="FILE_LOG_PATTERN"  
              value="%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n"/>  
  
    <!-- 控制台打印的日志处理 -->  
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">  
        <encoder>  
            <pattern>${CUSTOM_COLOR_PATTERN}</pattern>  
            <charset>UTF-8</charset>  
        </encoder>  
    </appender>  
  
    <!-- 文件日志输出，支持滚动策略 -->  
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">  
        <file>${LOG_PATH}/${LOG_FILE_NAME}.log</file>
        <!-- Spring Boot 3.x版本写法 -->  
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">  
            <fileNamePattern>${ROLLING_FILE}</fileNamePattern>  
            <!-- 单个日志文件的最大大小，超过此大小将触发滚动策略生成新文件 -->  
            <maxFileSize>100MB</maxFileSize>  
            <!-- 日志文件保留的最大天数，超过此天数的旧日志文件将被删除 -->  
            <maxHistory>30</maxHistory>  
            <!-- 总日志文件大小限制：当日志总大小超过10GB时，会删除旧的日志文件 -->  
            <totalSizeCap>10GB</totalSizeCap>  
            <!-- 启动时清理历史日志：应用启动时会根据maxHistory配置清理过期的日志文件 -->  
            <cleanHistoryOnStart>true</cleanHistoryOnStart>  
        </rollingPolicy>  
        <encoder>            
	        <pattern>${FILE_LOG_PATTERN}</pattern>  
        </encoder>  
    </appender>  
  
    <!-- 默认根日志配置：同时输出到控制台和文件 -->  
    <root level="INFO">  
        <appender-ref ref="CONSOLE"/>  
        <appender-ref ref="FILE"/>  
    </root>
</configuration>
```

- STEP03：启动类
```java
@SpringBootApplication  
public class JvmApplication {  
    public static void main(String[] args) {  
        SpringApplication.run(JvmApplication.class, args);  
        System.out.println("Java技术沙箱 -- JVM调优模块启动成功... ...");  
    }  
}
```

- STEP04：构建Docker环境所需的配置文件 & 启动脚本
- `Dockerfile`：配置文件
```dockerfile
# 容器化配置文件  
# 使用轻量级的Alpine镜像，注意选择支持JDK21的版本  
FROM eclipse-temurin:21-jdk-alpine  
  
# 设置工作目录  
WORKDIR /app  
  
# 拷贝target下编译好的jar包（请确保先执行了 mvn clean package）  
COPY target/*.jar app.jar  
  
# 启动命令    
ENTRYPOINT ["java", \  
            "-XX:+UseZGC", \  
            "-XX:+ZGenerational", \  
            "-XX:MaxRAMPercentage=75.0", \  
            "-XX:+HeapDumpOnOutOfMemoryError", \  
            "-XX:HeapDumpPath=/app/dumps/oom_dump.hprof", \  
            "-Xlog:gc*:file=/app/logs/gc.log:time,uptime,level,tags", \  
            "-jar", "app.jar"]
```

- `docker-compose.yml`：启动脚本
```yml
services:  
  # JVM调优实验室  
  jvm-lab:  
    # 构建配置定义了如何构建 jvm-lab 服务的 Docker 镜像。它指定了构建上下文为当前目录（`.`），并且使用名为 `Dockerfile` 的文件作为构建指令。  
    # 这意味着 Docker 将使用当前目录下的 Dockerfile 来构建镜像，其中包含了创建和运行 JVM 应用所需的所有步骤和依赖。  
    build:  
      context: .  
      dockerfile: Dockerfile  
    container_name: jvm-lab  
    ports:  
      - "10000:10000"  
    volumes:  
      - ./logs:/app/logs      # GC日志映射到宿主机  
      - ./dumps:/app/dumps    # 内存快照映射到宿主机  
    deploy:  
      resources:  
        limits:  
          cpus: 1             # 严格限制最多使用 1 个核心的算力  
          memory: 512M        # 限制容器物理内存为 512MB        reservations:  
          cpus: 0.5           # 预留 0.5 个核心，保证最低算力  
    restart: on-failure       # 当容器退出码非0时自动重启，用于处理应用异常崩溃的情况
```

### ➽ 模拟一个内存泄露的场景
> 场景：利用 `static` 集合类导致内存泄露。例如，不断往 `static List` 里添加大对象且不移除

- 模拟场景 `Controller` 代码
```java
@RestController  
public class OOMController {  
  
    /**  
     * 模拟架构师面试常考点：静态集合类引起的内存泄露  
     */  
    private static final List<byte[]> LEAK_LIST = new ArrayList<>();  
  
    /**  
     * 模拟内存泄露，每访问一次 leak() 方法，都会增加 10MB 内存占用  
     *  
     * @return 添加结果  
     */  
    @GetMapping("/leak")  
    public String leak() {  
        // 每次请求会增加 10MB 内存占用且不释放  
        byte[] data = new byte[1024 * 1024 * 10];  
        LEAK_LIST.add(data);  
        return "Added 10MB. Current size: " + LEAK_LIST.size();  
    }  
}
```

### ➽ 基于 Docker 进行实验环境的运行与停止
- STEP01：使用 `mvn clean package` 对工程进行打包
- STEP02：使用 `docker compose` 进行服务的启停
	- 启动：
		- 首次启动：`docker compose up --build`，增加 `--build` 参数，表示首次启动时需要进行所需镜像环境的拉取与构建
		- 再次启动：`docker compose up -d`，增加 `-d` 参数，表示不在控制台打印日志信息
	- 停止：
		- `docker compose down`
	- 重启：
		- `docker compose restart`
	- 查看节点状态
		- `docker ps`
	- 查看日志
		- `docker logs -f <容器名称/PID>`

### ➽ 触发内存溢出的过程
- 通过 http 请求，不断访问 http://localhost:10000/leak 接口，直至接口返回error状态，可通过查看控制台发现出现了 OOM 情况

## 🎯 实时监控｜ jstat 数据指标深度解析

> [!NOTE] ZGC 与传统的 G1、CMS 的本质区别
> ZGC 通过 **着色指针（Colored Pointers）** 和 **读屏障（Load Barriers）** 将 STW 降级至亚毫秒级

> 通过 `jstat` 命令，实时监控 JVM 内部 ZGC 是如何进行垃圾回收的

### ➽ 监控命令
```bash
# 每隔 1 秒看一次垃圾回收情况
docker exec <容器名称/容器ID> jstat -gcutil 1 1000  # 1 代表 Java 在容器中运行的进程ID
```
### ➽ 监控结果 & 数据分析
![监控结果](https://cdn.jsdelivr.net/gh/witty-hamster/oss@master/202601/20260129174505.png)

- 监控结果数据分析
	- **S0/S1/O 字段缺失 (`-`)**：ZGC 逻辑上分为页面（Pages），不再有物理隔离的永久存活区，数据合并在堆内存中统一管理。
	- **E (Eden)**: 代表“新员工区”。当它显示 **100.00** 时，说明新来的对象已经把位子坐满了。
	- **CGC (Concurrent GC)**: 代表“清洁工”出来打扫的次数。
	- **异常发现**: `CGC` 从 **15** 猛增到 **277**！这说明清洁工（ZGC）急疯了，一直在疯狂扫地，但 `E` 区依然是 **100.00**。
		- **CGC (Concurrent GC) 激增**：ZGC 几乎所有阶段（标记、转移、重定位）都是并发的。CGC 次数代表了垃圾回收循环的频率。
		- **E (Eden) 100% 锁定**：说明 `Allocation Rate`（分配速率）已经彻底打满。在 ZGC 中，这会导致线程进入 `Allocation Stall`（分配停顿），虽然不是全线 STW，但业务接口响应时间（RT）会剧烈抖动。
- 结论：说明内存里有些东西“赖着不走”，清洁工扫不动！    

---

## 🎯 内存排障：MAT 溯源链路
> 当程序报出 `OutOfMemoryError`（内存溢出）并自杀后，会留下一个堆转储文件 `.hprof`，可以利用该文件进行溯源链路分析

排障的目标不是“看到报错”，而是“切断引用链”。

### ➽ 核心概念：Shallow vs Retained Heap
- **Shallow Heap**：对象本身占用的空间。
- **Retained Heap**（关键）：如果该对象被回收，JVM 能释放的总空间。**架构师应优先处理 Retained Heap 最大的节点。**
### ➽ 强引用链追踪 (GC Roots)
在 MAT 中通过 `Path to GC Roots` 排除干扰后的证据展示：
- **Root**: `TaskThread` (Tomcat 线程池)
- **Link**: `ApplicationContext` (Spring 容器) → `OOMController` (Singleton Bean)
- **Target**: `LEAK_LIST` (Static Field) → `ArrayList` → `Object[]` → `byte[]`
- **结论**：静态集合的生命周期跨越了所有的 Request Scope，由于其强引用指向 GC Root，导致 ZGC 无法将其标为“垃圾”。

### ➽ 溯源链路详细过程
#### 1. 获取证据
我们将容器里的堆快照（Dump 文件）拿到宿主机，用 **Eclipse MAT** 工具打开。
![内存分析总览视图](https://cdn.jsdelivr.net/gh/witty-hamster/oss@master/202601/20260129180726.png)
#### 2. 找Dominator Tree（支配者树）
> Dominator Tree：内存分析中展示对象支配关系的结构
- **操作**：点击 **Dominator Tree**。
- **发现**：`OOMController` 下面的 `LEAK_LIST` 占据了 **95%** 的空间，Retained Heap 显示为 **304MB**。
- **直白解释**：这个 List 就是那个“赖着不走”的大胖子，它一个人吃掉了几乎所有的内存。
![找到了造成OOM的元凶](https://cdn.jsdelivr.net/gh/witty-hamster/oss@master/202601/20260129180837.png)

#### 3. 找 Path to GC Roots
我们需要知道，为什么垃圾回收器不把它扔出去？
- **操作**: 右键点击 `LEAK_LIST` -> `Path To GC Roots` -> `exclude all phantom/weak/soft references`。
- **发现**: `TaskThread (线程) -> ApplicationContext (Spring) -> OOMController -> LEAK_LIST`
- **分析**: 因为 `LEAK_LIST` 被定义为 **static**。在 Java 中，静态变量就像“传家宝”，只要应用还在跑，它就永远被引用着，垃圾回收器认为它还有用，所以绝对不回收它。

![操作](https://cdn.jsdelivr.net/gh/witty-hamster/oss@master/202601/20260129181057.png)

![发现](https://cdn.jsdelivr.net/gh/witty-hamster/oss@master/202601/20260129181312.png)

---

## 🤔 架构师的思考

### ✅ 实战结论

本次事故是由 **“长生命周期的集合持有了大量短生命周期的对象”** 导致的。即使你用的是 Java 21 最先进的 **ZGC**，也救不了这种代码级的逻辑错误。

### 🧩 实验复盘

1. **防御性编程**：
    - 使用 **Bounded Collection（有界集合）**：给所有集合类设置 `Capacity` 阈值。
    - **软引用应用**：对于非核心缓存，使用 `SoftReference`，给 JVM 留出“紧急避险”的空间。
    - **监控报警**：当 `CGC` 频率异常增加时，系统应该立刻发短信给架构师。

2. **ZGC 调优建议**：
    - **CPU 预留**：ZGC 极其消耗 CPU 算力来换取低延迟。在物理核不足（如 1 核）时，频繁的 CGC 会抢占业务线程。
    - **堆空间预留**：ZGC 需要足够的“空闲页面”来完成搬迁（Relocation）。建议预留 20%~30% 的冗余空间。



