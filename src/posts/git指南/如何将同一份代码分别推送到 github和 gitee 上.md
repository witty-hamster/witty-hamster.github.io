---
title: 如何将同一份代码分别推送到 github 和 gitee 上
icon: bi:git
date: 2025-11-13
order: 1
star: true
sticky: true
category:
  - git使用技巧
tags:
  - git
---

# 如何将同一份代码分别推送到 github 和 gitee 上

## 为什么要双平台同步？

- Github：全球最大的开源社区，项目曝光率高
- Gitee：国内访问速度快
- 双保险：避免单一平台故障导致代码丢失

## 配置方案

### 方案一：多远程仓库配置（推荐新手）

- 适用场景：需要分别管理不同平台

```bash
# 添加 Github 远程仓库
git remote add github https://github.com/你的用户名/仓库名称.git

# 添加 Gitee 远程仓库
git remote add gitee https://gitee.com/你的用户名/仓库名称.git

# 查看配置结果
git remote -v

# 配置结果输出如下内容，说明配置正确（两个不同的远程管理源 github、gitee）
github  https://github.com/你的用户名/仓库名称.git (fetch)
github  https://github.com/你的用户名/仓库名称.git (push)
gitee   https://gitee.com/你的用户名/仓库名称.git (fetch)
gitee   https://gitee.com/你的用户名/仓库名称.git (push)
```

- 推送操作

```bash
# 推送到 Github
git push github master

# 推送到 Gitee
git push gitee master
```

- 拉取更新技巧

```bash
# 从指定平台拉取
git pull github master
git pull gitee master

# 合并多个源更新
git pull --all
```

### 方案二：单远程多 URL 配置（懒人必备）

- 适用场景：想一次推送完成多平台同步

```bash
# 初始化远程仓库（这里初始化的是 Github 远程仓库）
git remote add origin https://github.com/你的用户名/仓库名称.git

# 向名称为 origin 远程管理源中，添加 Gitee 远程仓库地址
git remote set-url -add origin https://gitee.com/你的用户名/仓库名称.git

# 查看配置结果
git remote -v

# 配置结果输出如下内容，说明配置正确（相同的远程仓库管理源 origin）
origin  https://github.com/你的用户名/仓库名称.git (fetch)
origin  https://github.com/你的用户名/仓库名称.git (push)
origin  https://gitee.com/你的用户名/仓库名称.git (push) # gitee 远程仓库仅设置了同步推送
```

- 一键推送

```bash
git push origin master
```

## 遇到同步冲突怎么办？

### 查看不一致情况

首先确认两个远程仓库的状态

```bash
# 获取 Github 远程仓库最新状态
git fetch github

# 获取 Gitee 远程仓库最新状态
git fetch gitee
```

比较两个仓库的分支差异

```bash
# 比较 master 分支差异
git diff github/master gitee/master
```

### 解决方案

- 方案一：从更新的仓库同步到滞后的仓库

> 假设 Github 上的代码是最新的，需要更新 Gitee

```bash
# 确保本地分支与 Github 同步
git checkout master
git pull github master

# 强制推送到 Gitee
git push -f gitee master
```

- 方案二：合并两个仓库的修改

> 如果两个仓库都有独立的修改，需要合并

```bash
# 创建临时分支
git checkout -b temp_sync_branch

# 合并 Github 上的修改
git pull github master

# 合并 Gitee 上的修改（可能需要解决冲突）
git pull gitee master

# 解决冲突后提交
git add .
git commit -m "合并 Github 和 Gitee 的修改"

# 推送到两个远程仓库
git push github temp_sync_branch:master
git push gitee temp_sync_branch:master

# 切回 master 分支并更新
git checkout master
git pull github master
```

- 方案三：使用镜像克隆刷新

> 对于差异较大的情况，可以使用镜像克隆完全刷新一个仓库

```bash
# 创建临时目录并进入到该目录中
mkdir temp_repo
cd temp_repo

# 镜像克隆最新的仓库（假设 Github 是最新的）
git clone --mirror https://github.com/你的用户名/仓库名称.git

# 进入镜像仓库
cd 仓库名称.git

# 添加 Gitee 为远程仓库
git remote add gitee https://gitee.com/你的用户名/仓库名称.git

# 推送镜像到 Gitee
git push --mirror gitee
```
