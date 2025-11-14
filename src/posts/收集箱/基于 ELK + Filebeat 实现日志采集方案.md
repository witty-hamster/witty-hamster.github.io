---

title: 基于 ELK + Filebeat 搭建并实现日志采集框架方案及日志脱敏

icon: noto-v1:hatching-chick

date: 2025-11-14

order: 1

category:

 - 收集箱

tags:

 - ELK
 - Filebeat

star: true
sticky: false

---

## 🔔 ELK + Filebeat 功能详解

> 💡 **ELK（Elasticsearch +  Logstash + Kibana）、Filebeat** 是 **日志收集、处理、存储与可视化** 的经典技术栈，广泛用于分布式系统的可观测性建设

### 一、整体架构概览

```text
[应用系统]
     ↓ (输出日志)
[Filebeat] → [Logstash] → [Elasticsearch] → [Kibana]
     ↑           ↑
   轻量采集    过滤/解析/丰富
```

> ✅ 现代实践中，**Filebeat 可直接写入 Elasticsearch**，绕过 Logstash（性能更高）

### 二、各组件作用与特点

#### 1. **Filebeat** —— 轻量级日志采集器（Shipper）

📌 **作用：**

- **部署在业务服务器上**，实时监控日志文件（如 `/var/log/app.log`）
- 将新增日志**增量采集**并发送到下游（Logstash 或 Elasticsearch）
- 支持多行日志（如 Java 异常堆栈）、日志轮转、断点续传

✅ **核心特点：**

| 特性               | 说明                                                         |
| ------------------ | ------------------------------------------------------------ |
| **轻量低开销**     | 基于 Go 编写，内存占用小（通常 < 50MB），适合每台服务器部署  |
| **可靠传输**       | ACK 机制 + 本地注册表（registry）记录读取位置，避免丢日志    |
| **模块化支持**     | 内置 `nginx`、`mysql`、`system` 等模块，自动解析常见日志格式 |
| **输出灵活**       | 可发往 Logstash、Elasticsearch、Kafka、Redis 等              |
| **不处理日志内容** | 默认只做“搬运”，不做解析（除非启用 processors）              |

⚙️ **示例配置（采集 JSON 日志）：**

```yaml
filebeat.inputs:    # 输入流程配置
- type: filestream    # 采集类型
  paths:      # 采集日志的路径
    - /app/logs/*.log
  json.keys_under_root: true    # 将 JSON 字段提升到顶层
  json.overwrite_keys: true

output.elasticsearch:   # 输出流程配置
  hosts: ["http://es-cluster:9200"]  # 将采集的日志直接输出到 ES 集群
```

------

#### 2. **Logstash** —— 日志处理管道（Processor）

📌 **作用：**

- 接收来自 Filebeat/Kafka 等的日志
- **解析、过滤、转换、丰富**日志内容（如提取字段、脱敏、添加标签）
- 输出到 Elasticsearch 或其他存储

✅ **核心特点：**

| 特性             | 说明                                                        |
| ---------------- | ----------------------------------------------------------- |
| **强大处理能力** | 支持 Grok（正则解析）、JSON 解析、GeoIP、日期转换等         |
| **插件生态丰富** | 输入（input）、过滤（filter）、输出（output）均有大量插件   |
| **支持脱敏**     | 可通过 `mutate` + `gsub` 或自定义 Ruby 脚本实现简单脱敏     |
| **资源消耗高**   | 基于 JVM，内存/CPU 开销大，不适合部署在业务服务器           |
| **可选组件**     | 若日志已是结构化 JSON，可跳过 Logstash，由 Filebeat 直连 ES |

⚙️ **示例：脱敏手机号（简单场景）**

```Ruby
filter {    # 配置过滤器
  mutate {
    gsub => [
      "message", "(1[3-9]\d{9})", "138****1234"
    ]
  }
}
```

> ⚠️ 注意：Logstash **不适合复杂嵌套 JSON 脱敏**（如字段名不统一、层级不确定）

------

#### 3. **Elasticsearch** —— 分布式搜索与存储引擎

📌 **作用：**

- 存储日志数据（文档型，JSON 格式）
- 提供**全文检索、聚合分析、高性能查询**
- 支持水平扩展、高可用

✅ **核心特点：**

- 倒排索引 + 列存（Doc Values）→ 快速查询
- 自动分片（Shard）与副本（Replica）
- 支持 Index Lifecycle Management（ILM）自动管理日志生命周期

------

#### 4. **Kibana** —— 可视化与操作界面

📌 **作用：**

- 查询、筛选、可视化日志（Discover、Dashboard）
- 创建告警（Alerting）
- 管理 Elasticsearch 集群（Dev Tools、Index Patterns）

✅ **核心特点：**

- 所见即所得的查询体验（KQL / Lucene 语法）
- 支持图表、表格、地图等可视化
- 可集成 Machine Learning 异常检测

------

### 三、ELK + Filebeat 在你的脱敏需求中的适用性分析

#### ❓ 能否用 ELK 实现“日志脱敏展示”？

| 方案                                      | 可行性     | 问题                                                         |
| ----------------------------------------- | ---------- | ------------------------------------------------------------ |
| **在 Logstash 中脱敏**                    | ⚠️ 部分可行 | - 无法处理“字段名不统一”（如 phone/mobile）<br/>- 无法递归遍历嵌套 JSON <br/>- 脱敏规则硬编码，难维护 |
| **在 Elasticsearch Ingest Pipeline 脱敏** | ⚠️ 有限支持 | - 可用 Painless 脚本，但性能差、调试难 <br/>- 同样难处理动态字段 |
| **在 Kibana 展示层脱敏**                  | ❌ 不支持   | Kibana 无脱敏能力，直接展示原始数据                          |
| **原始日志明文存 ES，应用层脱敏**         | ✅ **推荐** | - 保持原始日志完整 <br/>- 由你的 Java 服务在 API 层脱敏      |

> 🔑 **结论**：
>
> - **ELK 适合日志采集与存储，但不适合复杂脱敏逻辑**。
> - 应采用：**Filebeat → ES（存明文） → Java API 服务（实时脱敏） → 前端展示**

------

### 四、总结

| 组件              | 角色 | 推荐用途                |
| ----------------- | ---- | ----------------------- |
| **Filebeat**      | 采集 | 轻量采集日志文件        |
| **Logstash**      | 处理 | 结构化解析、 enrichment |
| **Elasticsearch** | 存储 | 高效存储与检索          |
| **Kibana**        | 展示 | 可视化与查询            |

------

## 🔔  基于 Docker 容器化方式搭建 ELK + Filebeat 框架

> 💡 使用 docker-compose 方式，进行容器编排

### 一、框架目录结构

```bash
./elk
├── .env
├── data
├── docker-compose.yml
├── elasticsearch
│   └── elasticsearch.yml
├── kibana
│   └── kibana.yml
├── filebeat
│   └── filebeat.yml
└── logstash
    ├── logstash.conf
    └── pipelines.yml
```

### 二、快速配置及启动容器

#### 1️⃣ 编写各组件配置

##### elasticsearch/elasticsearch.yml

```yaml
cluster.name: "docker-cluster-8.12.0"
network.host: 0.0.0.0
```

##### logstash/pipelines.yml

```yaml
- pipeline.id: main
  path.config: "/usr/share/logstash/pipeline/logstash.conf"
```

##### logstash/logstash.conf

```yaml
input {
    beats {
        port => 5044
    }
}

filter {
    grok {
        match => {
            "message" => [
                "%{TIMESTAMP_ISO8601:timestamp} \| %{LOGLEVEL:level}%{SPACE}%{NUMBER:pid} \| %{DATA:thread_name} \[%{DATA:tid}\] %{DATA:logger}(?:\s*) \- \[%{DATA:method},%{NUMBER:line}\] \| %{GREEDYDATA:msg}"
            ]
        }
        overwrite => ["message"]
    }

    date {
        match => [ "timestamp", "yyyy-MM-dd HH:mm:ss.SSS" ]
        target => "@timestamp"
        timestamp => "Asia/Shanghai"
    }
    
    mutate {
        remove_field => [ "timestamp", "host", "agent", "ecs", "input", "log" ]
    }
}

output {
    elasticsearch {
        hosts => ["http://elasticsearch:9200"]
        index => "app-logs-%{+YYYY.MM.dd}"     # 指定收集日志所存储的索引
    }
}
```

##### filebeat/filebeat.yml

```yaml
filebeat.inputs:
  - type: filestream
    enabled: true
    paths:
      - /logs/java-core/*.log
    encoding: utf-8

    parsers:
      - multiline:
          type: pattern
          pattern: '^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d{3})?'
          negate: true
          match: after
    fields:
      app_name: "log-elk"
      log_type: "java-spring"

processors:
  - add_docker_metadata: ~

output.logstash:
  hosts: ["logstash:5044"]

logging.level: debug
logging.to_files: false
logging.to_stderr: true
logging.metrics.enabled: false

```

#### 2️⃣ 配置全局环境变量 `.env`

```
# 版本信息
ELK_VERSION=8.12.0
FILEBEAT_VERSION=8.12.0

# 日志目录（按照业务实际的日志收集目录配置）
LOGS_PATH=/data/logs

# Elasticsearch 配置
ES_JAVA_OPTS=-Xms1g -Xmx1g

# Elasticsearch 数据持久化目录（宿主机路径）
ES_DATA_PATH=./data/elasticsearch
```

#### 3️⃣ 编写容器编排 `docker-compose.yaml`

```yaml
# version: '3.8'   # 使用 docker compose V1 版本的容器编排技术时，需要指定 version。高版本的不需要指定了

services:     # 各服务组件配置
  elasticsearch:   # elasticsearch 配置项
    image: docker.elastic.co/elasticsearch/elasticsearch:${ELK_VERSION} # 指定镜像（版本统一）
    container_name: elasticsearch          # 指定服务的容器名
    environment:              # 服务容器启动时的环境配置
      - discovery.type=single-node          # 单机模式
      - xpack.security.enabled=false            # 关闭安全认证（生产环境建议开启）
      - ES_JAVA_OPTS=${ES_JAVA_OPTS}         # 配置 JVM
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - ${ES_DATA_PATH}:/usr/share/elasticsearch/data   # 挂载数据持久化
      - ./elasticsearch/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml:ro  # 挂载自定义配置
    ports:
      - "9200:9200"          # 挂载映射端口
    networks:           # 同一个容器环境下的专属网络
      - elk

  logstash:     # logstash 配置项
    image: docker.elastic.co/logstash/logstash:${ELK_VERSION}
    container_name: logstash
    depends_on:
      - elasticsearch
    volumes:
      - ./logstash/pipelines.yml:/usr/share/logstash/config/pipelines.yml:ro     # 自定义管道配置
      - ./logstash/logstash.conf:/usr/share/logstash/pipeline/logstash.conf:ro   # 自定义Logstash配置
    ports:
      - "5044:5044"
    networks:
      - elk

  kibana:     # kibana 配置项
    image: docker.elastic.co/kibana/kibana:${ELK_VERSION}
    container_name: kibana
    depends_on:
      - elasticsearch
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"
    networks:
      - elk
  
  filebeat:     # filebeat 配置项
    image: docker.elastic.co/beats/filebeat:${FILEBEAT_VERSION}
    container_name: filebeat
    depends_on:
      - logstash
    user: root
    volumes:
      - ./filebeat/filebeat.yml:/usr/share/filebeat/filebeat.yml:ro   # 自定义Filebeat配置
      - /var/lib/docker/containers:/var/lib/docker/containers:ro      # 读取Docker容器日志
      - /var/run/docker.sock:/var/run/docker.sock:ro                  # 读取Docker守护进程信息
      - ${LOGS_PATH}:/logs:ro                                         # 读取自定义日志文件（按需调整）
    networks:
      - elk

networks:
  elk:
    driver: bridge

```

> ⚠️ 注意：
>
> - 如果你不在同一主机上运行 Filebeat（比如 Filebeat 部署在其他服务器），则不需要在 `docker-compose.yml` 中定义它，而应单独部署。
> - 若仅测试，可先注释掉 Filebeat 服务，手动用 `curl` 或 `log-generator` 向 Logstash 发送日志。

#### 4️⃣ 启动服务

```bash
cd elk
docker compose up -d
```

查看日志

```bash
docker compose logs -f
```

关闭服务

```bash
docker compose stop
```

重启服务

```bash
docker compose restart
```

按需重启服务

```bash
docker compose restart <容器名/容器ID>
```

查看容器运行状态

```bash
docker ps

或

docker compose ps  # 注意：docker ps 可以在宿主机的全局任意位置执行；docker compose ps 必须进入到有 docker-compose.yml 文件的文件夹后，才能执行
```

进入到指定容器内部，运行容器内部的一些命令

```bash
docker exec -it <容器名/容器ID> /bin/bash

# 使用上面命令后，就可以进入到指定容器中，然后在容器中使用 ll、tail 等命令，是对容器中的内容进行操作
```

#### 5️⃣ 验证服务

- Elasticsearch: <http://localhost:9200>
- Kibana: <http://localhost:5601>
- 在 Kibana 中创建索引模式（如 `app-logs-*`），即可查看日志。

#### 🔒 生产环境注意事项

- 启用 TLS/SSL 加密通信。
- 开启 X-Pack 安全认证（设置用户名密码）。
- 调整 JVM 堆内存大小。
- 使用外部存储卷持久化 Elasticsearch 数据。
- Filebeat 应部署在各业务服务器上，而非与 ELK 同容器。

### 三、各文件配置详解

#### 1. elasticsearch/elasticsearch.yml

📌 **功能**

Elasticsearch 的主配置文件，控制节点行为、网络、集群、安全等核心设置

🏷️ **配置项详解**

```yaml
cluster.name: "docker-cluster-8.12.0"
```

- **作用**：定义集群名称。同一集群中的所有节点必须使用相同的名称。
- **说明**：在单节点开发环境中可随意命名；生产环境需统一。

```yaml
network.host: 0.0.0.0
```

- **作用**：绑定监听地址。`0.0.0.0` 表示接受所有 IP 的连接（包括容器间通信和外部访问）。
- **注意**：Elasticsearch 默认只监听 `localhost`，在 Docker 中必须改为 `0.0.0.0` 才能被其他服务访问。

```yaml
xpack.security.enabled: false
```

- **作用**：关闭 X-Pack 安全功能（如用户认证、TLS）。
- **建议**：开发环境关闭以简化部署；生产环境务必开启，并设置强密码。

>💡 其他常见配置（生产用）：
>
>```yaml
>path.data: /var/lib/elasticsearch   # 数据目录
>path.logs: /var/log/elasticsearch   # 日志目录
>bootstrap.memory_lock: true         # 锁定内存，防止交换
>```

#### 2. kibana/kibana.yml

📌 **功能**

Kibana 的配置文件，用于连接 Elasticsearch、设置界面语言、启用插件等。

🏷️ **配置项详解**

```yaml
server.name: kibana
```

- **作用**：Kibana 实例的名称，主要用于日志标识。

```yaml
server.host: "0.0.0.0"
```

- **作用**：允许 Kibana Web 服务被外部访问（默认只监听 `localhost`）。

```yaml
elasticsearch.hosts: ["http://elasticsearch:9200"]
```

- **作用**：指定 Elasticsearch 地址。
- **关键点**：这里使用的是 **Docker 服务名 `elasticsearch`**，因为它们在同一自定义网络 `elk` 中，可通过服务名 DNS 解析。

```yaml
monitoring.ui.container.elasticsearch.enabled: true
```

- **作用**：在 Kibana 监控页面中显示 Elasticsearch 容器信息（可选）。

> 💡 其他常用配置：
>
> ```yaml
> i18n.locale: "zh-CN"                   # 中文界面
> elasticsearch.username: "kibana_system"
> elasticsearch.password: "xxxx"         # 若启用了安全认证
> server.publicBaseUrl: "https://kibana.example.com"    # 反向代理时设置
> ```

#### 3. logstash/logstash.conf

**功能：**

- 定义数据处理流水线（input → filter → output）。

**配置项详解：**

- **Input（输入）**
  - **作用**：监听 5044 端口，接收来自 Filebeat 的日志。
  - **协议**：使用 Beats 协议（轻量、可靠、支持 ACK）。

```conf
input {
  beats {
    port => 5044
  }
}
```

- **Filter（过滤器，可选）**
  - 典型用途：
    - 使用 `grok` 解析 Nginx/Apache 日志。
    - 提取时间戳并设置 `@timestamp`。
    - 添加字段（如 `env => "prod"`）。

```conf
filter {
  # grok, date, mutate 等插件在此处理日志格式
}
```

> 示例（Nginx 访问日志）：
>
> ```conf
> grok {
>   match => { "message" => "%{COMBINEDAPACHELOG}" }
> }
> date {
>   match => [ "timestamp", "dd/MMM/yyyy:HH:mm:ss Z" ]
> }
> ```

- **Output（输出）**
  - **hosts**：Elasticsearch 地址（容器内通过服务名访问）。
  - **index**：动态索引名，按天创建（便于管理与清理）。
  - 其他选项：
    - `user/password`：若启用了安全认证。
    - `ssl_certificate_verification => false`：测试时跳过证书验证。

```conf
output {
  elasticsearch {
    hosts => ["http://elasticsearch:9200"]
    index => "logs-%{+YYYY.MM.dd}"
  }
}
```

#### 4. filebeat/filebeat.yml

**功能：**

- Filebeat 的采集与输出配置，决定“采集什么”和“发到哪里”。

**配置项详解：**

- **输入（采集日志）**
  - **type: filestream**：Filebeat 8.x 推荐的新输入类型（替代旧的 `log`），支持更高效的文件追踪。
  - **paths**：要监控的日志文件路径（支持通配符）。
  - **挂载说明**：在 Docker 中需将宿主机日志目录挂载到容器内（如 `- /var/log:/var/log`）。

```yaml
filebeat.inputs:
- type: filestream
  enabled: true
  paths:
    - /var/log/*.log
```

> 💡 其他输入类型：
>
> - `container`：直接读取 Docker 容器日志（需挂载 `/var/lib/docker/containers`）。
> - 支持多 input，可同时采集系统日志、应用日志等。

- **输出（发送目的地）**
  - **说明**：发送到同网络中的 Logstash 服务。
  - **优势**：Logstash 可做复杂解析，Filebeat 保持轻量。

```yaml
output.logstash:
  hosts: ["logstash:5044"]
```

> ✅ 替代方案（直连 ES）：
>
> ```yaml
> output.elasticsearch:
>   hosts: ["elasticsearch:9200"]
> ```
>
> 适用于简单场景（无需复杂过滤），性能更高。

- **其他重要配置（可选）**
  - **作用**：自动加载 Kibana 仪表盘和 Elasticsearch 索引模板（需首次运行时启用）。

```yaml
setup.kibana:
  host: "kibana:5601"

setup.template.enabled: true
setup.template.name: "filebeat"
setup.template.pattern: "filebeat-*"
```

#### 🔁 总结：各组件协作流程

1. **Filebeat** 监控本地日志文件 → 读取新增内容。
2. 将日志通过 **Beats 协议** 发送到 **Logstash:5044**。
3. **Logstash** 接收后，经过 `filter` 处理（如解析、丰富字段）。
4. 将结构化日志写入 **Elasticsearch** 的 `logs-2025.11.14` 索引。
5. **Kibana** 连接 Elasticsearch，用户通过 Web 界面查询、可视化日志。

## 📎 实际生产中的日志脱敏过程探索

### 一、前言

因业务日志中存在敏感信息（比如，用户手机号、用户身份证号、银行卡号等），这些敏感信息对于网络安全方面存在致命问题，容易造成信息泄露，因此需要对日志中的敏感信息进行脱敏处理。但因为存在以下两个问题点：

1. 业务系统较多，日志打印格式不规范
2. 业务已经属于成熟系统，改造起来比较费事

针对这两个问题，萌生了从 ELK + Filebeat 框架收集日志的过程中去处理敏感信息的脱敏问题，从而打算从 logstash 日志清洗过滤的过程入手，对收集到的日志进行识别、分析、脱敏、存储，来达到指定的效果。

### 二、时间过程 —— filebeat 配置方案

```yaml
filebeat.inputs:
  - type: filestream
    enabled: true
    paths:
      - /logs/java-core/*.log
    encoding: utf-8

    parsers:
      - multiline:     # 这里要使用 multiline 进行多行合并，主要是为了解决打印异常日志 exception 时，日志分为多行的问题
          type: pattern
          pattern: '^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d{3})?'
          negate: true
          match: after
    fields:
      app_name: "log-elk"
      log_type: "java-spring"

processors:
  - add_docker_metadata: ~ # 可自动附加容器信息（如镜像名、容器 ID 等），便于追踪

# 控制台直接打印（用于调试）
# output.console:
#   pretty: true

output.logstash:
  hosts: ["logstash:5044"]

logging.level: debug
logging.to_files: false
logging.to_stderr: true
logging.metrics.enabled: false

```

### 三、实践过程 —— logstash 配置方案

#### 1️⃣ 按照指定的字段进行脱敏处理配置方案

```conf
input {
    beats {
        port => 5044
    }
}

filter {
    grok {
        match => {
            "message" => [
                "%{TIMESTAMP_ISO8601:timestamp}%{SPACE}\|%{SPACE}%{LOGLEVEL:level}%{SPACE}%{NUMBER:pid:int}%{SPACE}\|%{SPACE}%{DATA:thread_name}%{SPACE}\[TID:%{DATA:tid}\]%{SPACE}%{DATA:logger}%{SPACE}\-%{SPACE}\[%{DATA:method},%{NUMBER:line:int}\]%{SPACE}\|%{SPACE}%{GREEDYDATA:msg}"
            ]
        }
        overwrite => ["message"]
    }

    mutate {
        strip => ["tid_raw"]
        rename => {"tid_raw" => "tid" }
        strip => ["logger"]
    }

    if ![pid] or [pid] =~ /^[^0-9]+$/ {
        mutate {
            add_field => { "pid" => "0" }
        }
    }
    if ![thread_name] {
        mutate {
            add_field => { "thread_name" => "unknown" }
        }  
    }
    if ![tid] {
        mutate {
            add_field => { "tid" => "unknown" }
        }
    }
    if ![method] {
        mutate {
            add_field => { "method" => "unknown" }
        }
    }
    if ![line] or [line] =~ /^[^0-9]+$/ {
        mutate {
            add_field => { "line" => "0" }
        }
    }
    if ![logger] {
        mutate {
            add_field => { "logger" => "unknown" } 
        }
    }

    mutate {
        convert => {
            "pid" => "integer"
            "line" => "integer"
        }
    }

    date {
        match => [ "timestamp", "yyyy-MM-dd HH:mm:ss.SSS" ]
        target => "@timestamp"
        timezone => "Asia/Shanghai"
    }

    json {
        source => "msg"
        target => "parsed_msg"
        tag_on_failure => [ "_not_json" ]
    }

    if "_not_json" not in [tags] {
        ruby {
            code => '
                ip = event.get("[parsed_msg][operIp]")
                if ip.is_a?(String)
                    event.set("[parsed_msg][operIp]", ip.gsub(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/, "***.***.***.***"))
                end
                userCode = event.get("[parsed_msg][operUserCode]")
                if userCode.is_a?(String)
                    clean = userCode.gsub(/[\s\\-\\(\\)]/, "")
                    masked = userCode

                    if clean.start_with?("+") && clean.match?(/^\\+\\d{1,3}\\d+$/)
                        if clean =~ /^(\\+\\d{1,3})(\\d+)$/
                            cc = $1
                            num = $2
                            if num.length >= 7
                                masked = cc + num[0,3] + "****" + num[-4..-1]
                            elsif num.length >= 4
                                masked = cc + num[0,2] + "****" + num[-2..-1]
                            else
                                masked = cc + ("*" * num.length)
                            end
                        end
                    else
                        digits = clean.gsub(/\\D/, "")
                        if digits.length >= 7
                            masked = digits[0,3] + "****" + digits[-4..-1]
                        elsif digits.length >= 4
                            masked = digits[0,2] + "****" + digits[-2..-1]
                        else
                            masked = "*" * [digits.length, 6].min
                        end
                    end
                    event.set("[parsed_msg][operUserCode]", masked)
                end
            '
        }

        if [parsed_msg][outputJson] {
            json {
                source => "[parsed_msg][outputJson]"
                target => "[parsed_msg][outputJson_parsed]"
                tag_on_failure => [ "_outputJson_not_json" ]
            }
            if "_outputJson_not_json" not in [tags] {
                ruby {
                    code => '
                        arr = event.get("[parsed_msg][outputJson_parsed]")
                        if arr.is_a?(Array)
                            arr.each do |item|
                                if item.is_a?(Hash)
                                    if item["userCode"] && item["userCode"].is_a?(String)
                                        raw = item["userCode"]
                                        clean = raw.gsub(/[\s\-\(\)]/, "")
                                        is_phone = false
                                        masked = raw

                                        if clean.start_with?("+")
                                            if clean.match?(/^\+\d{7,15}$/)
                                                is_phone = true
                                            end
                                        else
                                            if clean.match?(/^\d{7,15}$/)
                                                is_phone = true
                                            end
                                        end

                                        if is_phone
                                            if clean.start_with?("+")
                                                if clean =~ /^(\+\d{1,3})(\d+)$/
                                                    cc = $1
                                                    num = $2
                                                    if num.length >= 7
                                                        masked = cc + num[0,3] + "****" + num[-4..-1]
                                                    elsif num.length >= 4
                                                        masked = cc + num[0,2] + "****" + num[-2..-1]
                                                    else
                                                        masked = cc + ("*" * num.length)
                                                    end
                                                else
                                                    masked = "*" * [clean.length, 10].min
                                                end
                                            else
                                                digits = clean
                                                if digits.length >= 7
                                                    masked = digits[0,3] + "****" + digits[-4..-1]
                                                elsif digits.length >= 4
                                                    masked = digits[0,2] + "****" + digits[-2..-1]
                                                else
                                                    masked = "*" * digits.length
                                                end
                                            end
                                        end
                                        item["userCode"] = masked
                                    end
                                    if item["userPhone"] && item["userPhone"].is_a?(String)
                                        clean = item["userPhone"].gsub(/[\s\-\(\)]/, "")
                                        masked = item["userPhone"]

                                        if clean.start_with?("+") && clean.match?(/^\+\d{1,3}\d+$/)
                                            if clean =~ /^(\+\d{1,3})(\d+)$/
                                                cc = $1
                                                num = $2
                                                if num.length >= 7
                                                    masked = cc + num[0,3] + "****" + num[-4..-1]
                                                elsif num.length >= 4
                                                    masked = cc + num[0,2] + "****" + num[-2..-1]
                                                else
                                                    masked = cc + ("*" * num.length)
                                                end
                                            end
                                        else
                                            digits = clean.gsub(/\D/, "")
                                            if digits.length >= 7
                                                masked = digits[0,3] + "****" + digits[-4..-1]
                                            elsif digits.length >= 4
                                                masked = digits[0,2] + "****" + digits[-2..-1]
                                            else
                                                masked = "*" * [digits.length, 6].min
                                            end
                                        end
                                        item["userPhone"] = masked
                                    end
                                    if item["idCard"] && item["idCard"].is_a?(String) && item["idCard"].length == 18
                                        item["idCard"] = item["idCard"].gsub(/(\d{6})\d{8}(\d{4})/, "\\1********\\2")
                                    end
                                    if item["userEmail"] && item["userEmail"].is_a?(String) && item["userEmail"].include?("@")
                                        parts = item["userEmail"].split("@", 2)
                                        if parts.length == 2
                                            local = parts[0]
                                            domain = parts[1]
                                            masked_local = (local.length <= 3) ? local + "****" : local[0,3] + "****"
                                            item["userEmail"] = masked_local + "@" + domain
                                        end
                                    end
                                end
                            end
                            event.set("[parsed_msg][outputJson_parsed]", arr)
                        end
                    '
                }
                ruby {
                    code => '
                        arr = event.get("[parsed_msg][outputJson_parsed]")
                        if arr
                            event.set("[parsed_msg][outputJson]", JSON.generate(arr))
                        end
                    '
                }
                mutate {
                    remove_field => [ "[parsed_msg][outputJson_parsed]" ]
                }
            }
        }
    } 
    else {
        mutate {
            gsub => [
                "msg", "\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b", "***.***.***.***",
                "msg", "(\\d{3})\\d{4}(\\d{4})", "\\1****\\3",
                "msg", "([a-zA-Z0-9])([a-zA-Z0-9._%+-]*)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})", "\\1***@\\3",
                "msg", "(\\d{6})\\d{8}(\\d{4})", "\\1**********\\2",
                "msg", "([9][1-9A-HJ-NPQRTUWXY]{2})[1-9A-HJ-NPQRTUWXY]{14}([1-9A-HJ-NPQRTUWXY0-9]{2})", "\\1**************\\2",
                "msg", "(\\+\\d{1,3})[\\s\\-\\.\\(\\)]*(\\d{2,10})[\\s\\-\\.\\(\\)]*(\\d{4})", "\\1****\\3"
            ]
        }
    }

    ruby {
        code => '
            event.set("msg", event.get("parsed_msg").to_json)
        '
    }

    mutate {
        remove_tag => [ "_not_json", "_outputJson_not_json" ]
        remove_field => [ "timestamp", "message", "parsed_msg", "event", "score", "tags", "host", "agent", "ecs", "input", "log" ]
    }
}

output {
    elasticsearch {
        hosts => ["http://elasticsearch:9200"]
        index => "app-logs-%{+YYYY.MM.dd}"
    }
    
    stdout {
        codec => rubydebug
    }
}

```

#### 2️⃣ 不指定字段，使用递归函数模糊匹配方案

```conf
input {
    beats {
        port => 5044
    }
}

filter {
    grok {
        match => {
            "message" => [
                "%{TIMESTAMP_ISO8601:timestamp}%{SPACE}\|%{SPACE}%{LOGLEVEL:level}%{SPACE}%{NUMBER:pid:int}%{SPACE}\|%{SPACE}%{DATA:thread_name}%{SPACE}\[TID:%{DATA:tid}\]%{SPACE}%{DATA:logger}%{SPACE}\-%{SPACE}\[%{DATA:method},%{NUMBER:line:int}\]%{SPACE}\|%{SPACE}%{GREEDYDATA:msg}"
            ]
        }
        overwrite => ["message"]
    }

    mutate {
        strip => ["tid", "logger"]
    }

    if ![pid] or [pid] =~ /^[^0-9]+$/ {
        mutate {
            add_field => { "pid" => "0" }
        }
    }
    if ![thread_name] {
        mutate {
            add_field => { "thread_name" => "unknown" }
        }  
    }
    if ![tid] {
        mutate {
            add_field => { "tid" => "unknown" }
        }
    }
    if ![method] {
        mutate {
            add_field => { "method" => "unknown" }
        }
    }
    if ![line] or [line] =~ /^[^0-9]+$/ {
        mutate {
            add_field => { "line" => "0" }
        }
    }
    if ![logger] {
        mutate {
            add_field => { "logger" => "unknown" } 
        }
    }

    mutate {
        convert => {
            "pid" => "integer"
            "line" => "integer"
        }
    }

    date {
        match => [ "timestamp", "yyyy-MM-dd HH:mm:ss.SSS" ]
        target => "@timestamp"
        timezone => "Asia/Shanghai"
    }

    json {
        source => "msg"
        target => "parsed_msg"
        tag_on_failure => [ "_not_json" ]
    }

    if "_not_json" not in [tags] {
        ruby {
            code => '
                def mask_if_ip(str)
                    if str.match?(/\b(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/)
                        return "***.***.***.***"
                    end
                    nil
                end

                def mask_if_idcard(str)
                    return nil unless str.is_a?(String)
                    return nil if str.empty?
                    if str.length == 18 && str.match?(/\A\d{17}[\dXx]\z/i)
                        return str.gsub(/(\d{6})\d{8}(\d{4})/, "\\1********\\2")
                    end
                    nil
                end

                def mask_if_email(str)
                    if str.include?("@") && str.match?(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
                        parts = str.split("@", 2)
                        local = parts[0]
                        domain = parts[1]
                        masked_local = (local.length <= 3) ? local + "****" : local[0,3] + "****"
                        return masked_local + "@" + domain
                    end
                    nil
                end

                def mask_if_phone(str)
                    return nil unless str.is_a?(String)

                    if str.match?(/\A1[3-9]\d{9}\z/)
                        return str[0,3] + "****" + str[-4..-1]
                    end

                    clean = str.gsub(/[\\s\\-\\(\\)]/, "")
                    if clean.start_with?("+") && clean.match?(/\A\+\d{7,15}\z/)
                        if clean =~ /^(\+\d{1,3})(\d+)$/
                            cc = $1
                            num = $2
                            if num.length >= 7
                                return cc + num[0,3] + "****" + num[-4..-1]
                            elsif num.length >= 4
                                return cc + num[0,2] + "****" + num[-2..-1]
                            else
                                return cc + ("*" * num.length)
                            end
                        end
                    elsif clean.match?(/\A\d{7,15}\z/)
                        if clean.length >= 7
                            return clean[0,3] + "****" + clean[-4..-1]
                        elsif clean.length >= 4
                            return clean[0,2] + "****" + clean[-2..-1]
                        else
                            return "*" * clean.length
                        end
                    end
                    nil
                end

                def mask_if_bankcard(str)
                    if str.match?(/^\d{13,19}$/)
                        len = str.length
                        if len >= 10
                            return str[0,6] + "********" + str[-4..-1]
                        else
                            return "*" * len
                        end
                    end
                    nil
                end

                def mask_if_creditcode(str)
                    if str.is_a?(String) && str.length == 18 && str.match?(/^[0-9A-HJ-NPQRTUWXY]{2}[0-9]{6}[0-9A-HJ-NPQRTUWXY]{10}$/)
                        return str[0,6] + "********" + str[-2..-1]
                    end
                    nil
                end

                def deep_mask(obj)
                    case obj
                    when Hash
                        obj.each { |k, v| obj[k] = deep_mask(v) }
                    when Array
                        obj.map! { |v| deep_mask(v) }
                    when String
                        trimmed = obj.to_s.strip
                        if (trimmed.start_with?("{") && trimmed.end_with?("}")) || (trimmed.start_with?("[") && trimmed.end_with?("]"))
                            begin
                                parsed_json = JSON.parse(trimmed)
                                masked_json = deep_mask(parsed_json)
                                JSON.generate(masked_json)
                            rescue => e
                                event.set("debug_json_parse_error", "Failed to parse: #{trimmed.inspect} | Error: #{e.class}: #{e.message}")

                                mask_if_ip(trimmed) ||
                                mask_if_idcard(trimmed) ||
                                mask_if_email(trimmed) ||
                                mask_if_phone(trimmed) ||
                                mask_if_bankcard(trimmed) ||
                                mask_if_creditcode(trimmed) ||
                                obj
                            end
                        else
                            mask_if_ip(trimmed) ||
                            mask_if_idcard(trimmed) ||
                            mask_if_email(trimmed) ||
                            mask_if_phone(trimmed) ||
                            mask_if_bankcard(trimmed) ||
                            mask_if_creditcode(trimmed) ||
                            obj
                        end
                    else
                        obj
                    end
                end

                parsed = event.get("parsed_msg")
                if parsed
                    event.set("parsed_msg", deep_mask(parsed))
                end
            '
        }
    } 
    else {
        mutate {
            gsub => [
                "msg", "\\b(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b", "***.***.***.***",
                "msg", "(\\d{3})\\d{4}(\\d{4})", "\\1****\\2",
                "msg", "([a-zA-Z0-9])([a-zA-Z0-9._%+-]*)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})", "\\1****@\\3",
                "msg", "(\\d{6})\\d{8}(\\d{4})", "\\1********\\2",
                "msg", "(\\d{6})\\d{6,10}(\\d{4})", "\\1********\\2",
                "msg", "([0-9A-HJ-NPQRTUWXY]{6})[0-9A-HJ-NPQRTUWXY]{10}([0-9A-HJ-NPQRTUWXY]{2})", "\\1**********\\2"
            ]
        }
    }

    ruby {
        code => '
            event.set("msg", event.get("parsed_msg").to_json)
        '
    }

    mutate {
        remove_tag => [ "_not_json", "_outputJson_not_json" ]
        remove_field => [ "timestamp", "message", "parsed_msg", "event", "score", "tags", "host", "agent", "ecs", "input", "log" ]
    }
}

output {
    elasticsearch {
        hosts => ["http://elasticsearch:9200"]
        index => "app-logs-%{+YYYY.MM.dd}"
    }
    
    stdout {
        codec => rubydebug
    }
}

```

#### 3️⃣ 取消对 JSON 结构的识别，支持任意内容方案

```conf
input {
    beats {
        port => 5044
    }
}

filter {
    grok {
        match => {
            "message" => [
                "%{TIMESTAMP_ISO8601:timestamp}%{SPACE}\|%{SPACE}%{LOGLEVEL:level}%{SPACE}%{NUMBER:pid:int}%{SPACE}\|%{SPACE}%{DATA:thread_name}%{SPACE}\[TID:%{DATA:tid}\]%{SPACE}%{DATA:logger}%{SPACE}\-%{SPACE}\[%{DATA:method},%{NUMBER:line:int}\]%{SPACE}\|%{SPACE}%{GREEDYDATA:msg}"
            ]
        }
        overwrite => ["message"]
    }

    mutate {
        strip => ["tid", "logger"]
    }

    if ![pid] or [pid] =~ /^[^0-9]+$/ {
        mutate {
            add_field => { "pid" => "0" }
        }
    }
    if ![thread_name] {
        mutate {
            add_field => { "thread_name" => "unknown" }
        }  
    }
    if ![tid] {
        mutate {
            add_field => { "tid" => "unknown" }
        }
    }
    if ![method] {
        mutate {
            add_field => { "method" => "unknown" }
        }
    }
    if ![line] or [line] =~ /^[^0-9]+$/ {
        mutate {
            add_field => { "line" => "0" }
        }
    }
    if ![logger] {
        mutate {
            add_field => { "logger" => "unknown" } 
        }
    }

    mutate {
        convert => {
            "pid" => "integer"
            "line" => "integer"
        }
    }

    date {
        match => [ "timestamp", "yyyy-MM-dd HH:mm:ss.SSS" ]
        target => "@timestamp"
        timezone => "Asia/Shanghai"
    }

    if [msg] =~ /^{/ {
        json {
            source => "msg"
            target => "parsed_msg"
            tag_on_failure => [ "_not_json" ]
        }
    }
    

    ruby {
        code => '
            def mask_text(text)
                return text unless text.is_a?(String)

                text = text.gsub(/\b(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/, "***.***.***.***")

                text = text.gsub(/(1[3-9]\d)(\d{4})(\d{4})/, "\\1****\\3")

                text = text.gsub(/\+(\d{1,3})[-.]?(\d{3,6})(\d{2,4})(\d{2,4})\b/) { "+#{$1}#{$2}****#{$4}" }

                text = text.gsub(/(\d{6})\d{8}(\d{4})/, "\\1********\\2")

                text = text.gsub(/([a-zA-Z0-9])([a-zA-Z0-9._%+-]*)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/, "\\1****@\\3")

                text = text.gsub(/(\d{6})\d{4,10}(\d{4})/, "\\1********\\2")

                text = text.gsub(/([0-9A-HJ-NPQRTUWXY]{6})[0-9A-HJ-NPQRTUWXY]{10}([0-9A-HJ-NPQRTUWXY]{2})/, "\\1**********\\2")

                text
            end

            def deep_mask(obj)
                case obj
                when Hash
                    obj.transform_values { |v| deep_mask(v) }
                when Array
                    obj.map { |v| deep_mask(v) }
                when String
                    s = obj.strip
                    if (s.start_with?("{") && s.end_with?("}")) || (s.start_with?("[") && s.end_with?("]"))
                        begin
                            parsed_inner = JSON.parse(s)
                            masked_inner = deep_mask(parsed_inner)
                            JSON.generate(masked_inner)
                        rescue
                            mask_text(s) || s
                        end
                    else
                        mask_text(s) || s
                    end
                else
                    obj
                end
            end

            original_msg = event.get("msg")
            if original_msg
                masked_msg = mask_text(original_msg.to_s)
                event.set("msg", masked_msg)
            end

            parsed = event.get("parsed_msg")
            if parsed.is_a?(Hash) || parsed.is_a?(Array)
                begin
                    masked_parsed = deep_mask(parsed)
                    event.set("parsed_msg", masked_parsed)
                    event.set("msg", JSON.generate(masked_parsed))
                rescue => e
                    event.set("debug_ruby_error", "Failed to re-serialize parsed_msg: #{e.message}")
                end
            end
        '
    }

    mutate {
        remove_tag => [ "_not_json" ]
        remove_field => [ "timestamp", "message", "parsed_msg", "event", "score", "tags", "host", "agent", "ecs", "input", "log" ]
    }
}

output {
    elasticsearch {
        hosts => ["http://elasticsearch:9200"]
        index => "app-logs-%{+YYYY.MM.dd}"
    }
    
    stdout {
        codec => rubydebug
    }
}

```

#### 4️⃣ （最终方案，含注释说明）同时支持多种日志格式、任意内容方案

```conf
# =================================
# INPUT: 接受 Filebeat 发送过来的日志数据
# =================================
input {
    beats {
        port => 5044    # 监听 5044 端口，接受来自 Filebeat 的日志数据
    }
}

# =================================
# FILTER: 日志解析、标准化、清洗、脱敏等处理
# =================================
filter {
    # 初始标记：假设所有日志格式都不匹配，后续通过 grok 成功则移除此标签
    mutate {
        add_tag => ["_log_format_unmatched"]
    }

    # =================================
    # 尝试解析日志格式 1
    #
    # 日志格式1：%d{${LOG_DATEFORMAT_PATTERN:-yyyy-MM-dd HH:mm:ss.SSS}} | ${LOG_LEVEL_PATTERN:-%5p} ${PID:- } | %thread [%tid] %-40.40logger{39} - [%method,%line] | %m%n${LOG_EXCEPTION_CONVERSION_WORD:-%wEx}
    # 标准 Java日志，含 PID、TID、线程名、类名、方法名、行号等信息
    # =================================
    if "_log_format_unmatched" in [tags] {
        grok {
            # grok 格式匹配解析
            match => {
                "message" => "%{TIMESTAMP_ISO8601:timestamp}%{SPACE}\|%{SPACE}%{LOGLEVEL:level}%{SPACE}%{NUMBER:pid:int}%{SPACE}\|%{SPACE}%{DATA:thread_name}%{SPACE}\[TID:%{DATA:tid}\]%{SPACE}%{DATA:logger}%{SPACE}\-%{SPACE}\[%{DATA:method},%{NUMBER:line:int}\]%{SPACE}\|%{SPACE}%{GREEDYDATA:msg}"
            }
            tag_on_failure => ["_grok_fmt1_fail"]       # 匹配失败时打上失败标签
            remove_tag => ["_log_format_unmatched"]     # 匹配成功则移除“未匹配”标签
            add_tag => ["_format_type_1"]               # 标记成功匹配的格式：格式1
        }
    }

    # =================================
    # 尝试解析日志格式 2
    #
    # 日志格式2：%d{yyyy-MM-dd HH:mm:ss.SSS} [%-5level] from %logger{36} in %thread - %msg%n
    # 简化日志，无 PID/TID/方法行号等，含 “from ... in ...” 结构
    # =================================
    if "_log_format_unmatched" in [tags] {
        grok {
            match => {
                "message" => "%{TIMESTAMP_ISO8601:timestamp}%{SPACE}\[%{LOGLEVEL:level}%{SPACE}\]%{SPACE}from%{SPACE}%{JAVACLASS:logger}%{SPACE}in%{SPACE}%{DATA:thread_name}%{SPACE}-%{SPACE}%{GREEDYDATA:msg}"
            }
            tag_on_failure => ["_grok_fmt2_fail"]
            remove_tag => ["_log_format_unmatched"]
            add_tag => ["_format_type_2"]
        }
    }

    # =================================
    # 尝试解析日志格式 3
    #
    # 日志格式3：%d{yyyy-MM-dd HH:mm:ss.SSS} [%-5level] [%thread] [%logger{50}] %file:%line - %msg%n
    # 含 [线程][类] class:line 结构
    # =================================
    if "_log_format_unmatched" in [tags] {
        grok {
            match => {
                "message" => "%{TIMESTAMP_ISO8601:timestamp}%{SPACE}\[%{LOGLEVEL:level} %{SPACE}\]%{SPACE}\[%{DATA:thread_name}\]%{SPACE}\[%{JAVACLASS:logger}\]%{SPACE}%{DATA:class}:%{NUMBER:line:int}%{SPACE}-%{SPACE}%{GREEDYDATA:msg}"
            }
            tag_on_failure => ["_grok_fmt3_fail"]
            remove_tag => ["_log_format_unmatched"]
            add_tag => ["_format_type_3"]
        }
    }

    # =================================
    # 尝试解析日志格式 4
    #
    # 日志格式4：%d{yyyy-MM-dd HH:mm:ss.SSS} [%-5level] [%thread] %logger{20} - [%method,%line] - %msg%n
    # 含 [线程]类 - [方法,行号] 结构
    # =================================
    if "_log_format_unmatched" in [tags] {
        grok {
            match => {
                "message" => "%{TIMESTAMP_ISO8601:timestamp}%{SPACE}\[%{LOGLEVEL:level} %{SPACE}\]%{SPACE}\[%{DATA:thread_name}\]%{SPACE}%{JAVACLASS:logger}%{SPACE}-%{SPACE}\[%{DATA:method},%{NUMBER:line:int}\]%{SPACE}-%{SPACE}%{GREEDYDATA:msg}"
            }
            tag_on_failure => ["_grok_fmt4_fail"]
            remove_tag => ["_log_format_unmatched"]
            add_tag => ["_format_type_4"]
        }
    }

    # =================================
    # 尝试解析日志格式 5
    #
    # 日志格式5：%d{yyyy-MM-dd HH:mm:ss.SSS} [%-5level] [%logger{50}] %file:%line - %msg%n
    # 无线程名，只有 [类] class:line 结构
    # =================================
    if "_log_format_unmatched" in [tags] {
        grok {
            match => {
                "message" => "%{TIMESTAMP_ISO8601:timestamp}%{SPACE}\[%{LOGLEVEL:level} %{SPACE}\]%{SPACE}\[%{JAVACLASS:logger}\]%{SPACE}%{DATA:class}:%{NUMBER:line:int}%{SPACE}-%{SPACE}%{GREEDYDATA:msg}"
            }
            tag_on_failure => ["_grok_fmt5_fail"]
            remove_tag => ["_log_format_unmatched"]
            add_tag => ["_format_type_5"]
        }
    }

    # =================================
    # 最终兜底：如果以上所有日志格式都没有匹配成功，则使用默认字段进行填充
    # =================================
    if "_log_format_unmatched" in [tags] {
        mutate {
            add_field => {
                "msg" => "%{message}"           # 原始消息作为 msg
                "logger" => "unknown"
                "thread_name" => "unknown"
                "method" => "unknown"
                "class" => "unknown"
                "line" => "0"
                "pid" => "0"
                "tid" => "unknown"
            }
            add_tag => ["_format_type_unknown"]
        }
    }

    # =================================
    # 字段标准化：确保关键字段存在且合法
    # =================================
    mutate {
        strip => ["tid", "logger"]
    }

    # pid 必须是数字，否则设为 0
    if ![pid] or [pid] == "" or [pid] =~ /^[^0-9]+$/ {
        mutate { 
            remove_field => [ "pid" ]
            add_field => { "pid" => "0" } 
        }
    }

    # thread_name 不能为空，否则设为 "unknown"
    if ![thread_name] or [thread_name] == "" {
        mutate { 
            remove_field => [ "thread_name" ]
            add_field => { "thread_name" => "unknown" } 
        }  
    }
    if ![tid] or [tid] == "" {
        mutate { 
            remove_field => [ "tid" ]
            add_field => { "tid" => "unknown" } 
        }
    }
    if ![method] or [method] == "" {
        mutate { 
            remove_field => [ "method" ]
            add_field => { "method" => "unknown" } 
        }
    }
    if ![line] or [line] == "" or [line] =~ /^[^0-9]+$/ {
        mutate { 
            remove_field => [ "line" ]
            add_field => { "line" => "0" } 
        }
    }
    if ![logger] or [logger] == "" {
        mutate { 
            remove_field => [ "logger" ]
            add_field => { "logger" => "unknown" } 
        }
    }

    # =================================
    # 时间解析：将日志中的 timestamp 字段转换为 @timestamp 标准时间字段
    # =================================
    date {
        match => [ "timestamp", "yyyy-MM-dd HH:mm:ss.SSS" ]     # 支持毫秒级别时间
        target => "@timestamp"
        timezone => "Asia/Shanghai"                             # 设置时区为中国时区
    }

    # =================================
    # JSON自动解析：如果 msg 字段是 JSON 格式，则解析为结构化数据
    # =================================
    if [msg] =~ /^(\{|\[)/ {
        json {
            source => "msg"                         # 从 msg 字段读取
            target => "parsed_msg"                  # 解析结果存放到 parsed_msg 字段
            tag_on_failure => [ "_not_json" ]       # 如果解析失败，打上失败标签
        }
    }
    
    # =================================
    # 敏感信息脱敏处理（IP、手机号、身份证、银行卡号、企业信用代码、邮箱等）
    # 使用 Ruby 脚本进行深度递归处理，处理原始 msg 字段和解析后的 parsed_msg 字段
    # =================================
    ruby {
        code => '
            # 单层文本脱敏函数
            def mask_text(text)
                # 对函数的输入参数进行校验，如果不是 String 字符，则直接返回，不进行函数处理
                return text unless text.is_a?(String)

                # 脱敏 IP 地址：格式 127.0.0.1 ==> ***.***.***.***
                text = text.gsub(/\b(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/, "***.***.***.***")

                # 脱敏国内手机号：格式 13812345678 ==> 138****5678
                text = text.gsub(/(1[3-9]\d)(\d{4})(\d{4})/, "\\1****\\3")

                # 脱敏国际手机号：格式 +8613812345678 或 +86-13812345678 ==> +86****5678
                text = text.gsub(/\+(\d{1,3})[-.]?(\d{3,6})(\d{2,4})(\d{2,4})\b/) { "+#{$1}#{$2}****#{$4}" }

                # 脱敏身份证号：格式 110101199001011234 ==> 110101********1234
                text = text.gsub(/(\d{6})\d{8}(\d{4})/, "\\1********\\2")
                
                # 脱敏邮箱地址：格式 hamster@niu.com ==> ham****@niu.com
                text = text.gsub(/([a-zA-Z0-9])([a-zA-Z0-9._%+-]*)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/, "\\1****@\\3")

                # 脱敏银行卡号：格式 6222021234567890123 ==> 622202**********0123
                text = text.gsub(/(\d{6})\d{4,10}(\d{4})/, "\\1********\\2")

                # 脱敏统一社会信用代码：格式 91330106563412345A ==> 913301**********45A
                text = text.gsub(/([0-9A-HJ-NPQRTUWXY]{6})[0-9A-HJ-NPQRTUWXY]{10}([0-9A-HJ-NPQRTUWXY]{2})/, "\\1**********\\2")

                text
            end

            # 深度递归脱敏函数：支持嵌套 JSON 对象/数组
            def deep_mask(obj)
                case obj
                # 当对象是 Hash 时，递归处理每个键值对
                when Hash
                    obj.transform_values { |v| deep_mask(v) }
                # 当对象是 Array 时，递归处理每个元素
                when Array
                    obj.map { |v| deep_mask(v) }
                # 当对象是 String 时，先尝试解析为 JSON，如果成功则递归处理，否则直接脱敏文本
                when String
                    s = obj.strip
                    # 如果字符串是 JSON 格式，则尝试解析后脱敏再序列化回字符串
                    if (s.start_with?("{") && s.end_with?("}")) || (s.start_with?("[") && s.end_with?("]"))
                        begin
                            parsed_inner = JSON.parse(s)
                            masked_inner = deep_mask(parsed_inner)
                            JSON.generate(masked_inner)
                        rescue
                            mask_text(s) || s
                        end
                    else
                        mask_text(s) || s
                    end
                else
                    obj
                end
            end

            # 处理原始 msg 字段
            original_msg = event.get("msg")
            if original_msg
                masked_msg = mask_text(original_msg.to_s)
                event.set("msg", masked_msg)
            end

            # 处理解析后的 parsed_msg 字段
            parsed = event.get("parsed_msg")
            if parsed.is_a?(Hash) || parsed.is_a?(Array)
                begin
                    masked_parsed = deep_mask(parsed)
                    event.set("parsed_msg", masked_parsed)
                    # 将脱敏后的结构重新序列化为字符串，覆盖原始 msg 字段
                    event.set("msg", JSON.generate(masked_parsed))
                rescue => e
                    event.set("debug_ruby_error", "Failed to re-serialize parsed_msg: #{e.message}")
                end
            end
        '
    }

    # =================================
    # 清理临时标签和字段
    # =================================
    mutate {
        # 移除所有中间处理标签
        remove_tag => [ "_not_json", "_grok_fmt1_fail", "_grok_fmt2_fail", "_grok_fmt3_fail", "_grok_fmt4_fail", "_grok_fmt5_fail" ]
        # 移除不需要存储到 Elasticsearch 的字段（节省空间、避免冲突）
        remove_field => [ 
            "timestamp",    # 已转为 @timestamp
            "message",      # 原始消息，已解析到 msg 字段
            "parsed_msg",   # 中间解析字段，已脱敏覆后合并到 msg 字段
            "event", "score", "tags", "@metadata", "host", "agent", "ecs", "input", "log"   # Filebeat 相关元数据字段
        ]
    }
}

# =================================
# OUTPUT: 将处理后的日志数据发送到 Elasticsearch 和控制台
# =================================
output {
    elasticsearch {
        hosts => ["http://elasticsearch:9200"]
        index => "app-logs-%{+YYYY.MM.dd}"      # 按天分索引
    }
    
    # DUBUG: 输出到控制台，便于调试查看（开发/测试 使用）
    stdout {
        codec => rubydebug
    }
}

```

### 四、最终效果

![image-20251114132831315](https://cdn.jsdelivr.net/gh/witty-hamster/oss@master/202511/image-20251114132831315.png)

![image-20251114132831320](https://cdn.jsdelivr.net/gh/witty-hamster/oss@master/202511/image-20251114132831320.png)
