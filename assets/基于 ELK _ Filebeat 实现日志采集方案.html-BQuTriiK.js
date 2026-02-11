import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as a,e as i,o as l}from"./app-CHAp77Wk.js";const e={};function p(t,s){return l(),a("div",null,s[0]||(s[0]=[i(`<h2 id="🔔-elk-filebeat-功能详解" tabindex="-1"><a class="header-anchor" href="#🔔-elk-filebeat-功能详解"><span>🔔 ELK + Filebeat 功能详解</span></a></h2><blockquote><p>💡 <strong>ELK（Elasticsearch + Logstash + Kibana）、Filebeat</strong> 是 <strong>日志收集、处理、存储与可视化</strong> 的经典技术栈，广泛用于分布式系统的可观测性建设</p></blockquote><h3 id="一、整体架构概览" tabindex="-1"><a class="header-anchor" href="#一、整体架构概览"><span>一、整体架构概览</span></a></h3><div class="language-text line-numbers-mode" data-highlighter="shiki" data-ext="text" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-text"><span class="line"><span>[应用系统]</span></span>
<span class="line"><span>     ↓ (输出日志)</span></span>
<span class="line"><span>[Filebeat] → [Logstash] → [Elasticsearch] → [Kibana]</span></span>
<span class="line"><span>     ↑           ↑</span></span>
<span class="line"><span>   轻量采集    过滤/解析/丰富</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>✅ 现代实践中，<strong>Filebeat 可直接写入 Elasticsearch</strong>，绕过 Logstash（性能更高）</p></blockquote><h3 id="二、各组件作用与特点" tabindex="-1"><a class="header-anchor" href="#二、各组件作用与特点"><span>二、各组件作用与特点</span></a></h3><h4 id="_1-filebeat-——-轻量级日志采集器-shipper" tabindex="-1"><a class="header-anchor" href="#_1-filebeat-——-轻量级日志采集器-shipper"><span>1. <strong>Filebeat</strong> —— 轻量级日志采集器（Shipper）</span></a></h4><p>📌 <strong>作用：</strong></p><ul><li><strong>部署在业务服务器上</strong>，实时监控日志文件（如 <code>/var/log/app.log</code>）</li><li>将新增日志<strong>增量采集</strong>并发送到下游（Logstash 或 Elasticsearch）</li><li>支持多行日志（如 Java 异常堆栈）、日志轮转、断点续传</li></ul><p>✅ <strong>核心特点：</strong></p><table><thead><tr><th>特性</th><th>说明</th></tr></thead><tbody><tr><td><strong>轻量低开销</strong></td><td>基于 Go 编写，内存占用小（通常 &lt; 50MB），适合每台服务器部署</td></tr><tr><td><strong>可靠传输</strong></td><td>ACK 机制 + 本地注册表（registry）记录读取位置，避免丢日志</td></tr><tr><td><strong>模块化支持</strong></td><td>内置 <code>nginx</code>、<code>mysql</code>、<code>system</code> 等模块，自动解析常见日志格式</td></tr><tr><td><strong>输出灵活</strong></td><td>可发往 Logstash、Elasticsearch、Kafka、Redis 等</td></tr><tr><td><strong>不处理日志内容</strong></td><td>默认只做“搬运”，不做解析（除非启用 processors）</td></tr></tbody></table><p>⚙️ <strong>示例配置（采集 JSON 日志）：</strong></p><div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-yaml"><span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">filebeat.inputs</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:    </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;"># 输入流程配置</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">- </span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">type</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">filestream</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">    # 采集类型</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">  paths</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:      </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;"># 采集日志的路径</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">/app/logs/*.log</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">  json.keys_under_root</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">true</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">    # 将 JSON 字段提升到顶层</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">  json.overwrite_keys</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">true</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">output.elasticsearch</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:   </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;"># 输出流程配置</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">  hosts</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: [</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;http://es-cluster:9200&quot;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">]  </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;"># 将采集的日志直接输出到 ES 集群</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h4 id="_2-logstash-——-日志处理管道-processor" tabindex="-1"><a class="header-anchor" href="#_2-logstash-——-日志处理管道-processor"><span>2. <strong>Logstash</strong> —— 日志处理管道（Processor）</span></a></h4><p>📌 <strong>作用：</strong></p><ul><li>接收来自 Filebeat/Kafka 等的日志</li><li><strong>解析、过滤、转换、丰富</strong>日志内容（如提取字段、脱敏、添加标签）</li><li>输出到 Elasticsearch 或其他存储</li></ul><p>✅ <strong>核心特点：</strong></p><table><thead><tr><th>特性</th><th>说明</th></tr></thead><tbody><tr><td><strong>强大处理能力</strong></td><td>支持 Grok（正则解析）、JSON 解析、GeoIP、日期转换等</td></tr><tr><td><strong>插件生态丰富</strong></td><td>输入（input）、过滤（filter）、输出（output）均有大量插件</td></tr><tr><td><strong>支持脱敏</strong></td><td>可通过 <code>mutate</code> + <code>gsub</code> 或自定义 Ruby 脚本实现简单脱敏</td></tr><tr><td><strong>资源消耗高</strong></td><td>基于 JVM，内存/CPU 开销大，不适合部署在业务服务器</td></tr><tr><td><strong>可选组件</strong></td><td>若日志已是结构化 JSON，可跳过 Logstash，由 Filebeat 直连 ES</td></tr></tbody></table><p>⚙️ <strong>示例：脱敏手机号（简单场景）</strong></p><div class="language-ruby line-numbers-mode" data-highlighter="shiki" data-ext="ruby" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-ruby"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">filter {    </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;"># 配置过滤器</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">  mutate {</span></span>
<span class="line"><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2;">    gsub</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> =&gt; [</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">      &quot;message&quot;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">, </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;(1[3-9]</span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2;">\\d</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">{9})&quot;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">, </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;138****1234&quot;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    ]</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">  }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>⚠️ 注意：Logstash <strong>不适合复杂嵌套 JSON 脱敏</strong>（如字段名不统一、层级不确定）</p></blockquote><hr><h4 id="_3-elasticsearch-——-分布式搜索与存储引擎" tabindex="-1"><a class="header-anchor" href="#_3-elasticsearch-——-分布式搜索与存储引擎"><span>3. <strong>Elasticsearch</strong> —— 分布式搜索与存储引擎</span></a></h4><p>📌 <strong>作用：</strong></p><ul><li>存储日志数据（文档型，JSON 格式）</li><li>提供<strong>全文检索、聚合分析、高性能查询</strong></li><li>支持水平扩展、高可用</li></ul><p>✅ <strong>核心特点：</strong></p><ul><li>倒排索引 + 列存（Doc Values）→ 快速查询</li><li>自动分片（Shard）与副本（Replica）</li><li>支持 Index Lifecycle Management（ILM）自动管理日志生命周期</li></ul><hr><h4 id="_4-kibana-——-可视化与操作界面" tabindex="-1"><a class="header-anchor" href="#_4-kibana-——-可视化与操作界面"><span>4. <strong>Kibana</strong> —— 可视化与操作界面</span></a></h4><p>📌 <strong>作用：</strong></p><ul><li>查询、筛选、可视化日志（Discover、Dashboard）</li><li>创建告警（Alerting）</li><li>管理 Elasticsearch 集群（Dev Tools、Index Patterns）</li></ul><p>✅ <strong>核心特点：</strong></p><ul><li>所见即所得的查询体验（KQL / Lucene 语法）</li><li>支持图表、表格、地图等可视化</li><li>可集成 Machine Learning 异常检测</li></ul><hr><h3 id="三、elk-filebeat-在你的脱敏需求中的适用性分析" tabindex="-1"><a class="header-anchor" href="#三、elk-filebeat-在你的脱敏需求中的适用性分析"><span>三、ELK + Filebeat 在你的脱敏需求中的适用性分析</span></a></h3><h4 id="❓-能否用-elk-实现-日志脱敏展示" tabindex="-1"><a class="header-anchor" href="#❓-能否用-elk-实现-日志脱敏展示"><span>❓ 能否用 ELK 实现“日志脱敏展示”？</span></a></h4><table><thead><tr><th>方案</th><th>可行性</th><th>问题</th></tr></thead><tbody><tr><td><strong>在 Logstash 中脱敏</strong></td><td>⚠️ 部分可行</td><td>- 无法处理“字段名不统一”（如 phone/mobile）<br>- 无法递归遍历嵌套 JSON <br>- 脱敏规则硬编码，难维护</td></tr><tr><td><strong>在 Elasticsearch Ingest Pipeline 脱敏</strong></td><td>⚠️ 有限支持</td><td>- 可用 Painless 脚本，但性能差、调试难 <br>- 同样难处理动态字段</td></tr><tr><td><strong>在 Kibana 展示层脱敏</strong></td><td>❌ 不支持</td><td>Kibana 无脱敏能力，直接展示原始数据</td></tr><tr><td><strong>原始日志明文存 ES，应用层脱敏</strong></td><td>✅ <strong>推荐</strong></td><td>- 保持原始日志完整 <br>- 由你的 Java 服务在 API 层脱敏</td></tr></tbody></table><blockquote><p>🔑 <strong>结论</strong>：</p><ul><li><strong>ELK 适合日志采集与存储，但不适合复杂脱敏逻辑</strong>。</li><li>应采用：<strong>Filebeat → ES（存明文） → Java API 服务（实时脱敏） → 前端展示</strong></li></ul></blockquote><hr><h3 id="四、总结" tabindex="-1"><a class="header-anchor" href="#四、总结"><span>四、总结</span></a></h3><table><thead><tr><th>组件</th><th>角色</th><th>推荐用途</th></tr></thead><tbody><tr><td><strong>Filebeat</strong></td><td>采集</td><td>轻量采集日志文件</td></tr><tr><td><strong>Logstash</strong></td><td>处理</td><td>结构化解析、 enrichment</td></tr><tr><td><strong>Elasticsearch</strong></td><td>存储</td><td>高效存储与检索</td></tr><tr><td><strong>Kibana</strong></td><td>展示</td><td>可视化与查询</td></tr></tbody></table><hr><h2 id="🔔-基于-docker-容器化方式搭建-elk-filebeat-框架" tabindex="-1"><a class="header-anchor" href="#🔔-基于-docker-容器化方式搭建-elk-filebeat-框架"><span>🔔 基于 Docker 容器化方式搭建 ELK + Filebeat 框架</span></a></h2><blockquote><p>💡 使用 docker-compose 方式，进行容器编排</p></blockquote><h3 id="一、框架目录结构" tabindex="-1"><a class="header-anchor" href="#一、框架目录结构"><span>一、框架目录结构</span></a></h3><div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">./elk</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">├──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> .env</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">├──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> data</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">├──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> docker-compose.yml</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">├──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> elasticsearch</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">│</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">   └──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> elasticsearch.yml</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">├──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> kibana</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">│</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">   └──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> kibana.yml</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">├──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> filebeat</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">│</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">   └──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> filebeat.yml</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">└──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> logstash</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">    ├──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> logstash.conf</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">    └──</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> pipelines.yml</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="二、快速配置及启动容器" tabindex="-1"><a class="header-anchor" href="#二、快速配置及启动容器"><span>二、快速配置及启动容器</span></a></h3><h4 id="_1️⃣-编写各组件配置" tabindex="-1"><a class="header-anchor" href="#_1️⃣-编写各组件配置"><span>1️⃣ 编写各组件配置</span></a></h4><h5 id="elasticsearch-elasticsearch-yml" tabindex="-1"><a class="header-anchor" href="#elasticsearch-elasticsearch-yml"><span>elasticsearch/elasticsearch.yml</span></a></h5><div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-yaml"><span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">cluster.name</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;docker-cluster-8.12.0&quot;</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">network.host</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">0.0.0.0</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="logstash-pipelines-yml" tabindex="-1"><a class="header-anchor" href="#logstash-pipelines-yml"><span>logstash/pipelines.yml</span></a></h5><div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-yaml"><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">- </span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">pipeline.id</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">main</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">  path.config</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;/usr/share/logstash/pipeline/logstash.conf&quot;</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="logstash-logstash-conf" tabindex="-1"><a class="header-anchor" href="#logstash-logstash-conf"><span>logstash/logstash.conf</span></a></h5><div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-yaml"><span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">input {</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">    beats {</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">        port =&gt; 5044</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">filter {</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">    grok {</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">        match =&gt; {</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &quot;message&quot;</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> =&gt; [</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">                &quot;%{TIMESTAMP_ISO8601:timestamp} \\| %{LOGLEVEL:level}%{SPACE}%{NUMBER:pid} \\| %{DATA:thread_name} \\[%{DATA:tid}\\] %{DATA:logger}(?:\\s*) \\- \\[%{DATA:method},%{NUMBER:line}\\] \\| %{GREEDYDATA:msg}&quot;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            ]</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        }</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">        overwrite =&gt; [&quot;message&quot;]</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">    date {</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">        match =&gt; [ &quot;timestamp&quot;, &quot;yyyy-MM-dd HH:mm:ss.SSS&quot; ]</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">        target =&gt; &quot;@timestamp&quot;</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">        timestamp =&gt; &quot;Asia/Shanghai&quot;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    </span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">    mutate {</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">        remove_field =&gt; [ &quot;timestamp&quot;, &quot;host&quot;, &quot;agent&quot;, &quot;ecs&quot;, &quot;input&quot;, &quot;log&quot; ]</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">output {</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">    elasticsearch {</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">        hosts =&gt; [&quot;http://elasticsearch:9200&quot;]</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">        index =&gt; &quot;app-logs-%{+YYYY.MM.dd}&quot;</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">     # 指定收集日志所存储的索引</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="filebeat-filebeat-yml" tabindex="-1"><a class="header-anchor" href="#filebeat-filebeat-yml"><span>filebeat/filebeat.yml</span></a></h5><div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-yaml"><span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">filebeat.inputs</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">  - </span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">type</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">filestream</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    enabled</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">true</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    paths</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">/logs/java-core/*.log</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    encoding</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">utf-8</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    parsers</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">multiline</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">          type</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">pattern</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">          pattern</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}(?:\\.\\d{3})?&#39;</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">          negate</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">true</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">          match</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">after</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    fields</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">      app_name</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;log-elk&quot;</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">      log_type</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;java-spring&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">processors</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">  - </span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">add_docker_metadata</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">~</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">output.logstash</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">  hosts</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: [</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;logstash:5044&quot;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">logging.level</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">debug</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">logging.to_files</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">false</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">logging.to_stderr</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">true</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">logging.metrics.enabled</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">false</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_2️⃣-配置全局环境变量-env" tabindex="-1"><a class="header-anchor" href="#_2️⃣-配置全局环境变量-env"><span>2️⃣ 配置全局环境变量 <code>.env</code></span></a></h4><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-"><span class="line"><span># 版本信息</span></span>
<span class="line"><span>ELK_VERSION=8.12.0</span></span>
<span class="line"><span>FILEBEAT_VERSION=8.12.0</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 日志目录（按照业务实际的日志收集目录配置）</span></span>
<span class="line"><span>LOGS_PATH=/data/logs</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Elasticsearch 配置</span></span>
<span class="line"><span>ES_JAVA_OPTS=-Xms1g -Xmx1g</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Elasticsearch 数据持久化目录（宿主机路径）</span></span>
<span class="line"><span>ES_DATA_PATH=./data/elasticsearch</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_3️⃣-编写容器编排-docker-compose-yaml" tabindex="-1"><a class="header-anchor" href="#_3️⃣-编写容器编排-docker-compose-yaml"><span>3️⃣ 编写容器编排 <code>docker-compose.yaml</code></span></a></h4><div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-yaml"><span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;"># version: &#39;3.8&#39;   # 使用 docker compose V1 版本的容器编排技术时，需要指定 version。高版本的不需要指定了</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">services</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:     </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;"># 各服务组件配置</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">  elasticsearch</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:   </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;"># elasticsearch 配置项</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    image</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">docker.elastic.co/elasticsearch/elasticsearch:\${ELK_VERSION}</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;"> # 指定镜像（版本统一）</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    container_name</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">elasticsearch</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">          # 指定服务的容器名</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    environment</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:              </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;"># 服务容器启动时的环境配置</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">discovery.type=single-node</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">          # 单机模式</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">xpack.security.enabled=false</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">            # 关闭安全认证（生产环境建议开启）</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">ES_JAVA_OPTS=\${ES_JAVA_OPTS}</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">         # 配置 JVM</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    ulimits</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">      memlock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">        soft</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">-1</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">        hard</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">-1</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    volumes</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">\${ES_DATA_PATH}:/usr/share/elasticsearch/data</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">   # 挂载数据持久化</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">./elasticsearch/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml:ro</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">  # 挂载自定义配置</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    ports</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;9200:9200&quot;</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">          # 挂载映射端口</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    networks</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:           </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;"># 同一个容器环境下的专属网络</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">elk</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">  logstash</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:     </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;"># logstash 配置项</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    image</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">docker.elastic.co/logstash/logstash:\${ELK_VERSION}</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    container_name</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">logstash</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    depends_on</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">elasticsearch</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    volumes</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">./logstash/pipelines.yml:/usr/share/logstash/config/pipelines.yml:ro</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">     # 自定义管道配置</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">./logstash/logstash.conf:/usr/share/logstash/pipeline/logstash.conf:ro</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">   # 自定义Logstash配置</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    ports</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;5044:5044&quot;</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    networks</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">elk</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">  kibana</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:     </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;"># kibana 配置项</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    image</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">docker.elastic.co/kibana/kibana:\${ELK_VERSION}</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    container_name</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">kibana</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    depends_on</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">elasticsearch</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    environment</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">ELASTICSEARCH_HOSTS=http://elasticsearch:9200</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    ports</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;5601:5601&quot;</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    networks</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">elk</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">  </span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">  filebeat</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:     </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;"># filebeat 配置项</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    image</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">docker.elastic.co/beats/filebeat:\${FILEBEAT_VERSION}</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    container_name</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">filebeat</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    depends_on</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">logstash</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    user</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">root</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    volumes</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">./filebeat/filebeat.yml:/usr/share/filebeat/filebeat.yml:ro</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">   # 自定义Filebeat配置</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">/var/lib/docker/containers:/var/lib/docker/containers:ro</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">      # 读取Docker容器日志</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">/var/run/docker.sock:/var/run/docker.sock:ro</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">                  # 读取Docker守护进程信息</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">\${LOGS_PATH}:/logs:ro</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">                                         # 读取自定义日志文件（按需调整）</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    networks</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">elk</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">networks</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">  elk</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    driver</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">bridge</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>⚠️ 注意：</p><ul><li>如果你不在同一主机上运行 Filebeat（比如 Filebeat 部署在其他服务器），则不需要在 <code>docker-compose.yml</code> 中定义它，而应单独部署。</li><li>若仅测试，可先注释掉 Filebeat 服务，手动用 <code>curl</code> 或 <code>log-generator</code> 向 Logstash 发送日志。</li></ul></blockquote><h4 id="_4️⃣-启动服务" tabindex="-1"><a class="header-anchor" href="#_4️⃣-启动服务"><span>4️⃣ 启动服务</span></a></h4><div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-bash"><span class="line"><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2;">cd</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> elk</span></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">docker</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> compose</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> up</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> -d</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p>查看日志</p><div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">docker</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> compose</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> logs</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> -f</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>关闭服务</p><div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">docker</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> compose</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> stop</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>重启服务</p><div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">docker</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> compose</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> restart</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>按需重启服务</p><div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">docker</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> compose</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> restart</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> &lt;</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">容器名/容器I</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">D&gt;</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>查看容器运行状态</p><div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">docker</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> ps</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">或</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">docker</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> compose</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> ps</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">  # 注意：docker ps 可以在宿主机的全局任意位置执行；docker compose ps 必须进入到有 docker-compose.yml 文件的文件夹后，才能执行</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>进入到指定容器内部，运行容器内部的一些命令</p><div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-bash"><span class="line"><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">docker</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> exec</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> -it</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> &lt;</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">容器名/容器I</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">D&gt; </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">/bin/bash</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;"># 使用上面命令后，就可以进入到指定容器中，然后在容器中使用 ll、tail 等命令，是对容器中的内容进行操作</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_5️⃣-验证服务" tabindex="-1"><a class="header-anchor" href="#_5️⃣-验证服务"><span>5️⃣ 验证服务</span></a></h4><ul><li>Elasticsearch: <a href="http://localhost:9200" target="_blank" rel="noopener noreferrer">http://localhost:9200</a></li><li>Kibana: <a href="http://localhost:5601" target="_blank" rel="noopener noreferrer">http://localhost:5601</a></li><li>在 Kibana 中创建索引模式（如 <code>app-logs-*</code>），即可查看日志。</li></ul><h4 id="🔒-生产环境注意事项" tabindex="-1"><a class="header-anchor" href="#🔒-生产环境注意事项"><span>🔒 生产环境注意事项</span></a></h4><ul><li>启用 TLS/SSL 加密通信。</li><li>开启 X-Pack 安全认证（设置用户名密码）。</li><li>调整 JVM 堆内存大小。</li><li>使用外部存储卷持久化 Elasticsearch 数据。</li><li>Filebeat 应部署在各业务服务器上，而非与 ELK 同容器。</li></ul><h3 id="三、各文件配置详解" tabindex="-1"><a class="header-anchor" href="#三、各文件配置详解"><span>三、各文件配置详解</span></a></h3><h4 id="_1-elasticsearch-elasticsearch-yml" tabindex="-1"><a class="header-anchor" href="#_1-elasticsearch-elasticsearch-yml"><span>1. elasticsearch/elasticsearch.yml</span></a></h4><p>📌 <strong>功能</strong></p><p>Elasticsearch 的主配置文件，控制节点行为、网络、集群、安全等核心设置</p><p>🏷️ <strong>配置项详解</strong></p><div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-yaml"><span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">cluster.name</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;docker-cluster-8.12.0&quot;</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><ul><li><strong>作用</strong>：定义集群名称。同一集群中的所有节点必须使用相同的名称。</li><li><strong>说明</strong>：在单节点开发环境中可随意命名；生产环境需统一。</li></ul><div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-yaml"><span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">network.host</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">0.0.0.0</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><ul><li><strong>作用</strong>：绑定监听地址。<code>0.0.0.0</code> 表示接受所有 IP 的连接（包括容器间通信和外部访问）。</li><li><strong>注意</strong>：Elasticsearch 默认只监听 <code>localhost</code>，在 Docker 中必须改为 <code>0.0.0.0</code> 才能被其他服务访问。</li></ul><div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-yaml"><span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">xpack.security.enabled</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">false</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><ul><li><strong>作用</strong>：关闭 X-Pack 安全功能（如用户认证、TLS）。</li><li><strong>建议</strong>：开发环境关闭以简化部署；生产环境务必开启，并设置强密码。</li></ul><blockquote><p>💡 其他常见配置（生产用）：</p><div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-yaml"><span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">path.data</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">/var/lib/elasticsearch</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">   # 数据目录</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">path.logs</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">/var/log/elasticsearch</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">   # 日志目录</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">bootstrap.memory_lock</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">true</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">         # 锁定内存，防止交换</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></blockquote><h4 id="_2-kibana-kibana-yml" tabindex="-1"><a class="header-anchor" href="#_2-kibana-kibana-yml"><span>2. kibana/kibana.yml</span></a></h4><p>📌 <strong>功能</strong></p><p>Kibana 的配置文件，用于连接 Elasticsearch、设置界面语言、启用插件等。</p><p>🏷️ <strong>配置项详解</strong></p><div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-yaml"><span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">server.name</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">kibana</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><ul><li><strong>作用</strong>：Kibana 实例的名称，主要用于日志标识。</li></ul><div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-yaml"><span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">server.host</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;0.0.0.0&quot;</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><ul><li><strong>作用</strong>：允许 Kibana Web 服务被外部访问（默认只监听 <code>localhost</code>）。</li></ul><div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-yaml"><span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">elasticsearch.hosts</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: [</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;http://elasticsearch:9200&quot;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">]</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><ul><li><strong>作用</strong>：指定 Elasticsearch 地址。</li><li><strong>关键点</strong>：这里使用的是 <strong>Docker 服务名 <code>elasticsearch</code></strong>，因为它们在同一自定义网络 <code>elk</code> 中，可通过服务名 DNS 解析。</li></ul><div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-yaml"><span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">monitoring.ui.container.elasticsearch.enabled</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">true</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><ul><li><strong>作用</strong>：在 Kibana 监控页面中显示 Elasticsearch 容器信息（可选）。</li></ul><blockquote><p>💡 其他常用配置：</p><div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-yaml"><span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">i18n.locale</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;zh-CN&quot;</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">                   # 中文界面</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">elasticsearch.username</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;kibana_system&quot;</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">elasticsearch.password</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;xxxx&quot;</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">         # 若启用了安全认证</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">server.publicBaseUrl</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;https://kibana.example.com&quot;</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">    # 反向代理时设置</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></blockquote><h4 id="_3-logstash-logstash-conf" tabindex="-1"><a class="header-anchor" href="#_3-logstash-logstash-conf"><span>3. logstash/logstash.conf</span></a></h4><p><strong>功能：</strong></p><ul><li>定义数据处理流水线（input → filter → output）。</li></ul><p><strong>配置项详解：</strong></p><ul><li><strong>Input（输入）</strong><ul><li><strong>作用</strong>：监听 5044 端口，接收来自 Filebeat 的日志。</li><li><strong>协议</strong>：使用 Beats 协议（轻量、可靠、支持 ACK）。</li></ul></li></ul><div class="language-conf line-numbers-mode" data-highlighter="shiki" data-ext="conf" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-conf"><span class="line"><span>input {</span></span>
<span class="line"><span>  beats {</span></span>
<span class="line"><span>    port =&gt; 5044</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><strong>Filter（过滤器，可选）</strong><ul><li>典型用途： <ul><li>使用 <code>grok</code> 解析 Nginx/Apache 日志。</li><li>提取时间戳并设置 <code>@timestamp</code>。</li><li>添加字段（如 <code>env =&gt; &quot;prod&quot;</code>）。</li></ul></li></ul></li></ul><div class="language-conf line-numbers-mode" data-highlighter="shiki" data-ext="conf" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-conf"><span class="line"><span>filter {</span></span>
<span class="line"><span>  # grok, date, mutate 等插件在此处理日志格式</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>示例（Nginx 访问日志）：</p><div class="language-conf line-numbers-mode" data-highlighter="shiki" data-ext="conf" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-conf"><span class="line"><span>grok {</span></span>
<span class="line"><span>  match =&gt; { &quot;message&quot; =&gt; &quot;%{COMBINEDAPACHELOG}&quot; }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>date {</span></span>
<span class="line"><span>  match =&gt; [ &quot;timestamp&quot;, &quot;dd/MMM/yyyy:HH:mm:ss Z&quot; ]</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></blockquote><ul><li><strong>Output（输出）</strong><ul><li><strong>hosts</strong>：Elasticsearch 地址（容器内通过服务名访问）。</li><li><strong>index</strong>：动态索引名，按天创建（便于管理与清理）。</li><li>其他选项： <ul><li><code>user/password</code>：若启用了安全认证。</li><li><code>ssl_certificate_verification =&gt; false</code>：测试时跳过证书验证。</li></ul></li></ul></li></ul><div class="language-conf line-numbers-mode" data-highlighter="shiki" data-ext="conf" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-conf"><span class="line"><span>output {</span></span>
<span class="line"><span>  elasticsearch {</span></span>
<span class="line"><span>    hosts =&gt; [&quot;http://elasticsearch:9200&quot;]</span></span>
<span class="line"><span>    index =&gt; &quot;logs-%{+YYYY.MM.dd}&quot;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_4-filebeat-filebeat-yml" tabindex="-1"><a class="header-anchor" href="#_4-filebeat-filebeat-yml"><span>4. filebeat/filebeat.yml</span></a></h4><p><strong>功能：</strong></p><ul><li>Filebeat 的采集与输出配置，决定“采集什么”和“发到哪里”。</li></ul><p><strong>配置项详解：</strong></p><ul><li><strong>输入（采集日志）</strong><ul><li><strong>type: filestream</strong>：Filebeat 8.x 推荐的新输入类型（替代旧的 <code>log</code>），支持更高效的文件追踪。</li><li><strong>paths</strong>：要监控的日志文件路径（支持通配符）。</li><li><strong>挂载说明</strong>：在 Docker 中需将宿主机日志目录挂载到容器内（如 <code>- /var/log:/var/log</code>）。</li></ul></li></ul><div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-yaml"><span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">filebeat.inputs</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">- </span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">type</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">filestream</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">  enabled</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">true</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">  paths</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">/var/log/*.log</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>💡 其他输入类型：</p><ul><li><code>container</code>：直接读取 Docker 容器日志（需挂载 <code>/var/lib/docker/containers</code>）。</li><li>支持多 input，可同时采集系统日志、应用日志等。</li></ul></blockquote><ul><li><strong>输出（发送目的地）</strong><ul><li><strong>说明</strong>：发送到同网络中的 Logstash 服务。</li><li><strong>优势</strong>：Logstash 可做复杂解析，Filebeat 保持轻量。</li></ul></li></ul><div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-yaml"><span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">output.logstash</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">  hosts</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: [</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;logstash:5044&quot;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">]</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>✅ 替代方案（直连 ES）：</p><div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-yaml"><span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">output.elasticsearch</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">  hosts</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: [</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;elasticsearch:9200&quot;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">]</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p>适用于简单场景（无需复杂过滤），性能更高。</p></blockquote><ul><li><strong>其他重要配置（可选）</strong><ul><li><strong>作用</strong>：自动加载 Kibana 仪表盘和 Elasticsearch 索引模板（需首次运行时启用）。</li></ul></li></ul><div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-yaml"><span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">setup.kibana</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">  host</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;kibana:5601&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">setup.template.enabled</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">true</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">setup.template.name</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;filebeat&quot;</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">setup.template.pattern</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;filebeat-*&quot;</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="🔁-总结-各组件协作流程" tabindex="-1"><a class="header-anchor" href="#🔁-总结-各组件协作流程"><span>🔁 总结：各组件协作流程</span></a></h4><ol><li><strong>Filebeat</strong> 监控本地日志文件 → 读取新增内容。</li><li>将日志通过 <strong>Beats 协议</strong> 发送到 <strong>Logstash:5044</strong>。</li><li><strong>Logstash</strong> 接收后，经过 <code>filter</code> 处理（如解析、丰富字段）。</li><li>将结构化日志写入 <strong>Elasticsearch</strong> 的 <code>logs-2025.11.14</code> 索引。</li><li><strong>Kibana</strong> 连接 Elasticsearch，用户通过 Web 界面查询、可视化日志。</li></ol><h2 id="📎-实际生产中的日志脱敏过程探索" tabindex="-1"><a class="header-anchor" href="#📎-实际生产中的日志脱敏过程探索"><span>📎 实际生产中的日志脱敏过程探索</span></a></h2><h3 id="一、前言" tabindex="-1"><a class="header-anchor" href="#一、前言"><span>一、前言</span></a></h3><p>因业务日志中存在敏感信息（比如，用户手机号、用户身份证号、银行卡号等），这些敏感信息对于网络安全方面存在致命问题，容易造成信息泄露，因此需要对日志中的敏感信息进行脱敏处理。但因为存在以下两个问题点：</p><ol><li>业务系统较多，日志打印格式不规范</li><li>业务已经属于成熟系统，改造起来比较费事</li></ol><p>针对这两个问题，萌生了从 ELK + Filebeat 框架收集日志的过程中去处理敏感信息的脱敏问题，从而打算从 logstash 日志清洗过滤的过程入手，对收集到的日志进行识别、分析、脱敏、存储，来达到指定的效果。</p><h3 id="二、时间过程-——-filebeat-配置方案" tabindex="-1"><a class="header-anchor" href="#二、时间过程-——-filebeat-配置方案"><span>二、时间过程 —— filebeat 配置方案</span></a></h3><div class="language-yaml line-numbers-mode" data-highlighter="shiki" data-ext="yaml" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-yaml"><span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">filebeat.inputs</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">  - </span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">type</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">filestream</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    enabled</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">true</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    paths</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">/logs/java-core/*.log</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    encoding</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">utf-8</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    parsers</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">      - </span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">multiline</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:     </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;"># 这里要使用 multiline 进行多行合并，主要是为了解决打印异常日志 exception 时，日志分为多行的问题</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">          type</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">pattern</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">          pattern</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}(?:\\.\\d{3})?&#39;</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">          negate</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">true</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">          match</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">after</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">    fields</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">      app_name</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;log-elk&quot;</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">      log_type</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;java-spring&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">processors</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">  - </span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">add_docker_metadata</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">~</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;"> # 可自动附加容器信息（如镜像名、容器 ID 等），便于追踪</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;"># 控制台直接打印（用于调试）</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;"># output.console:</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">#   pretty: true</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">output.logstash</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">  hosts</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: [</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;logstash:5044&quot;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">logging.level</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">debug</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">logging.to_files</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">false</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">logging.to_stderr</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">true</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;">logging.metrics.enabled</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">false</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="三、实践过程-——-logstash-配置方案" tabindex="-1"><a class="header-anchor" href="#三、实践过程-——-logstash-配置方案"><span>三、实践过程 —— logstash 配置方案</span></a></h3><h4 id="_1️⃣-按照指定的字段进行脱敏处理配置方案" tabindex="-1"><a class="header-anchor" href="#_1️⃣-按照指定的字段进行脱敏处理配置方案"><span>1️⃣ 按照指定的字段进行脱敏处理配置方案</span></a></h4><div class="language-conf line-numbers-mode" data-highlighter="shiki" data-ext="conf" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-conf"><span class="line"><span>input {</span></span>
<span class="line"><span>    beats {</span></span>
<span class="line"><span>        port =&gt; 5044</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>filter {</span></span>
<span class="line"><span>    grok {</span></span>
<span class="line"><span>        match =&gt; {</span></span>
<span class="line"><span>            &quot;message&quot; =&gt; [</span></span>
<span class="line"><span>                &quot;%{TIMESTAMP_ISO8601:timestamp}%{SPACE}\\|%{SPACE}%{LOGLEVEL:level}%{SPACE}%{NUMBER:pid:int}%{SPACE}\\|%{SPACE}%{DATA:thread_name}%{SPACE}\\[TID:%{DATA:tid}\\]%{SPACE}%{DATA:logger}%{SPACE}\\-%{SPACE}\\[%{DATA:method},%{NUMBER:line:int}\\]%{SPACE}\\|%{SPACE}%{GREEDYDATA:msg}&quot;</span></span>
<span class="line"><span>            ]</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        overwrite =&gt; [&quot;message&quot;]</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    mutate {</span></span>
<span class="line"><span>        strip =&gt; [&quot;tid_raw&quot;]</span></span>
<span class="line"><span>        rename =&gt; {&quot;tid_raw&quot; =&gt; &quot;tid&quot; }</span></span>
<span class="line"><span>        strip =&gt; [&quot;logger&quot;]</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if ![pid] or [pid] =~ /^[^0-9]+$/ {</span></span>
<span class="line"><span>        mutate {</span></span>
<span class="line"><span>            add_field =&gt; { &quot;pid&quot; =&gt; &quot;0&quot; }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if ![thread_name] {</span></span>
<span class="line"><span>        mutate {</span></span>
<span class="line"><span>            add_field =&gt; { &quot;thread_name&quot; =&gt; &quot;unknown&quot; }</span></span>
<span class="line"><span>        }  </span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if ![tid] {</span></span>
<span class="line"><span>        mutate {</span></span>
<span class="line"><span>            add_field =&gt; { &quot;tid&quot; =&gt; &quot;unknown&quot; }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if ![method] {</span></span>
<span class="line"><span>        mutate {</span></span>
<span class="line"><span>            add_field =&gt; { &quot;method&quot; =&gt; &quot;unknown&quot; }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if ![line] or [line] =~ /^[^0-9]+$/ {</span></span>
<span class="line"><span>        mutate {</span></span>
<span class="line"><span>            add_field =&gt; { &quot;line&quot; =&gt; &quot;0&quot; }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if ![logger] {</span></span>
<span class="line"><span>        mutate {</span></span>
<span class="line"><span>            add_field =&gt; { &quot;logger&quot; =&gt; &quot;unknown&quot; } </span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    mutate {</span></span>
<span class="line"><span>        convert =&gt; {</span></span>
<span class="line"><span>            &quot;pid&quot; =&gt; &quot;integer&quot;</span></span>
<span class="line"><span>            &quot;line&quot; =&gt; &quot;integer&quot;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    date {</span></span>
<span class="line"><span>        match =&gt; [ &quot;timestamp&quot;, &quot;yyyy-MM-dd HH:mm:ss.SSS&quot; ]</span></span>
<span class="line"><span>        target =&gt; &quot;@timestamp&quot;</span></span>
<span class="line"><span>        timezone =&gt; &quot;Asia/Shanghai&quot;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    json {</span></span>
<span class="line"><span>        source =&gt; &quot;msg&quot;</span></span>
<span class="line"><span>        target =&gt; &quot;parsed_msg&quot;</span></span>
<span class="line"><span>        tag_on_failure =&gt; [ &quot;_not_json&quot; ]</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if &quot;_not_json&quot; not in [tags] {</span></span>
<span class="line"><span>        ruby {</span></span>
<span class="line"><span>            code =&gt; &#39;</span></span>
<span class="line"><span>                ip = event.get(&quot;[parsed_msg][operIp]&quot;)</span></span>
<span class="line"><span>                if ip.is_a?(String)</span></span>
<span class="line"><span>                    event.set(&quot;[parsed_msg][operIp]&quot;, ip.gsub(/\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b/, &quot;***.***.***.***&quot;))</span></span>
<span class="line"><span>                end</span></span>
<span class="line"><span>                userCode = event.get(&quot;[parsed_msg][operUserCode]&quot;)</span></span>
<span class="line"><span>                if userCode.is_a?(String)</span></span>
<span class="line"><span>                    clean = userCode.gsub(/[\\s\\\\-\\\\(\\\\)]/, &quot;&quot;)</span></span>
<span class="line"><span>                    masked = userCode</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                    if clean.start_with?(&quot;+&quot;) &amp;&amp; clean.match?(/^\\\\+\\\\d{1,3}\\\\d+$/)</span></span>
<span class="line"><span>                        if clean =~ /^(\\\\+\\\\d{1,3})(\\\\d+)$/</span></span>
<span class="line"><span>                            cc = $1</span></span>
<span class="line"><span>                            num = $2</span></span>
<span class="line"><span>                            if num.length &gt;= 7</span></span>
<span class="line"><span>                                masked = cc + num[0,3] + &quot;****&quot; + num[-4..-1]</span></span>
<span class="line"><span>                            elsif num.length &gt;= 4</span></span>
<span class="line"><span>                                masked = cc + num[0,2] + &quot;****&quot; + num[-2..-1]</span></span>
<span class="line"><span>                            else</span></span>
<span class="line"><span>                                masked = cc + (&quot;*&quot; * num.length)</span></span>
<span class="line"><span>                            end</span></span>
<span class="line"><span>                        end</span></span>
<span class="line"><span>                    else</span></span>
<span class="line"><span>                        digits = clean.gsub(/\\\\D/, &quot;&quot;)</span></span>
<span class="line"><span>                        if digits.length &gt;= 7</span></span>
<span class="line"><span>                            masked = digits[0,3] + &quot;****&quot; + digits[-4..-1]</span></span>
<span class="line"><span>                        elsif digits.length &gt;= 4</span></span>
<span class="line"><span>                            masked = digits[0,2] + &quot;****&quot; + digits[-2..-1]</span></span>
<span class="line"><span>                        else</span></span>
<span class="line"><span>                            masked = &quot;*&quot; * [digits.length, 6].min</span></span>
<span class="line"><span>                        end</span></span>
<span class="line"><span>                    end</span></span>
<span class="line"><span>                    event.set(&quot;[parsed_msg][operUserCode]&quot;, masked)</span></span>
<span class="line"><span>                end</span></span>
<span class="line"><span>            &#39;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        if [parsed_msg][outputJson] {</span></span>
<span class="line"><span>            json {</span></span>
<span class="line"><span>                source =&gt; &quot;[parsed_msg][outputJson]&quot;</span></span>
<span class="line"><span>                target =&gt; &quot;[parsed_msg][outputJson_parsed]&quot;</span></span>
<span class="line"><span>                tag_on_failure =&gt; [ &quot;_outputJson_not_json&quot; ]</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>            if &quot;_outputJson_not_json&quot; not in [tags] {</span></span>
<span class="line"><span>                ruby {</span></span>
<span class="line"><span>                    code =&gt; &#39;</span></span>
<span class="line"><span>                        arr = event.get(&quot;[parsed_msg][outputJson_parsed]&quot;)</span></span>
<span class="line"><span>                        if arr.is_a?(Array)</span></span>
<span class="line"><span>                            arr.each do |item|</span></span>
<span class="line"><span>                                if item.is_a?(Hash)</span></span>
<span class="line"><span>                                    if item[&quot;userCode&quot;] &amp;&amp; item[&quot;userCode&quot;].is_a?(String)</span></span>
<span class="line"><span>                                        raw = item[&quot;userCode&quot;]</span></span>
<span class="line"><span>                                        clean = raw.gsub(/[\\s\\-\\(\\)]/, &quot;&quot;)</span></span>
<span class="line"><span>                                        is_phone = false</span></span>
<span class="line"><span>                                        masked = raw</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                                        if clean.start_with?(&quot;+&quot;)</span></span>
<span class="line"><span>                                            if clean.match?(/^\\+\\d{7,15}$/)</span></span>
<span class="line"><span>                                                is_phone = true</span></span>
<span class="line"><span>                                            end</span></span>
<span class="line"><span>                                        else</span></span>
<span class="line"><span>                                            if clean.match?(/^\\d{7,15}$/)</span></span>
<span class="line"><span>                                                is_phone = true</span></span>
<span class="line"><span>                                            end</span></span>
<span class="line"><span>                                        end</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                                        if is_phone</span></span>
<span class="line"><span>                                            if clean.start_with?(&quot;+&quot;)</span></span>
<span class="line"><span>                                                if clean =~ /^(\\+\\d{1,3})(\\d+)$/</span></span>
<span class="line"><span>                                                    cc = $1</span></span>
<span class="line"><span>                                                    num = $2</span></span>
<span class="line"><span>                                                    if num.length &gt;= 7</span></span>
<span class="line"><span>                                                        masked = cc + num[0,3] + &quot;****&quot; + num[-4..-1]</span></span>
<span class="line"><span>                                                    elsif num.length &gt;= 4</span></span>
<span class="line"><span>                                                        masked = cc + num[0,2] + &quot;****&quot; + num[-2..-1]</span></span>
<span class="line"><span>                                                    else</span></span>
<span class="line"><span>                                                        masked = cc + (&quot;*&quot; * num.length)</span></span>
<span class="line"><span>                                                    end</span></span>
<span class="line"><span>                                                else</span></span>
<span class="line"><span>                                                    masked = &quot;*&quot; * [clean.length, 10].min</span></span>
<span class="line"><span>                                                end</span></span>
<span class="line"><span>                                            else</span></span>
<span class="line"><span>                                                digits = clean</span></span>
<span class="line"><span>                                                if digits.length &gt;= 7</span></span>
<span class="line"><span>                                                    masked = digits[0,3] + &quot;****&quot; + digits[-4..-1]</span></span>
<span class="line"><span>                                                elsif digits.length &gt;= 4</span></span>
<span class="line"><span>                                                    masked = digits[0,2] + &quot;****&quot; + digits[-2..-1]</span></span>
<span class="line"><span>                                                else</span></span>
<span class="line"><span>                                                    masked = &quot;*&quot; * digits.length</span></span>
<span class="line"><span>                                                end</span></span>
<span class="line"><span>                                            end</span></span>
<span class="line"><span>                                        end</span></span>
<span class="line"><span>                                        item[&quot;userCode&quot;] = masked</span></span>
<span class="line"><span>                                    end</span></span>
<span class="line"><span>                                    if item[&quot;userPhone&quot;] &amp;&amp; item[&quot;userPhone&quot;].is_a?(String)</span></span>
<span class="line"><span>                                        clean = item[&quot;userPhone&quot;].gsub(/[\\s\\-\\(\\)]/, &quot;&quot;)</span></span>
<span class="line"><span>                                        masked = item[&quot;userPhone&quot;]</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                                        if clean.start_with?(&quot;+&quot;) &amp;&amp; clean.match?(/^\\+\\d{1,3}\\d+$/)</span></span>
<span class="line"><span>                                            if clean =~ /^(\\+\\d{1,3})(\\d+)$/</span></span>
<span class="line"><span>                                                cc = $1</span></span>
<span class="line"><span>                                                num = $2</span></span>
<span class="line"><span>                                                if num.length &gt;= 7</span></span>
<span class="line"><span>                                                    masked = cc + num[0,3] + &quot;****&quot; + num[-4..-1]</span></span>
<span class="line"><span>                                                elsif num.length &gt;= 4</span></span>
<span class="line"><span>                                                    masked = cc + num[0,2] + &quot;****&quot; + num[-2..-1]</span></span>
<span class="line"><span>                                                else</span></span>
<span class="line"><span>                                                    masked = cc + (&quot;*&quot; * num.length)</span></span>
<span class="line"><span>                                                end</span></span>
<span class="line"><span>                                            end</span></span>
<span class="line"><span>                                        else</span></span>
<span class="line"><span>                                            digits = clean.gsub(/\\D/, &quot;&quot;)</span></span>
<span class="line"><span>                                            if digits.length &gt;= 7</span></span>
<span class="line"><span>                                                masked = digits[0,3] + &quot;****&quot; + digits[-4..-1]</span></span>
<span class="line"><span>                                            elsif digits.length &gt;= 4</span></span>
<span class="line"><span>                                                masked = digits[0,2] + &quot;****&quot; + digits[-2..-1]</span></span>
<span class="line"><span>                                            else</span></span>
<span class="line"><span>                                                masked = &quot;*&quot; * [digits.length, 6].min</span></span>
<span class="line"><span>                                            end</span></span>
<span class="line"><span>                                        end</span></span>
<span class="line"><span>                                        item[&quot;userPhone&quot;] = masked</span></span>
<span class="line"><span>                                    end</span></span>
<span class="line"><span>                                    if item[&quot;idCard&quot;] &amp;&amp; item[&quot;idCard&quot;].is_a?(String) &amp;&amp; item[&quot;idCard&quot;].length == 18</span></span>
<span class="line"><span>                                        item[&quot;idCard&quot;] = item[&quot;idCard&quot;].gsub(/(\\d{6})\\d{8}(\\d{4})/, &quot;\\\\1********\\\\2&quot;)</span></span>
<span class="line"><span>                                    end</span></span>
<span class="line"><span>                                    if item[&quot;userEmail&quot;] &amp;&amp; item[&quot;userEmail&quot;].is_a?(String) &amp;&amp; item[&quot;userEmail&quot;].include?(&quot;@&quot;)</span></span>
<span class="line"><span>                                        parts = item[&quot;userEmail&quot;].split(&quot;@&quot;, 2)</span></span>
<span class="line"><span>                                        if parts.length == 2</span></span>
<span class="line"><span>                                            local = parts[0]</span></span>
<span class="line"><span>                                            domain = parts[1]</span></span>
<span class="line"><span>                                            masked_local = (local.length &lt;= 3) ? local + &quot;****&quot; : local[0,3] + &quot;****&quot;</span></span>
<span class="line"><span>                                            item[&quot;userEmail&quot;] = masked_local + &quot;@&quot; + domain</span></span>
<span class="line"><span>                                        end</span></span>
<span class="line"><span>                                    end</span></span>
<span class="line"><span>                                end</span></span>
<span class="line"><span>                            end</span></span>
<span class="line"><span>                            event.set(&quot;[parsed_msg][outputJson_parsed]&quot;, arr)</span></span>
<span class="line"><span>                        end</span></span>
<span class="line"><span>                    &#39;</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span>                ruby {</span></span>
<span class="line"><span>                    code =&gt; &#39;</span></span>
<span class="line"><span>                        arr = event.get(&quot;[parsed_msg][outputJson_parsed]&quot;)</span></span>
<span class="line"><span>                        if arr</span></span>
<span class="line"><span>                            event.set(&quot;[parsed_msg][outputJson]&quot;, JSON.generate(arr))</span></span>
<span class="line"><span>                        end</span></span>
<span class="line"><span>                    &#39;</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span>                mutate {</span></span>
<span class="line"><span>                    remove_field =&gt; [ &quot;[parsed_msg][outputJson_parsed]&quot; ]</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    } </span></span>
<span class="line"><span>    else {</span></span>
<span class="line"><span>        mutate {</span></span>
<span class="line"><span>            gsub =&gt; [</span></span>
<span class="line"><span>                &quot;msg&quot;, &quot;\\\\b\\\\d{1,3}\\\\.\\\\d{1,3}\\\\.\\\\d{1,3}\\\\.\\\\d{1,3}\\\\b&quot;, &quot;***.***.***.***&quot;,</span></span>
<span class="line"><span>                &quot;msg&quot;, &quot;(\\\\d{3})\\\\d{4}(\\\\d{4})&quot;, &quot;\\\\1****\\\\3&quot;,</span></span>
<span class="line"><span>                &quot;msg&quot;, &quot;([a-zA-Z0-9])([a-zA-Z0-9._%+-]*)@([a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,})&quot;, &quot;\\\\1***@\\\\3&quot;,</span></span>
<span class="line"><span>                &quot;msg&quot;, &quot;(\\\\d{6})\\\\d{8}(\\\\d{4})&quot;, &quot;\\\\1**********\\\\2&quot;,</span></span>
<span class="line"><span>                &quot;msg&quot;, &quot;([9][1-9A-HJ-NPQRTUWXY]{2})[1-9A-HJ-NPQRTUWXY]{14}([1-9A-HJ-NPQRTUWXY0-9]{2})&quot;, &quot;\\\\1**************\\\\2&quot;,</span></span>
<span class="line"><span>                &quot;msg&quot;, &quot;(\\\\+\\\\d{1,3})[\\\\s\\\\-\\\\.\\\\(\\\\)]*(\\\\d{2,10})[\\\\s\\\\-\\\\.\\\\(\\\\)]*(\\\\d{4})&quot;, &quot;\\\\1****\\\\3&quot;</span></span>
<span class="line"><span>            ]</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    ruby {</span></span>
<span class="line"><span>        code =&gt; &#39;</span></span>
<span class="line"><span>            event.set(&quot;msg&quot;, event.get(&quot;parsed_msg&quot;).to_json)</span></span>
<span class="line"><span>        &#39;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    mutate {</span></span>
<span class="line"><span>        remove_tag =&gt; [ &quot;_not_json&quot;, &quot;_outputJson_not_json&quot; ]</span></span>
<span class="line"><span>        remove_field =&gt; [ &quot;timestamp&quot;, &quot;message&quot;, &quot;parsed_msg&quot;, &quot;event&quot;, &quot;score&quot;, &quot;tags&quot;, &quot;host&quot;, &quot;agent&quot;, &quot;ecs&quot;, &quot;input&quot;, &quot;log&quot; ]</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>output {</span></span>
<span class="line"><span>    elasticsearch {</span></span>
<span class="line"><span>        hosts =&gt; [&quot;http://elasticsearch:9200&quot;]</span></span>
<span class="line"><span>        index =&gt; &quot;app-logs-%{+YYYY.MM.dd}&quot;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    stdout {</span></span>
<span class="line"><span>        codec =&gt; rubydebug</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_2️⃣-不指定字段-使用递归函数模糊匹配方案" tabindex="-1"><a class="header-anchor" href="#_2️⃣-不指定字段-使用递归函数模糊匹配方案"><span>2️⃣ 不指定字段，使用递归函数模糊匹配方案</span></a></h4><div class="language-conf line-numbers-mode" data-highlighter="shiki" data-ext="conf" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-conf"><span class="line"><span>input {</span></span>
<span class="line"><span>    beats {</span></span>
<span class="line"><span>        port =&gt; 5044</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>filter {</span></span>
<span class="line"><span>    grok {</span></span>
<span class="line"><span>        match =&gt; {</span></span>
<span class="line"><span>            &quot;message&quot; =&gt; [</span></span>
<span class="line"><span>                &quot;%{TIMESTAMP_ISO8601:timestamp}%{SPACE}\\|%{SPACE}%{LOGLEVEL:level}%{SPACE}%{NUMBER:pid:int}%{SPACE}\\|%{SPACE}%{DATA:thread_name}%{SPACE}\\[TID:%{DATA:tid}\\]%{SPACE}%{DATA:logger}%{SPACE}\\-%{SPACE}\\[%{DATA:method},%{NUMBER:line:int}\\]%{SPACE}\\|%{SPACE}%{GREEDYDATA:msg}&quot;</span></span>
<span class="line"><span>            ]</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        overwrite =&gt; [&quot;message&quot;]</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    mutate {</span></span>
<span class="line"><span>        strip =&gt; [&quot;tid&quot;, &quot;logger&quot;]</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if ![pid] or [pid] =~ /^[^0-9]+$/ {</span></span>
<span class="line"><span>        mutate {</span></span>
<span class="line"><span>            add_field =&gt; { &quot;pid&quot; =&gt; &quot;0&quot; }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if ![thread_name] {</span></span>
<span class="line"><span>        mutate {</span></span>
<span class="line"><span>            add_field =&gt; { &quot;thread_name&quot; =&gt; &quot;unknown&quot; }</span></span>
<span class="line"><span>        }  </span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if ![tid] {</span></span>
<span class="line"><span>        mutate {</span></span>
<span class="line"><span>            add_field =&gt; { &quot;tid&quot; =&gt; &quot;unknown&quot; }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if ![method] {</span></span>
<span class="line"><span>        mutate {</span></span>
<span class="line"><span>            add_field =&gt; { &quot;method&quot; =&gt; &quot;unknown&quot; }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if ![line] or [line] =~ /^[^0-9]+$/ {</span></span>
<span class="line"><span>        mutate {</span></span>
<span class="line"><span>            add_field =&gt; { &quot;line&quot; =&gt; &quot;0&quot; }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if ![logger] {</span></span>
<span class="line"><span>        mutate {</span></span>
<span class="line"><span>            add_field =&gt; { &quot;logger&quot; =&gt; &quot;unknown&quot; } </span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    mutate {</span></span>
<span class="line"><span>        convert =&gt; {</span></span>
<span class="line"><span>            &quot;pid&quot; =&gt; &quot;integer&quot;</span></span>
<span class="line"><span>            &quot;line&quot; =&gt; &quot;integer&quot;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    date {</span></span>
<span class="line"><span>        match =&gt; [ &quot;timestamp&quot;, &quot;yyyy-MM-dd HH:mm:ss.SSS&quot; ]</span></span>
<span class="line"><span>        target =&gt; &quot;@timestamp&quot;</span></span>
<span class="line"><span>        timezone =&gt; &quot;Asia/Shanghai&quot;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    json {</span></span>
<span class="line"><span>        source =&gt; &quot;msg&quot;</span></span>
<span class="line"><span>        target =&gt; &quot;parsed_msg&quot;</span></span>
<span class="line"><span>        tag_on_failure =&gt; [ &quot;_not_json&quot; ]</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if &quot;_not_json&quot; not in [tags] {</span></span>
<span class="line"><span>        ruby {</span></span>
<span class="line"><span>            code =&gt; &#39;</span></span>
<span class="line"><span>                def mask_if_ip(str)</span></span>
<span class="line"><span>                    if str.match?(/\\b(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b/)</span></span>
<span class="line"><span>                        return &quot;***.***.***.***&quot;</span></span>
<span class="line"><span>                    end</span></span>
<span class="line"><span>                    nil</span></span>
<span class="line"><span>                end</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                def mask_if_idcard(str)</span></span>
<span class="line"><span>                    return nil unless str.is_a?(String)</span></span>
<span class="line"><span>                    return nil if str.empty?</span></span>
<span class="line"><span>                    if str.length == 18 &amp;&amp; str.match?(/\\A\\d{17}[\\dXx]\\z/i)</span></span>
<span class="line"><span>                        return str.gsub(/(\\d{6})\\d{8}(\\d{4})/, &quot;\\\\1********\\\\2&quot;)</span></span>
<span class="line"><span>                    end</span></span>
<span class="line"><span>                    nil</span></span>
<span class="line"><span>                end</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                def mask_if_email(str)</span></span>
<span class="line"><span>                    if str.include?(&quot;@&quot;) &amp;&amp; str.match?(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/)</span></span>
<span class="line"><span>                        parts = str.split(&quot;@&quot;, 2)</span></span>
<span class="line"><span>                        local = parts[0]</span></span>
<span class="line"><span>                        domain = parts[1]</span></span>
<span class="line"><span>                        masked_local = (local.length &lt;= 3) ? local + &quot;****&quot; : local[0,3] + &quot;****&quot;</span></span>
<span class="line"><span>                        return masked_local + &quot;@&quot; + domain</span></span>
<span class="line"><span>                    end</span></span>
<span class="line"><span>                    nil</span></span>
<span class="line"><span>                end</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                def mask_if_phone(str)</span></span>
<span class="line"><span>                    return nil unless str.is_a?(String)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                    if str.match?(/\\A1[3-9]\\d{9}\\z/)</span></span>
<span class="line"><span>                        return str[0,3] + &quot;****&quot; + str[-4..-1]</span></span>
<span class="line"><span>                    end</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                    clean = str.gsub(/[\\\\s\\\\-\\\\(\\\\)]/, &quot;&quot;)</span></span>
<span class="line"><span>                    if clean.start_with?(&quot;+&quot;) &amp;&amp; clean.match?(/\\A\\+\\d{7,15}\\z/)</span></span>
<span class="line"><span>                        if clean =~ /^(\\+\\d{1,3})(\\d+)$/</span></span>
<span class="line"><span>                            cc = $1</span></span>
<span class="line"><span>                            num = $2</span></span>
<span class="line"><span>                            if num.length &gt;= 7</span></span>
<span class="line"><span>                                return cc + num[0,3] + &quot;****&quot; + num[-4..-1]</span></span>
<span class="line"><span>                            elsif num.length &gt;= 4</span></span>
<span class="line"><span>                                return cc + num[0,2] + &quot;****&quot; + num[-2..-1]</span></span>
<span class="line"><span>                            else</span></span>
<span class="line"><span>                                return cc + (&quot;*&quot; * num.length)</span></span>
<span class="line"><span>                            end</span></span>
<span class="line"><span>                        end</span></span>
<span class="line"><span>                    elsif clean.match?(/\\A\\d{7,15}\\z/)</span></span>
<span class="line"><span>                        if clean.length &gt;= 7</span></span>
<span class="line"><span>                            return clean[0,3] + &quot;****&quot; + clean[-4..-1]</span></span>
<span class="line"><span>                        elsif clean.length &gt;= 4</span></span>
<span class="line"><span>                            return clean[0,2] + &quot;****&quot; + clean[-2..-1]</span></span>
<span class="line"><span>                        else</span></span>
<span class="line"><span>                            return &quot;*&quot; * clean.length</span></span>
<span class="line"><span>                        end</span></span>
<span class="line"><span>                    end</span></span>
<span class="line"><span>                    nil</span></span>
<span class="line"><span>                end</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                def mask_if_bankcard(str)</span></span>
<span class="line"><span>                    if str.match?(/^\\d{13,19}$/)</span></span>
<span class="line"><span>                        len = str.length</span></span>
<span class="line"><span>                        if len &gt;= 10</span></span>
<span class="line"><span>                            return str[0,6] + &quot;********&quot; + str[-4..-1]</span></span>
<span class="line"><span>                        else</span></span>
<span class="line"><span>                            return &quot;*&quot; * len</span></span>
<span class="line"><span>                        end</span></span>
<span class="line"><span>                    end</span></span>
<span class="line"><span>                    nil</span></span>
<span class="line"><span>                end</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                def mask_if_creditcode(str)</span></span>
<span class="line"><span>                    if str.is_a?(String) &amp;&amp; str.length == 18 &amp;&amp; str.match?(/^[0-9A-HJ-NPQRTUWXY]{2}[0-9]{6}[0-9A-HJ-NPQRTUWXY]{10}$/)</span></span>
<span class="line"><span>                        return str[0,6] + &quot;********&quot; + str[-2..-1]</span></span>
<span class="line"><span>                    end</span></span>
<span class="line"><span>                    nil</span></span>
<span class="line"><span>                end</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                def deep_mask(obj)</span></span>
<span class="line"><span>                    case obj</span></span>
<span class="line"><span>                    when Hash</span></span>
<span class="line"><span>                        obj.each { |k, v| obj[k] = deep_mask(v) }</span></span>
<span class="line"><span>                    when Array</span></span>
<span class="line"><span>                        obj.map! { |v| deep_mask(v) }</span></span>
<span class="line"><span>                    when String</span></span>
<span class="line"><span>                        trimmed = obj.to_s.strip</span></span>
<span class="line"><span>                        if (trimmed.start_with?(&quot;{&quot;) &amp;&amp; trimmed.end_with?(&quot;}&quot;)) || (trimmed.start_with?(&quot;[&quot;) &amp;&amp; trimmed.end_with?(&quot;]&quot;))</span></span>
<span class="line"><span>                            begin</span></span>
<span class="line"><span>                                parsed_json = JSON.parse(trimmed)</span></span>
<span class="line"><span>                                masked_json = deep_mask(parsed_json)</span></span>
<span class="line"><span>                                JSON.generate(masked_json)</span></span>
<span class="line"><span>                            rescue =&gt; e</span></span>
<span class="line"><span>                                event.set(&quot;debug_json_parse_error&quot;, &quot;Failed to parse: #{trimmed.inspect} | Error: #{e.class}: #{e.message}&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                                mask_if_ip(trimmed) ||</span></span>
<span class="line"><span>                                mask_if_idcard(trimmed) ||</span></span>
<span class="line"><span>                                mask_if_email(trimmed) ||</span></span>
<span class="line"><span>                                mask_if_phone(trimmed) ||</span></span>
<span class="line"><span>                                mask_if_bankcard(trimmed) ||</span></span>
<span class="line"><span>                                mask_if_creditcode(trimmed) ||</span></span>
<span class="line"><span>                                obj</span></span>
<span class="line"><span>                            end</span></span>
<span class="line"><span>                        else</span></span>
<span class="line"><span>                            mask_if_ip(trimmed) ||</span></span>
<span class="line"><span>                            mask_if_idcard(trimmed) ||</span></span>
<span class="line"><span>                            mask_if_email(trimmed) ||</span></span>
<span class="line"><span>                            mask_if_phone(trimmed) ||</span></span>
<span class="line"><span>                            mask_if_bankcard(trimmed) ||</span></span>
<span class="line"><span>                            mask_if_creditcode(trimmed) ||</span></span>
<span class="line"><span>                            obj</span></span>
<span class="line"><span>                        end</span></span>
<span class="line"><span>                    else</span></span>
<span class="line"><span>                        obj</span></span>
<span class="line"><span>                    end</span></span>
<span class="line"><span>                end</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                parsed = event.get(&quot;parsed_msg&quot;)</span></span>
<span class="line"><span>                if parsed</span></span>
<span class="line"><span>                    event.set(&quot;parsed_msg&quot;, deep_mask(parsed))</span></span>
<span class="line"><span>                end</span></span>
<span class="line"><span>            &#39;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    } </span></span>
<span class="line"><span>    else {</span></span>
<span class="line"><span>        mutate {</span></span>
<span class="line"><span>            gsub =&gt; [</span></span>
<span class="line"><span>                &quot;msg&quot;, &quot;\\\\b(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\\\b&quot;, &quot;***.***.***.***&quot;,</span></span>
<span class="line"><span>                &quot;msg&quot;, &quot;(\\\\d{3})\\\\d{4}(\\\\d{4})&quot;, &quot;\\\\1****\\\\2&quot;,</span></span>
<span class="line"><span>                &quot;msg&quot;, &quot;([a-zA-Z0-9])([a-zA-Z0-9._%+-]*)@([a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,})&quot;, &quot;\\\\1****@\\\\3&quot;,</span></span>
<span class="line"><span>                &quot;msg&quot;, &quot;(\\\\d{6})\\\\d{8}(\\\\d{4})&quot;, &quot;\\\\1********\\\\2&quot;,</span></span>
<span class="line"><span>                &quot;msg&quot;, &quot;(\\\\d{6})\\\\d{6,10}(\\\\d{4})&quot;, &quot;\\\\1********\\\\2&quot;,</span></span>
<span class="line"><span>                &quot;msg&quot;, &quot;([0-9A-HJ-NPQRTUWXY]{6})[0-9A-HJ-NPQRTUWXY]{10}([0-9A-HJ-NPQRTUWXY]{2})&quot;, &quot;\\\\1**********\\\\2&quot;</span></span>
<span class="line"><span>            ]</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    ruby {</span></span>
<span class="line"><span>        code =&gt; &#39;</span></span>
<span class="line"><span>            event.set(&quot;msg&quot;, event.get(&quot;parsed_msg&quot;).to_json)</span></span>
<span class="line"><span>        &#39;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    mutate {</span></span>
<span class="line"><span>        remove_tag =&gt; [ &quot;_not_json&quot;, &quot;_outputJson_not_json&quot; ]</span></span>
<span class="line"><span>        remove_field =&gt; [ &quot;timestamp&quot;, &quot;message&quot;, &quot;parsed_msg&quot;, &quot;event&quot;, &quot;score&quot;, &quot;tags&quot;, &quot;host&quot;, &quot;agent&quot;, &quot;ecs&quot;, &quot;input&quot;, &quot;log&quot; ]</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>output {</span></span>
<span class="line"><span>    elasticsearch {</span></span>
<span class="line"><span>        hosts =&gt; [&quot;http://elasticsearch:9200&quot;]</span></span>
<span class="line"><span>        index =&gt; &quot;app-logs-%{+YYYY.MM.dd}&quot;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    stdout {</span></span>
<span class="line"><span>        codec =&gt; rubydebug</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_3️⃣-取消对-json-结构的识别-支持任意内容方案" tabindex="-1"><a class="header-anchor" href="#_3️⃣-取消对-json-结构的识别-支持任意内容方案"><span>3️⃣ 取消对 JSON 结构的识别，支持任意内容方案</span></a></h4><div class="language-conf line-numbers-mode" data-highlighter="shiki" data-ext="conf" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-conf"><span class="line"><span>input {</span></span>
<span class="line"><span>    beats {</span></span>
<span class="line"><span>        port =&gt; 5044</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>filter {</span></span>
<span class="line"><span>    grok {</span></span>
<span class="line"><span>        match =&gt; {</span></span>
<span class="line"><span>            &quot;message&quot; =&gt; [</span></span>
<span class="line"><span>                &quot;%{TIMESTAMP_ISO8601:timestamp}%{SPACE}\\|%{SPACE}%{LOGLEVEL:level}%{SPACE}%{NUMBER:pid:int}%{SPACE}\\|%{SPACE}%{DATA:thread_name}%{SPACE}\\[TID:%{DATA:tid}\\]%{SPACE}%{DATA:logger}%{SPACE}\\-%{SPACE}\\[%{DATA:method},%{NUMBER:line:int}\\]%{SPACE}\\|%{SPACE}%{GREEDYDATA:msg}&quot;</span></span>
<span class="line"><span>            ]</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        overwrite =&gt; [&quot;message&quot;]</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    mutate {</span></span>
<span class="line"><span>        strip =&gt; [&quot;tid&quot;, &quot;logger&quot;]</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if ![pid] or [pid] =~ /^[^0-9]+$/ {</span></span>
<span class="line"><span>        mutate {</span></span>
<span class="line"><span>            add_field =&gt; { &quot;pid&quot; =&gt; &quot;0&quot; }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if ![thread_name] {</span></span>
<span class="line"><span>        mutate {</span></span>
<span class="line"><span>            add_field =&gt; { &quot;thread_name&quot; =&gt; &quot;unknown&quot; }</span></span>
<span class="line"><span>        }  </span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if ![tid] {</span></span>
<span class="line"><span>        mutate {</span></span>
<span class="line"><span>            add_field =&gt; { &quot;tid&quot; =&gt; &quot;unknown&quot; }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if ![method] {</span></span>
<span class="line"><span>        mutate {</span></span>
<span class="line"><span>            add_field =&gt; { &quot;method&quot; =&gt; &quot;unknown&quot; }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if ![line] or [line] =~ /^[^0-9]+$/ {</span></span>
<span class="line"><span>        mutate {</span></span>
<span class="line"><span>            add_field =&gt; { &quot;line&quot; =&gt; &quot;0&quot; }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if ![logger] {</span></span>
<span class="line"><span>        mutate {</span></span>
<span class="line"><span>            add_field =&gt; { &quot;logger&quot; =&gt; &quot;unknown&quot; } </span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    mutate {</span></span>
<span class="line"><span>        convert =&gt; {</span></span>
<span class="line"><span>            &quot;pid&quot; =&gt; &quot;integer&quot;</span></span>
<span class="line"><span>            &quot;line&quot; =&gt; &quot;integer&quot;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    date {</span></span>
<span class="line"><span>        match =&gt; [ &quot;timestamp&quot;, &quot;yyyy-MM-dd HH:mm:ss.SSS&quot; ]</span></span>
<span class="line"><span>        target =&gt; &quot;@timestamp&quot;</span></span>
<span class="line"><span>        timezone =&gt; &quot;Asia/Shanghai&quot;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if [msg] =~ /^{/ {</span></span>
<span class="line"><span>        json {</span></span>
<span class="line"><span>            source =&gt; &quot;msg&quot;</span></span>
<span class="line"><span>            target =&gt; &quot;parsed_msg&quot;</span></span>
<span class="line"><span>            tag_on_failure =&gt; [ &quot;_not_json&quot; ]</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span></span></span>
<span class="line"><span>    ruby {</span></span>
<span class="line"><span>        code =&gt; &#39;</span></span>
<span class="line"><span>            def mask_text(text)</span></span>
<span class="line"><span>                return text unless text.is_a?(String)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                text = text.gsub(/\\b(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b/, &quot;***.***.***.***&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                text = text.gsub(/(1[3-9]\\d)(\\d{4})(\\d{4})/, &quot;\\\\1****\\\\3&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                text = text.gsub(/\\+(\\d{1,3})[-.]?(\\d{3,6})(\\d{2,4})(\\d{2,4})\\b/) { &quot;+#{$1}#{$2}****#{$4}&quot; }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                text = text.gsub(/(\\d{6})\\d{8}(\\d{4})/, &quot;\\\\1********\\\\2&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                text = text.gsub(/([a-zA-Z0-9])([a-zA-Z0-9._%+-]*)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})/, &quot;\\\\1****@\\\\3&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                text = text.gsub(/(\\d{6})\\d{4,10}(\\d{4})/, &quot;\\\\1********\\\\2&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                text = text.gsub(/([0-9A-HJ-NPQRTUWXY]{6})[0-9A-HJ-NPQRTUWXY]{10}([0-9A-HJ-NPQRTUWXY]{2})/, &quot;\\\\1**********\\\\2&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                text</span></span>
<span class="line"><span>            end</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            def deep_mask(obj)</span></span>
<span class="line"><span>                case obj</span></span>
<span class="line"><span>                when Hash</span></span>
<span class="line"><span>                    obj.transform_values { |v| deep_mask(v) }</span></span>
<span class="line"><span>                when Array</span></span>
<span class="line"><span>                    obj.map { |v| deep_mask(v) }</span></span>
<span class="line"><span>                when String</span></span>
<span class="line"><span>                    s = obj.strip</span></span>
<span class="line"><span>                    if (s.start_with?(&quot;{&quot;) &amp;&amp; s.end_with?(&quot;}&quot;)) || (s.start_with?(&quot;[&quot;) &amp;&amp; s.end_with?(&quot;]&quot;))</span></span>
<span class="line"><span>                        begin</span></span>
<span class="line"><span>                            parsed_inner = JSON.parse(s)</span></span>
<span class="line"><span>                            masked_inner = deep_mask(parsed_inner)</span></span>
<span class="line"><span>                            JSON.generate(masked_inner)</span></span>
<span class="line"><span>                        rescue</span></span>
<span class="line"><span>                            mask_text(s) || s</span></span>
<span class="line"><span>                        end</span></span>
<span class="line"><span>                    else</span></span>
<span class="line"><span>                        mask_text(s) || s</span></span>
<span class="line"><span>                    end</span></span>
<span class="line"><span>                else</span></span>
<span class="line"><span>                    obj</span></span>
<span class="line"><span>                end</span></span>
<span class="line"><span>            end</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            original_msg = event.get(&quot;msg&quot;)</span></span>
<span class="line"><span>            if original_msg</span></span>
<span class="line"><span>                masked_msg = mask_text(original_msg.to_s)</span></span>
<span class="line"><span>                event.set(&quot;msg&quot;, masked_msg)</span></span>
<span class="line"><span>            end</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            parsed = event.get(&quot;parsed_msg&quot;)</span></span>
<span class="line"><span>            if parsed.is_a?(Hash) || parsed.is_a?(Array)</span></span>
<span class="line"><span>                begin</span></span>
<span class="line"><span>                    masked_parsed = deep_mask(parsed)</span></span>
<span class="line"><span>                    event.set(&quot;parsed_msg&quot;, masked_parsed)</span></span>
<span class="line"><span>                    event.set(&quot;msg&quot;, JSON.generate(masked_parsed))</span></span>
<span class="line"><span>                rescue =&gt; e</span></span>
<span class="line"><span>                    event.set(&quot;debug_ruby_error&quot;, &quot;Failed to re-serialize parsed_msg: #{e.message}&quot;)</span></span>
<span class="line"><span>                end</span></span>
<span class="line"><span>            end</span></span>
<span class="line"><span>        &#39;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    mutate {</span></span>
<span class="line"><span>        remove_tag =&gt; [ &quot;_not_json&quot; ]</span></span>
<span class="line"><span>        remove_field =&gt; [ &quot;timestamp&quot;, &quot;message&quot;, &quot;parsed_msg&quot;, &quot;event&quot;, &quot;score&quot;, &quot;tags&quot;, &quot;host&quot;, &quot;agent&quot;, &quot;ecs&quot;, &quot;input&quot;, &quot;log&quot; ]</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>output {</span></span>
<span class="line"><span>    elasticsearch {</span></span>
<span class="line"><span>        hosts =&gt; [&quot;http://elasticsearch:9200&quot;]</span></span>
<span class="line"><span>        index =&gt; &quot;app-logs-%{+YYYY.MM.dd}&quot;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    stdout {</span></span>
<span class="line"><span>        codec =&gt; rubydebug</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_4️⃣-最终方案-含注释说明-同时支持多种日志格式、任意内容方案" tabindex="-1"><a class="header-anchor" href="#_4️⃣-最终方案-含注释说明-同时支持多种日志格式、任意内容方案"><span>4️⃣ （最终方案，含注释说明）同时支持多种日志格式、任意内容方案</span></a></h4><div class="language-conf line-numbers-mode" data-highlighter="shiki" data-ext="conf" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-conf"><span class="line"><span># =================================</span></span>
<span class="line"><span># INPUT: 接受 Filebeat 发送过来的日志数据</span></span>
<span class="line"><span># =================================</span></span>
<span class="line"><span>input {</span></span>
<span class="line"><span>    beats {</span></span>
<span class="line"><span>        port =&gt; 5044    # 监听 5044 端口，接受来自 Filebeat 的日志数据</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span># =================================</span></span>
<span class="line"><span># FILTER: 日志解析、标准化、清洗、脱敏等处理</span></span>
<span class="line"><span># =================================</span></span>
<span class="line"><span>filter {</span></span>
<span class="line"><span>    # 初始标记：假设所有日志格式都不匹配，后续通过 grok 成功则移除此标签</span></span>
<span class="line"><span>    mutate {</span></span>
<span class="line"><span>        add_tag =&gt; [&quot;_log_format_unmatched&quot;]</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    # =================================</span></span>
<span class="line"><span>    # 尝试解析日志格式 1</span></span>
<span class="line"><span>    #</span></span>
<span class="line"><span>    # 日志格式1：%d{\${LOG_DATEFORMAT_PATTERN:-yyyy-MM-dd HH:mm:ss.SSS}} | \${LOG_LEVEL_PATTERN:-%5p} \${PID:- } | %thread [%tid] %-40.40logger{39} - [%method,%line] | %m%n\${LOG_EXCEPTION_CONVERSION_WORD:-%wEx}</span></span>
<span class="line"><span>    # 标准 Java日志，含 PID、TID、线程名、类名、方法名、行号等信息</span></span>
<span class="line"><span>    # =================================</span></span>
<span class="line"><span>    if &quot;_log_format_unmatched&quot; in [tags] {</span></span>
<span class="line"><span>        grok {</span></span>
<span class="line"><span>            # grok 格式匹配解析</span></span>
<span class="line"><span>            match =&gt; {</span></span>
<span class="line"><span>                &quot;message&quot; =&gt; &quot;%{TIMESTAMP_ISO8601:timestamp}%{SPACE}\\|%{SPACE}%{LOGLEVEL:level}%{SPACE}%{NUMBER:pid:int}%{SPACE}\\|%{SPACE}%{DATA:thread_name}%{SPACE}\\[TID:%{DATA:tid}\\]%{SPACE}%{DATA:logger}%{SPACE}\\-%{SPACE}\\[%{DATA:method},%{NUMBER:line:int}\\]%{SPACE}\\|%{SPACE}%{GREEDYDATA:msg}&quot;</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>            tag_on_failure =&gt; [&quot;_grok_fmt1_fail&quot;]       # 匹配失败时打上失败标签</span></span>
<span class="line"><span>            remove_tag =&gt; [&quot;_log_format_unmatched&quot;]     # 匹配成功则移除“未匹配”标签</span></span>
<span class="line"><span>            add_tag =&gt; [&quot;_format_type_1&quot;]               # 标记成功匹配的格式：格式1</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    # =================================</span></span>
<span class="line"><span>    # 尝试解析日志格式 2</span></span>
<span class="line"><span>    #</span></span>
<span class="line"><span>    # 日志格式2：%d{yyyy-MM-dd HH:mm:ss.SSS} [%-5level] from %logger{36} in %thread - %msg%n</span></span>
<span class="line"><span>    # 简化日志，无 PID/TID/方法行号等，含 “from ... in ...” 结构</span></span>
<span class="line"><span>    # =================================</span></span>
<span class="line"><span>    if &quot;_log_format_unmatched&quot; in [tags] {</span></span>
<span class="line"><span>        grok {</span></span>
<span class="line"><span>            match =&gt; {</span></span>
<span class="line"><span>                &quot;message&quot; =&gt; &quot;%{TIMESTAMP_ISO8601:timestamp}%{SPACE}\\[%{LOGLEVEL:level}%{SPACE}\\]%{SPACE}from%{SPACE}%{JAVACLASS:logger}%{SPACE}in%{SPACE}%{DATA:thread_name}%{SPACE}-%{SPACE}%{GREEDYDATA:msg}&quot;</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>            tag_on_failure =&gt; [&quot;_grok_fmt2_fail&quot;]</span></span>
<span class="line"><span>            remove_tag =&gt; [&quot;_log_format_unmatched&quot;]</span></span>
<span class="line"><span>            add_tag =&gt; [&quot;_format_type_2&quot;]</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    # =================================</span></span>
<span class="line"><span>    # 尝试解析日志格式 3</span></span>
<span class="line"><span>    #</span></span>
<span class="line"><span>    # 日志格式3：%d{yyyy-MM-dd HH:mm:ss.SSS} [%-5level] [%thread] [%logger{50}] %file:%line - %msg%n</span></span>
<span class="line"><span>    # 含 [线程][类] class:line 结构</span></span>
<span class="line"><span>    # =================================</span></span>
<span class="line"><span>    if &quot;_log_format_unmatched&quot; in [tags] {</span></span>
<span class="line"><span>        grok {</span></span>
<span class="line"><span>            match =&gt; {</span></span>
<span class="line"><span>                &quot;message&quot; =&gt; &quot;%{TIMESTAMP_ISO8601:timestamp}%{SPACE}\\[%{LOGLEVEL:level} %{SPACE}\\]%{SPACE}\\[%{DATA:thread_name}\\]%{SPACE}\\[%{JAVACLASS:logger}\\]%{SPACE}%{DATA:class}:%{NUMBER:line:int}%{SPACE}-%{SPACE}%{GREEDYDATA:msg}&quot;</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>            tag_on_failure =&gt; [&quot;_grok_fmt3_fail&quot;]</span></span>
<span class="line"><span>            remove_tag =&gt; [&quot;_log_format_unmatched&quot;]</span></span>
<span class="line"><span>            add_tag =&gt; [&quot;_format_type_3&quot;]</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    # =================================</span></span>
<span class="line"><span>    # 尝试解析日志格式 4</span></span>
<span class="line"><span>    #</span></span>
<span class="line"><span>    # 日志格式4：%d{yyyy-MM-dd HH:mm:ss.SSS} [%-5level] [%thread] %logger{20} - [%method,%line] - %msg%n</span></span>
<span class="line"><span>    # 含 [线程]类 - [方法,行号] 结构</span></span>
<span class="line"><span>    # =================================</span></span>
<span class="line"><span>    if &quot;_log_format_unmatched&quot; in [tags] {</span></span>
<span class="line"><span>        grok {</span></span>
<span class="line"><span>            match =&gt; {</span></span>
<span class="line"><span>                &quot;message&quot; =&gt; &quot;%{TIMESTAMP_ISO8601:timestamp}%{SPACE}\\[%{LOGLEVEL:level} %{SPACE}\\]%{SPACE}\\[%{DATA:thread_name}\\]%{SPACE}%{JAVACLASS:logger}%{SPACE}-%{SPACE}\\[%{DATA:method},%{NUMBER:line:int}\\]%{SPACE}-%{SPACE}%{GREEDYDATA:msg}&quot;</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>            tag_on_failure =&gt; [&quot;_grok_fmt4_fail&quot;]</span></span>
<span class="line"><span>            remove_tag =&gt; [&quot;_log_format_unmatched&quot;]</span></span>
<span class="line"><span>            add_tag =&gt; [&quot;_format_type_4&quot;]</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    # =================================</span></span>
<span class="line"><span>    # 尝试解析日志格式 5</span></span>
<span class="line"><span>    #</span></span>
<span class="line"><span>    # 日志格式5：%d{yyyy-MM-dd HH:mm:ss.SSS} [%-5level] [%logger{50}] %file:%line - %msg%n</span></span>
<span class="line"><span>    # 无线程名，只有 [类] class:line 结构</span></span>
<span class="line"><span>    # =================================</span></span>
<span class="line"><span>    if &quot;_log_format_unmatched&quot; in [tags] {</span></span>
<span class="line"><span>        grok {</span></span>
<span class="line"><span>            match =&gt; {</span></span>
<span class="line"><span>                &quot;message&quot; =&gt; &quot;%{TIMESTAMP_ISO8601:timestamp}%{SPACE}\\[%{LOGLEVEL:level} %{SPACE}\\]%{SPACE}\\[%{JAVACLASS:logger}\\]%{SPACE}%{DATA:class}:%{NUMBER:line:int}%{SPACE}-%{SPACE}%{GREEDYDATA:msg}&quot;</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>            tag_on_failure =&gt; [&quot;_grok_fmt5_fail&quot;]</span></span>
<span class="line"><span>            remove_tag =&gt; [&quot;_log_format_unmatched&quot;]</span></span>
<span class="line"><span>            add_tag =&gt; [&quot;_format_type_5&quot;]</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    # =================================</span></span>
<span class="line"><span>    # 最终兜底：如果以上所有日志格式都没有匹配成功，则使用默认字段进行填充</span></span>
<span class="line"><span>    # =================================</span></span>
<span class="line"><span>    if &quot;_log_format_unmatched&quot; in [tags] {</span></span>
<span class="line"><span>        mutate {</span></span>
<span class="line"><span>            add_field =&gt; {</span></span>
<span class="line"><span>                &quot;msg&quot; =&gt; &quot;%{message}&quot;           # 原始消息作为 msg</span></span>
<span class="line"><span>                &quot;logger&quot; =&gt; &quot;unknown&quot;</span></span>
<span class="line"><span>                &quot;thread_name&quot; =&gt; &quot;unknown&quot;</span></span>
<span class="line"><span>                &quot;method&quot; =&gt; &quot;unknown&quot;</span></span>
<span class="line"><span>                &quot;class&quot; =&gt; &quot;unknown&quot;</span></span>
<span class="line"><span>                &quot;line&quot; =&gt; &quot;0&quot;</span></span>
<span class="line"><span>                &quot;pid&quot; =&gt; &quot;0&quot;</span></span>
<span class="line"><span>                &quot;tid&quot; =&gt; &quot;unknown&quot;</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>            add_tag =&gt; [&quot;_format_type_unknown&quot;]</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    # =================================</span></span>
<span class="line"><span>    # 字段标准化：确保关键字段存在且合法</span></span>
<span class="line"><span>    # =================================</span></span>
<span class="line"><span>    mutate {</span></span>
<span class="line"><span>        strip =&gt; [&quot;tid&quot;, &quot;logger&quot;]</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    # pid 必须是数字，否则设为 0</span></span>
<span class="line"><span>    if ![pid] or [pid] == &quot;&quot; or [pid] =~ /^[^0-9]+$/ {</span></span>
<span class="line"><span>        mutate { </span></span>
<span class="line"><span>            remove_field =&gt; [ &quot;pid&quot; ]</span></span>
<span class="line"><span>            add_field =&gt; { &quot;pid&quot; =&gt; &quot;0&quot; } </span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    # thread_name 不能为空，否则设为 &quot;unknown&quot;</span></span>
<span class="line"><span>    if ![thread_name] or [thread_name] == &quot;&quot; {</span></span>
<span class="line"><span>        mutate { </span></span>
<span class="line"><span>            remove_field =&gt; [ &quot;thread_name&quot; ]</span></span>
<span class="line"><span>            add_field =&gt; { &quot;thread_name&quot; =&gt; &quot;unknown&quot; } </span></span>
<span class="line"><span>        }  </span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if ![tid] or [tid] == &quot;&quot; {</span></span>
<span class="line"><span>        mutate { </span></span>
<span class="line"><span>            remove_field =&gt; [ &quot;tid&quot; ]</span></span>
<span class="line"><span>            add_field =&gt; { &quot;tid&quot; =&gt; &quot;unknown&quot; } </span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if ![method] or [method] == &quot;&quot; {</span></span>
<span class="line"><span>        mutate { </span></span>
<span class="line"><span>            remove_field =&gt; [ &quot;method&quot; ]</span></span>
<span class="line"><span>            add_field =&gt; { &quot;method&quot; =&gt; &quot;unknown&quot; } </span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if ![line] or [line] == &quot;&quot; or [line] =~ /^[^0-9]+$/ {</span></span>
<span class="line"><span>        mutate { </span></span>
<span class="line"><span>            remove_field =&gt; [ &quot;line&quot; ]</span></span>
<span class="line"><span>            add_field =&gt; { &quot;line&quot; =&gt; &quot;0&quot; } </span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if ![logger] or [logger] == &quot;&quot; {</span></span>
<span class="line"><span>        mutate { </span></span>
<span class="line"><span>            remove_field =&gt; [ &quot;logger&quot; ]</span></span>
<span class="line"><span>            add_field =&gt; { &quot;logger&quot; =&gt; &quot;unknown&quot; } </span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    # =================================</span></span>
<span class="line"><span>    # 时间解析：将日志中的 timestamp 字段转换为 @timestamp 标准时间字段</span></span>
<span class="line"><span>    # =================================</span></span>
<span class="line"><span>    date {</span></span>
<span class="line"><span>        match =&gt; [ &quot;timestamp&quot;, &quot;yyyy-MM-dd HH:mm:ss.SSS&quot; ]     # 支持毫秒级别时间</span></span>
<span class="line"><span>        target =&gt; &quot;@timestamp&quot;</span></span>
<span class="line"><span>        timezone =&gt; &quot;Asia/Shanghai&quot;                             # 设置时区为中国时区</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    # =================================</span></span>
<span class="line"><span>    # JSON自动解析：如果 msg 字段是 JSON 格式，则解析为结构化数据</span></span>
<span class="line"><span>    # =================================</span></span>
<span class="line"><span>    if [msg] =~ /^(\\{|\\[)/ {</span></span>
<span class="line"><span>        json {</span></span>
<span class="line"><span>            source =&gt; &quot;msg&quot;                         # 从 msg 字段读取</span></span>
<span class="line"><span>            target =&gt; &quot;parsed_msg&quot;                  # 解析结果存放到 parsed_msg 字段</span></span>
<span class="line"><span>            tag_on_failure =&gt; [ &quot;_not_json&quot; ]       # 如果解析失败，打上失败标签</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    # =================================</span></span>
<span class="line"><span>    # 敏感信息脱敏处理（IP、手机号、身份证、银行卡号、企业信用代码、邮箱等）</span></span>
<span class="line"><span>    # 使用 Ruby 脚本进行深度递归处理，处理原始 msg 字段和解析后的 parsed_msg 字段</span></span>
<span class="line"><span>    # =================================</span></span>
<span class="line"><span>    ruby {</span></span>
<span class="line"><span>        code =&gt; &#39;</span></span>
<span class="line"><span>            # 单层文本脱敏函数</span></span>
<span class="line"><span>            def mask_text(text)</span></span>
<span class="line"><span>                # 对函数的输入参数进行校验，如果不是 String 字符，则直接返回，不进行函数处理</span></span>
<span class="line"><span>                return text unless text.is_a?(String)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                # 脱敏 IP 地址：格式 127.0.0.1 ==&gt; ***.***.***.***</span></span>
<span class="line"><span>                text = text.gsub(/\\b(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b/, &quot;***.***.***.***&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                # 脱敏国内手机号：格式 13812345678 ==&gt; 138****5678</span></span>
<span class="line"><span>                text = text.gsub(/(1[3-9]\\d)(\\d{4})(\\d{4})/, &quot;\\\\1****\\\\3&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                # 脱敏国际手机号：格式 +8613812345678 或 +86-13812345678 ==&gt; +86****5678</span></span>
<span class="line"><span>                text = text.gsub(/\\+(\\d{1,3})[-.]?(\\d{3,6})(\\d{2,4})(\\d{2,4})\\b/) { &quot;+#{$1}#{$2}****#{$4}&quot; }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                # 脱敏身份证号：格式 110101199001011234 ==&gt; 110101********1234</span></span>
<span class="line"><span>                text = text.gsub(/(\\d{6})\\d{8}(\\d{4})/, &quot;\\\\1********\\\\2&quot;)</span></span>
<span class="line"><span>                </span></span>
<span class="line"><span>                # 脱敏邮箱地址：格式 hamster@niu.com ==&gt; ham****@niu.com</span></span>
<span class="line"><span>                text = text.gsub(/([a-zA-Z0-9])([a-zA-Z0-9._%+-]*)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})/, &quot;\\\\1****@\\\\3&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                # 脱敏银行卡号：格式 6222021234567890123 ==&gt; 622202**********0123</span></span>
<span class="line"><span>                text = text.gsub(/(\\d{6})\\d{4,10}(\\d{4})/, &quot;\\\\1********\\\\2&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                # 脱敏统一社会信用代码：格式 91330106563412345A ==&gt; 913301**********45A</span></span>
<span class="line"><span>                text = text.gsub(/([0-9A-HJ-NPQRTUWXY]{6})[0-9A-HJ-NPQRTUWXY]{10}([0-9A-HJ-NPQRTUWXY]{2})/, &quot;\\\\1**********\\\\2&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                text</span></span>
<span class="line"><span>            end</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            # 深度递归脱敏函数：支持嵌套 JSON 对象/数组</span></span>
<span class="line"><span>            def deep_mask(obj)</span></span>
<span class="line"><span>                case obj</span></span>
<span class="line"><span>                # 当对象是 Hash 时，递归处理每个键值对</span></span>
<span class="line"><span>                when Hash</span></span>
<span class="line"><span>                    obj.transform_values { |v| deep_mask(v) }</span></span>
<span class="line"><span>                # 当对象是 Array 时，递归处理每个元素</span></span>
<span class="line"><span>                when Array</span></span>
<span class="line"><span>                    obj.map { |v| deep_mask(v) }</span></span>
<span class="line"><span>                # 当对象是 String 时，先尝试解析为 JSON，如果成功则递归处理，否则直接脱敏文本</span></span>
<span class="line"><span>                when String</span></span>
<span class="line"><span>                    s = obj.strip</span></span>
<span class="line"><span>                    # 如果字符串是 JSON 格式，则尝试解析后脱敏再序列化回字符串</span></span>
<span class="line"><span>                    if (s.start_with?(&quot;{&quot;) &amp;&amp; s.end_with?(&quot;}&quot;)) || (s.start_with?(&quot;[&quot;) &amp;&amp; s.end_with?(&quot;]&quot;))</span></span>
<span class="line"><span>                        begin</span></span>
<span class="line"><span>                            parsed_inner = JSON.parse(s)</span></span>
<span class="line"><span>                            masked_inner = deep_mask(parsed_inner)</span></span>
<span class="line"><span>                            JSON.generate(masked_inner)</span></span>
<span class="line"><span>                        rescue</span></span>
<span class="line"><span>                            mask_text(s) || s</span></span>
<span class="line"><span>                        end</span></span>
<span class="line"><span>                    else</span></span>
<span class="line"><span>                        mask_text(s) || s</span></span>
<span class="line"><span>                    end</span></span>
<span class="line"><span>                else</span></span>
<span class="line"><span>                    obj</span></span>
<span class="line"><span>                end</span></span>
<span class="line"><span>            end</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            # 处理原始 msg 字段</span></span>
<span class="line"><span>            original_msg = event.get(&quot;msg&quot;)</span></span>
<span class="line"><span>            if original_msg</span></span>
<span class="line"><span>                masked_msg = mask_text(original_msg.to_s)</span></span>
<span class="line"><span>                event.set(&quot;msg&quot;, masked_msg)</span></span>
<span class="line"><span>            end</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            # 处理解析后的 parsed_msg 字段</span></span>
<span class="line"><span>            parsed = event.get(&quot;parsed_msg&quot;)</span></span>
<span class="line"><span>            if parsed.is_a?(Hash) || parsed.is_a?(Array)</span></span>
<span class="line"><span>                begin</span></span>
<span class="line"><span>                    masked_parsed = deep_mask(parsed)</span></span>
<span class="line"><span>                    event.set(&quot;parsed_msg&quot;, masked_parsed)</span></span>
<span class="line"><span>                    # 将脱敏后的结构重新序列化为字符串，覆盖原始 msg 字段</span></span>
<span class="line"><span>                    event.set(&quot;msg&quot;, JSON.generate(masked_parsed))</span></span>
<span class="line"><span>                rescue =&gt; e</span></span>
<span class="line"><span>                    event.set(&quot;debug_ruby_error&quot;, &quot;Failed to re-serialize parsed_msg: #{e.message}&quot;)</span></span>
<span class="line"><span>                end</span></span>
<span class="line"><span>            end</span></span>
<span class="line"><span>        &#39;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    # =================================</span></span>
<span class="line"><span>    # 清理临时标签和字段</span></span>
<span class="line"><span>    # =================================</span></span>
<span class="line"><span>    mutate {</span></span>
<span class="line"><span>        # 移除所有中间处理标签</span></span>
<span class="line"><span>        remove_tag =&gt; [ &quot;_not_json&quot;, &quot;_grok_fmt1_fail&quot;, &quot;_grok_fmt2_fail&quot;, &quot;_grok_fmt3_fail&quot;, &quot;_grok_fmt4_fail&quot;, &quot;_grok_fmt5_fail&quot; ]</span></span>
<span class="line"><span>        # 移除不需要存储到 Elasticsearch 的字段（节省空间、避免冲突）</span></span>
<span class="line"><span>        remove_field =&gt; [ </span></span>
<span class="line"><span>            &quot;timestamp&quot;,    # 已转为 @timestamp</span></span>
<span class="line"><span>            &quot;message&quot;,      # 原始消息，已解析到 msg 字段</span></span>
<span class="line"><span>            &quot;parsed_msg&quot;,   # 中间解析字段，已脱敏覆后合并到 msg 字段</span></span>
<span class="line"><span>            &quot;event&quot;, &quot;score&quot;, &quot;tags&quot;, &quot;@metadata&quot;, &quot;host&quot;, &quot;agent&quot;, &quot;ecs&quot;, &quot;input&quot;, &quot;log&quot;   # Filebeat 相关元数据字段</span></span>
<span class="line"><span>        ]</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span># =================================</span></span>
<span class="line"><span># OUTPUT: 将处理后的日志数据发送到 Elasticsearch 和控制台</span></span>
<span class="line"><span># =================================</span></span>
<span class="line"><span>output {</span></span>
<span class="line"><span>    elasticsearch {</span></span>
<span class="line"><span>        hosts =&gt; [&quot;http://elasticsearch:9200&quot;]</span></span>
<span class="line"><span>        index =&gt; &quot;app-logs-%{+YYYY.MM.dd}&quot;      # 按天分索引</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    # DUBUG: 输出到控制台，便于调试查看（开发/测试 使用）</span></span>
<span class="line"><span>    stdout {</span></span>
<span class="line"><span>        codec =&gt; rubydebug</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="四、最终效果" tabindex="-1"><a class="header-anchor" href="#四、最终效果"><span>四、最终效果</span></a></h3><figure><img src="https://cdn.jsdelivr.net/gh/witty-hamster/oss@master/202511/image-20251114132831315.png" alt="image-20251114132831315" tabindex="0" loading="lazy"><figcaption>image-20251114132831315</figcaption></figure><figure><img src="https://cdn.jsdelivr.net/gh/witty-hamster/oss@master/202511/image-20251114132831320.png" alt="image-20251114132831320" tabindex="0" loading="lazy"><figcaption>image-20251114132831320</figcaption></figure>`,149)]))}const r=n(e,[["render",p]]),h=JSON.parse('{"path":"/posts/%E6%94%B6%E9%9B%86%E7%AE%B1/%E5%9F%BA%E4%BA%8E%20ELK%20_%20Filebeat%20%E5%AE%9E%E7%8E%B0%E6%97%A5%E5%BF%97%E9%87%87%E9%9B%86%E6%96%B9%E6%A1%88.html","title":"基于 ELK + Filebeat 搭建并实现日志采集框架方案及日志脱敏","lang":"zh-CN","frontmatter":{"title":"基于 ELK + Filebeat 搭建并实现日志采集框架方案及日志脱敏","icon":"noto-v1:hatching-chick","date":"2025-11-14T00:00:00.000Z","order":1,"category":["收集箱"],"tags":["ELK","Filebeat"],"star":true,"sticky":false,"description":"🔔 ELK + Filebeat 功能详解 💡 ELK（Elasticsearch + Logstash + Kibana）、Filebeat 是 日志收集、处理、存储与可视化 的经典技术栈，广泛用于分布式系统的可观测性建设 一、整体架构概览 ✅ 现代实践中，Filebeat 可直接写入 Elasticsearch，绕过 Logstash（性能更高...","head":[["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"基于 ELK + Filebeat 搭建并实现日志采集框架方案及日志脱敏\\",\\"image\\":[\\"https://cdn.jsdelivr.net/gh/witty-hamster/oss@master/202511/image-20251114132831315.png\\",\\"https://cdn.jsdelivr.net/gh/witty-hamster/oss@master/202511/image-20251114132831320.png\\"],\\"datePublished\\":\\"2025-11-14T00:00:00.000Z\\",\\"dateModified\\":\\"2025-11-14T05:41:26.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"Hamster\\",\\"url\\":\\"https://witty-hamster.github.io\\"}]}"],["meta",{"property":"og:url","content":"https://witty-hamster.github.io/posts/%E6%94%B6%E9%9B%86%E7%AE%B1/%E5%9F%BA%E4%BA%8E%20ELK%20_%20Filebeat%20%E5%AE%9E%E7%8E%B0%E6%97%A5%E5%BF%97%E9%87%87%E9%9B%86%E6%96%B9%E6%A1%88.html"}],["meta",{"property":"og:title","content":"基于 ELK + Filebeat 搭建并实现日志采集框架方案及日志脱敏"}],["meta",{"property":"og:description","content":"🔔 ELK + Filebeat 功能详解 💡 ELK（Elasticsearch + Logstash + Kibana）、Filebeat 是 日志收集、处理、存储与可视化 的经典技术栈，广泛用于分布式系统的可观测性建设 一、整体架构概览 ✅ 现代实践中，Filebeat 可直接写入 Elasticsearch，绕过 Logstash（性能更高..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:image","content":"https://cdn.jsdelivr.net/gh/witty-hamster/oss@master/202511/image-20251114132831315.png"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2025-11-14T05:41:26.000Z"}],["meta",{"property":"article:tag","content":"Filebeat"}],["meta",{"property":"article:tag","content":"ELK"}],["meta",{"property":"article:published_time","content":"2025-11-14T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2025-11-14T05:41:26.000Z"}]]},"git":{"createdTime":1763098619000,"updatedTime":1763098886000,"contributors":[{"name":"guodong","username":"guodong","email":"cuiguodong_2012@163.com","commits":1,"url":"https://github.com/guodong"},{"name":"hamster","username":"hamster","email":"cuiguodong_2012@163.com","commits":1,"url":"https://github.com/hamster"}]},"readingTime":{"minutes":22.88,"words":6865},"filePathRelative":"posts/收集箱/基于 ELK + Filebeat 实现日志采集方案.md","excerpt":"<h2>🔔 ELK + Filebeat 功能详解</h2>\\n<blockquote>\\n<p>💡 <strong>ELK（Elasticsearch +  Logstash + Kibana）、Filebeat</strong> 是 <strong>日志收集、处理、存储与可视化</strong> 的经典技术栈，广泛用于分布式系统的可观测性建设</p>\\n</blockquote>\\n<h3>一、整体架构概览</h3>\\n<div class=\\"language-text line-numbers-mode\\" data-highlighter=\\"shiki\\" data-ext=\\"text\\" style=\\"--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34\\"><pre class=\\"shiki shiki-themes one-light one-dark-pro vp-code\\"><code class=\\"language-text\\"><span class=\\"line\\"><span>[应用系统]</span></span>\\n<span class=\\"line\\"><span>     ↓ (输出日志)</span></span>\\n<span class=\\"line\\"><span>[Filebeat] → [Logstash] → [Elasticsearch] → [Kibana]</span></span>\\n<span class=\\"line\\"><span>     ↑           ↑</span></span>\\n<span class=\\"line\\"><span>   轻量采集    过滤/解析/丰富</span></span></code></pre>\\n<div class=\\"line-numbers\\" aria-hidden=\\"true\\" style=\\"counter-reset:line-number 0\\"><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div></div></div>","autoDesc":true}');export{r as comp,h as data};
