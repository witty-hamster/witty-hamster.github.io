
> [!NOTE] 统计的前提
> 统计空间大小需要访问 MySQL 的元数据表 `information_schema.tables`

## 从三个维度进行统计
### 维度指标
- 数据内容的大小
- 索引的大小
- 碎片空间（Data Free）

### 统计方式
#### 方式一：查询指定表的大小
> 以下 SQL 将计算指定数据库中某张表的总大小（包含数据和索引），并将其转换为 GB 单位。
```sql
SELECT TABLE_NAME                                                    AS `表名`,  
       ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024 / 1024), 2) AS `总大小(GB)`,  
       ROUND(((DATA_LENGTH) / 1024 / 1024 / 1024), 2)                AS `数据大小(GB)`,  
       ROUND(((INDEX_LENGTH) / 1024 / 1024 / 1024), 2)               AS `索引大小(GB)`,  
       ROUND(((DATA_FREE) / 1024 / 1024 / 1024), 2)                  AS `空间碎片(GB)`  
FROM information_schema.TABLES  
WHERE TABLE_SCHEMA = '你的数据库名'  
  AND TABLE_NAME = '你的表名';
```

#### 方式二：查询数据库内所有表的大小排行
> 以下 SQL 能够展现出数据库中每张表的容量信息，在进行容量规划时，可通过该 SQL 定位到哪个表是 “存储大户”
```sql
SELECT TABLE_NAME                                                    AS `表名`,  
       ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024 / 1024), 2) AS `总大小(GB)`  
FROM information_schema.TABLES  
WHERE TABLE_SCHEMA = '你的数据库名'  
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;
```

## 架构层面的深度洞察
在分析表大小时，不能单纯的只关注于数字，还要考虑背后的物理结构
#### 1、索引与数据的比例
- 如果 `index_length` 接近甚至超过了 `data_length`，这通常意味着该表存在 **过度索引** 的情况。
- 在百万级以上的架构中，这种现象会严重拖慢 `INSERT` 和 `UPDATE` 的速度。

#### 2、数据碎片（Data_free）的问题
- MySQL InnoDB 引擎使用页（Page）管理空间。当你频繁删除数据 `DELETE` 或更新变成字段时，磁盘空间并不会立即归还给操作系统，而是留下 “空洞”，即 `data_free`（空间碎片）。
	- **后果**：即使表的数据量看起来不大，但占用的磁盘空间可能虚高
	- **对策**：如果 `data_free` 占比过高（例如超过 30%），建议执行 `OPTIMIZE TABLE 你的表名;` 来重新整理表空间，释放磁盘。

#### 3、数据量计算公式说明
在 SQL 中使用了如下逻辑进行换算：
$$
Total\_Size = \frac{Data\_Length + Index\_Length}{1024^3}
$$
公式说明：
- `Total_Size`：数据库中某张表的总数据量
- `Data_Length`：数据库中某张表的数据量
- `Index_Length`：数据库中某张表的索引量
- $1024^3$：是从 Bytes 转为 GB 的换算系数

#### 4、磁盘容量预警建议
在生产环境下，当单表物理大小超过 **50GB ~ 100GB** 时，你应该考虑以下架构优化手段：
- **分库分表**：降低单机存储压力
- **冷热数据分离**：将历史数据迁移至归档库（如使用压缩效率更高的 TokuDB 或归档引擎）
- **分区表（Partitioning）**：便于按时间维度快速清理或维护旧数据

