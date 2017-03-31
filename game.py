# -*- coding: utf-8 -*-

CHECK_POINT =[]
USER_RANK = []


class Target:
    def __init__(self, x1, y1, x2, y2):
        self.base_x = x1
        self.base_y = y1
        self.limit_x = x2
        self.limit_y = y2

    def check(self, x, y):
        return self.base_x < x < self.limit_x \
               and self.base_y < y < self.limit_y


class Record:
    def __init__(self, time, score):
        self.time = time
        self.try_time = 1
        self.score = score


def game_check(name, time, points):
    # 判断
    score = 0
    right = []
    wrong = []

    # 加入记录
    if USER_RANK[name]:
        if score > USER_RANK[name].score:
            USER_RANK[name].score = score
            USER_RANK[name].time = time
            USER_RANK[name].try_time += 1
    else:
        USER_RANK[name] = Record(time, score)
    return {
            "score": score,
            "right": right,
            "wrong": wrong
            }


def game_rank():
    data = {}
    # sort
    for player in USER_RANK[:20]:
        data[player.name] = player.score
    return data

