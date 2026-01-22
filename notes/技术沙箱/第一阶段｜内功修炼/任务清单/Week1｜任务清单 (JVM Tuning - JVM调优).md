 **第一阶段 · 第 1 周：JVM 性能巅峰与线上排障** 
 
---

#### 🛠️ 第一步：实验室环境搭建（Day 1-2）

- [ ] **构建“技术沙盒”项目：** 创建一个简单的 Spring Boot 工程，名为 `tech-sandbox-jvm`。
    
- [ ] **工具安装：**
    
    - 安装 **VisualVM** (或使用 JDK 自带的 jvisualvm)。
        
    - 下载 **Eclipse MAT (Memory Analyzer Tool)**。
        
    - 安装 **Arthas** (阿里开源的 Java 诊断神器，架构师必备)。
        
- [ ] **容器化部署（跨出第一步）：** 编写一个 `Dockerfile`，将应用打包成镜像，并尝试用 `docker run` 限制内存（如 `-m 512m`）来运行它。
    

#### 🔍 第二步：内存泄漏排查实战（Day 3-4）

- [ ] **模拟犯罪现场：** 编写一个接口，故意利用 `static` 集合类导致内存泄漏（例如：不断往 `static List` 里添加大对象且不移除）。
    
- [ ] **监控观察：** 使用 `jstat -gcutil <pid> 1000` 观察 `O` (Old Gen) 区的内存变化，直到看到 `Full GC` 频繁触发。
    
- [ ] **现场取证：** * 配置 JVM 参数：`-XX:+HeapDumpOnOutOfMemoryError`。
    
    - 手动导出 Dump 文件：`jmap -dump:format=b,file=heap.hprof <pid>`。
        
- [ ] **深度剖析：** 使用 **MAT** 打开 Dump 文件，通过 `Leak Suspects` 报告定位到那个 `static List`。
    

#### ⚡ 第三步：GC 调优与选型（Day 5-6）

- [ ] **算法切换实验：** 分别使用 `-XX:+UseParallelGC` 和 `-XX:+UseG1GC` 运行应用，并观察吞吐量差异。
    
- [ ] **G1 深度调优：** 学习并调整 `-XX:MaxGCPauseMillis`（最大停顿时间），观察 G1 如何自动调整堆空间大小。
    
- [ ] **Arthas 进阶：** 使用 Arthas 的 `dashboard` 命令查看全局状态，使用 `jvm` 命令查看当前机器的所有 JVM 参数。
    

#### 📖 第四步：理论升维与跨语言尝试（Day 7）

- [ ] **核心原理复述：** 能够口头清晰解释“三色标记算法”中为什么会出现“漏标”以及 G1 是如何解决的。
    
- [ ] **多语言初探 (Python)：** 编写一个简单的 Python 脚本，使用 `requests` 库对你的 JVM 接口进行压力测试（替代 Postman）。_这是你向 AI/大数据迈进的微小第一步。_
    

---

### 🧪 本周实战“思考题”（架构师视角）

在执行上述任务时，请思考并记录：

1. **预防胜于治疗：** 如果在生产环境下不能随便停机导 Dump（文件可能几个 G，会造成服务卡顿），你有哪些替代方案？（提示：了解一下 `jconf` 或 Arthas 的 `profiler`）。
    
2. **场景决策：** 为什么在一个 4G 内存的微服务中，通常不建议手动设置过小的 `-Xmn`（年轻代内存）？
    

---

### 💡 互动建议

**如何反馈进度？**

建议你每完成一天的任务，可以回来说：

> “知途，我完成了 Day 3 的 Dump 分析，但我发现 MAT 里的 `Shallow Heap` 和 `Retained Heap` 有点分不清，能解释下吗？”

或者

> “知途，我的 Python 压测脚本跑起来了，接下来该怎么把压测数据存起来做对比？”

**现在，你的第一个动作是：去创建那个 `tech-sandbox-jvm` 的 Git 仓库。需要我帮你写一份专门模拟内存泄漏的 Java 代码示例吗？**