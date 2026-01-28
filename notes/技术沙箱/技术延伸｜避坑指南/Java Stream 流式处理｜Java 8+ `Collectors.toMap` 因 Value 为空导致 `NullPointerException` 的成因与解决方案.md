
# Java 8+ `Collectors.toMap` 因 Value 为空导致 `NullPointerException` 的成因与解决方案
> [!note] 问题延展
> - **开发实战类**：`Stream.collect` 转 Map 时处理 `null` 值的几种优雅姿势
> - **避坑指南类**：为什么 `Collectors.toMap` 不允许 Value 为 `null`？（深度源码分析）
> - **快速查阅类**：Java `toMap` NPE 异常修复：处理 `value` 为空的情况

## 问题描述
- 将一个 List 集合通过流式处理方式，选取其中的某两个字段组合生成映射 Map 集时，由于作为 value 值的字段出现 null 的情形，导致转换过程产生 `java.lang.NullPointerException` 空指针异常问题
## 异常示例代码
- 示例代码中 `BusinessData::getFinishedItemCodes` 存在 null 的情况，从而导致整体转换过程失败，出现空指针异常

```java
	List<BusinessData> items = businessDataMapper.selectDataMapping(queryDTO);  
	if (CollectionUtils.isEmpty(items)) {  
	    return Collections.emptyMap();  
	}  
	return items.stream()  
	        .collect(Collectors.toMap(  
	                BusinessData::getItemCode,
	                BusinessData::getFinishedItemCodes,
	                (v1, v2) -> v1  
	        ));
```

## 问题分析
- 在 JDK8 到 JDK21 的所有标准实现中，`Collectors.toMap` 底层使用了 `Map.merge` 方法，而该方法对 `value` 值是否为 `null` 有着极为严格的检查
- 为什么会报出 `NullPointerException` 呢？**通过底层逻辑进行分析**
	- 当你调用 `Collectors.toMap` 时，它内部的执行逻辑如下：
		- 1️⃣ 流中的每一个元素都被提取出 `key` 和 `value`
		- 2️⃣ 调用 `map.merge(key, value, mergeFunction)` 方法
		- 3️⃣ **「关键点」**：`map.merge` 的源码中第一行通常就是如下的代码：
```java
// 如果 getFinishedItemCodes 返回 null，直接在这里崩掉，会报出空指针异常
Objects.requireNonNull(value);
```
> 注意：即使你写了合并函数 `(v1, v2) -> v1`，但这也救不了这个异常情况，因为程序在执行合并逻辑之前就已经因为 `value` 为 `null` 而触发了 `requireNonNull` 检查。

## 解决方案
> [!note] 优雅的解决方式
> 查看下面的方案

### 方案A：使用 `Optional` 或 `Objects.requireNonNullElse`
 > 如果你希望即便值为 `null` 也能存入一个默认值（如空字符串），那么下面的方式将是最高效的办法

采用 `Optional` 方式进行判断处理：
 ```java
 items.stream()  
        .collect(Collectors.toMap(  
                BusinessData::getItemCode,
                item -> Optional.ofNullable(item.getFinishedItemCodes()).orElse(""),  
                (v1, v2) -> v1
        ));
 ```

采用 `Objects.requireNonNullElse` 方式进行判断处理：
```java
items.stream()  
        .collect(Collectors.toMap(  
                BusinessData::getItemCode,
                item -> Objects.requireNonNullElse(item.getFinishedItemCodes(), ""),  
                (v1, v2) -> v1
        ));
```

### 方案B：过滤掉值为 `null` 的数据
> 如果你根本不想把 `null` 值的项存入 Map，直接在流上加上 `filter` 进行过滤

```java
items.stream()  
		.filter(item -> item.getFinishedItemCodes() != null)
		.collect(Collectors.toMap(  
				BusinessData::getItemCode,
				BusinessData::getFinishedItemCodes,
				(v1, v2) -> v1  
		));
```

### 方案C：适用 `collect(Supplier, BiConsumer, BiConsumer)`
> 如果你必须要在 Map 中保留 `null` 值，你需要跳过 `Collectors.toMap` 这个封装，直接手动写入

```java
Map<String, String> map = items.stream()
	.collect(
		HashMap::new,
		(m, v) -> m.put(v.getItemCode, v.getFinishedItemCodes()),
		HashMap::putAll
	);
```

##  防御性编程建议
- **原则**：永远不要假设 `Collectors.toMap` 的 Value 会非空。
- **性能**：方案 A 和 B 在 JDK 21 中由于虚拟线程和优化后的流水线，性能几乎没有损耗，建议优先使用。