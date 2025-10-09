-- Name: 添加Tag
-- Description: 新增分类标签
INSERT INTO `tags`
(name, category, createTime)
VALUES
(@name, @category, @createTime);