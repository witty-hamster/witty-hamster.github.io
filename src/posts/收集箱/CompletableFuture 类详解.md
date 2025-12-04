---
title: Java8 - CompletableFuture 异步编程核心工具类详解
icon: devicon:java-wordmark
date: 2025-12-04
category:
  - 收集箱
tags:
  - 异步&多线程
  - Java
star: false
sticky: false
---

## 概述

`CompletableFuture` 是 Java 8 引入的一个强大的工具类，用于支持 <b style="color:red;font-size:17px">异步编程</b> 和 <b style="color:red;font-size:17px">非阻塞式操作</b> 。它实现了 `Future` 和 `CompletionStage` 接口，不仅可以获取异步任务的结果（像 `Future` 一样），还能以声明式的方式对多个异步任务进行组合、链式调用、异常处理等操作。



## 一、核心特性

- **异步执行**：可以在后台线程中执行任务
- **结果设置**：可以手动完成一个 `CompletableFuture`
- **链式调用**：通过 `thenApply`、`thenAccept`、`thenRun` 等方法构建任务流水线
- **组合多个 Future**：如 `allOf`、`anyOf`
- **异常处理**：提供 `exceptionally`、`handle` 等方式处理异常
- **非阻塞**：避免了传统 `Future.get()` 的阻塞问题



## 二、常用静态工厂方法

> 用于创建 `CompletableFuture` 的方法，形式为： `public static <?> CompletableFuture<?> XXX() {}`

| 方法                                                         | 说明                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| `public static CompletableFuture<Void> runAsync(Runnable runnable)` | 异步执行无返回值任务，默认使用 `ForkJoinPool.commonPool()` 线程池 |
| `public static CompletableFuture<Void> runAsync(Runnable runnable, Executor executor)` | 异步执行无返回值任务，使用指定线程池执行                     |
| `public static <U> CompletableFuture<U> supplyAsync(Supplier<U> supplier)` | 异步执行有返回值任务，默认使用 `ForkJoinPool.commonPool()` 线程池 |
| `public static <U> CompletableFuture<U> supplyAsync(Supplier<U> supplier, Executor executor)` | 异步执行有返回值任务，使用指定线程池执行                     |
| `public static <U> CompletableFuture<U> completedFuture(U value)` | 创建一个已经完成的 `CompletableFuture`（立即可用）           |
| `public static CompletableFuture<Void> allOf(CompletableFuture<?>... cfs)` | 当所有给定的 `CompletableFuture` 完成时完成                  |
| `public static CompletableFuture<Object> anyOf(CompletableFuture<?>... cfs)` | 当任意一个 `CompletableFuture` 完成时完成                    |



## 三、核心方法详解

### 1. 设置结果（手动完成）

> 常用于手动控制 future 的完成状态

- `public boolean complete(T value)`

  如果尚未完成，则以给定值完成该 future，并返回 true；否则返回 false

- `public boolean completeExceptionally(Throwable ex)`

  以异常方式完成该 future



### 2. 获取结果（阻塞式或非阻塞式）

- `public T get()`：阻塞式直到完成（继承至 `Future`）
- `public T get(long timeout, TimeUnit unit)`：带超时的阻塞式
- `public T join()`：类似 `get()`，但不抛出受检异常（推荐在链式调用中使用）
- `public T getNow(T valueIfAbsent)`：如果已完成则返回结果，否则返回指定默认值（不阻塞）



### 3. 转换与消费（函数式链式调用）

> 这些方法返回新的 `CompletableFuture`，构成流水线

#### 3.1 转换结果（有输入有输出）

- `public <U> CompletableFuture<U> thenApply(Function<? super T,? extends U> fn)`

  当前阶段完成后，应用函数转换结果（同步执行在当前线程或完成线程）

- `public <U> CompletableFuture<U> thenApplyAsync(Function<? super T,? extends U> fn)`

  异步执行转换（使用默认线程池）

- `public <U> CompletableFuture<U> thenApplyAsync(Function<? super T,? extends U> fn, Executor executor)`

  异步执行转换（使用指定线程池）



#### 3.2 消费结果（有输入无输出）

- `public CompletableFuture<Void> thenAccept(Consumer<? super T> action)`

  消费结果，不返回新值（返回 `CompletableFuture<Void>`）

- `public CompletableFuture<Void> thenAcceptAsync(...)`

  异步版本



#### 3.3 无输入无输出（仅执行动作）

- `public CompletableFuture<Void> thenRun(Runnable action)`

  不关心前一步结果，只在前一步完成后执行

- `public CompletableFuture<Void> thenRunAsync(...)`

  异步版本



### 4. 异常处理

- `public CompletableFuture<T> exceptionally(Function<Throwable, ? extends T> fn)`

  仅在发生异常是调用，返回一个替代结果（类型必须与原 future 一致）

```java
CompletableFuture<String> cf = CompletableFuture.supplyAsync(() -> {
    throw new RuntimeException("error");
}).exceptionally(ex -> "defualt");
```



- `public <U> CompletableFuture<U> handle(BiFunction<? super T, Throwable, ? extends U> fn)`

  无论成功或失败都会调用，可同时访问结果和异常

```java
CompletableFuture.supplyAsync(() -> {
    throw new RuntimeException("error");
}).handle((result, ex) -> {
    if (ex != null) {
        return "error: " + ex.getMessage();
    } else {
        return result;
    }
})
```



- `public CompletableFuture<T> whenComplete(BiConsumer<? super T, ? super Throwable> action)`

  类似 `handle`，但不改变结果（返回原类型），仅用于副作用（如日志）



### 5. 组合多个 `CompletableFuture`

#### 5.1 顺序依赖

- `public <U> CompletableFuture<U> thenCompose(Function<? super T, ? extends CompletionStage<U>> fn)`

  用于扁平化嵌套的 `CompletableFuture`（类似 `flatMap`）

```java
CompletableFuture<String> cf1 = ...;
CompletableFuture<Integer> cf2 = cf1.thenCompose(s -> queryDb(s)); // queryDb 返回 CompletableFuture<Integer>
```



#### 5.2 并行组合（两个 future 同时进行）

- `public <U,V> CompletableFuture<V> thenCombine(CompletionStage<? extends U> other,BiFunction<? super T,? super U,? extends V> fn)`

  当两个 future 都完成后，合并它们的结果

```java
CompletableFuture<String> cf1 = ...;
CompletableFuture<Integer> cf2 = ...;
CompletableFuture<String> result = cf1.thenCombine(cf2, (s, i) -> s + i);
```



#### 5.3 多个 future 组合

- `public static CompletableFuture<Void> allOf(CompletableFuture<?>... cfs)`

  所有 future 完成后才完成，**不携带结果**（返回 `CompletableFuture<Void>`）

```java
CompletableFuture<Void> all = CompletableFuture.allOf(cf1, cf2, cf3);
all.join(); // 等待全部完成
```



- `public static CompletableFuture<Object> anyOf(CompletableFuture<?>... cfs)`

  任意一个完成即完成，返回 `CompletableFuture<Object>`（需强转）



### 6. 其他实用方法

- `public boolean isDone()`：是否已完成（正常或异常）
- `public boolean isCompletedExceptionally()`：是否因异常完成
- `public void obtrudeValue(T value) / public void obtrudeException(Throwable ex)`：强制覆盖结果（**不推荐生产使用**）



## 四、示例代码

```java
CompletableFuture<String> future = CompletableFuture
    .supplyAsync(() -> {
        System.out.println("Task running in " + Thread.currentThread().getName());
        return "Hello";
    })
    .thenApply(s -> s + " World")
    .thenApplyAsync(String::toUpperCase)
    .handle((result, ex) -> {
        if (ex != null) {
            return "Error occurred " + ex.getMessage();
        }
        return result;
    });
System.out.println(future.join());  // 输出 HELLO WORLD
```



## 五、使用建议

- **避免阻塞**：尽量使用 `join()` 而不是 `get()`（除非需要处理中断）。
- **指定线程池**：不要依赖默认的 `ForkJoinPool`，尤其在 I/O 密集型任务中。
- **异常处理**：始终考虑使用 `exceptionally` 或 `handle` 防止未处理异常导致静默失败。
- **链式优于嵌套**：使用 `thenCompose` 避免 `CompletableFuture<CompletableFuture<T>>`。
- **资源管理**：若使用自定义 `Executor`，注意生命周期管理（如关闭线程池）。