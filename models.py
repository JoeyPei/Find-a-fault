# -*- coding: utf-8 -*-

from __future__ import unicode_literals

from datetime import datetime

from django.db import models


class UserRecord(models.Model):
    name = models.CharField("工号", max_length=50)
    time = models.IntegerField("访问时间")
    last_time = models.DateTimeField("访问时间b", auto_created=True)
    try_time = models.IntegerField("尝试次数")
    score = models.IntegerField("最高分数")

    class Meta:
        verbose_name = '游戏用户'
        verbose_name_plural = '游戏用户'
        ordering = ["-score", "last_time"]
